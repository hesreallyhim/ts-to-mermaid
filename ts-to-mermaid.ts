#!/usr/bin/env node
import ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface UnionMetadata {
  kind: 'simple' | 'large' | 'discriminated' | 'complex' | 'primitive';
  values?: string[];
  discriminator?: string;
  isReusable?: boolean;
  rawType?: string;
}

interface TypeInfo {
  name: string;
  kind: 'interface' | 'type' | 'enum' | 'class';
  properties: Property[];
  extends?: string[];
  implements?: string[];
  typeParameters?: string[];
  isUnion?: boolean;
  unionTypes?: string[];
  unionMetadata?: UnionMetadata;
}

interface Property {
  name: string;
  type: string;
  optional: boolean;
  readonly: boolean;
}

interface Relationship {
  from: string;
  to: string;
  type: 'extends' | 'implements' | 'composition' | 'union';
  label?: string;
}

class TypeScriptToMermaid {
  private types: Map<string, TypeInfo> = new Map();
  private relationships: Relationship[] = [];
  private sourceFile: ts.SourceFile;
  private errors: Array<{node?: ts.Node, message: string}> = [];
  private program: ts.Program;
  private notes: Array<{forClass: string, content: string}> = [];
  private unionUsageCount: Map<string, number> = new Map();

  constructor(filePath: string) {
    this.program = ts.createProgram([filePath], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      allowJs: true,
      noEmit: true,
      skipLibCheck: true,
      noResolve: true, // Don't resolve imports
    });

    this.sourceFile = this.program.getSourceFile(filePath)!;

    if (!this.sourceFile) {
      throw new Error(`Could not parse file: ${filePath}`);
    }

    // Collect any diagnostics
    const diagnostics = ts.getPreEmitDiagnostics(this.program, this.sourceFile);
    diagnostics.forEach(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      this.errors.push({ message: `TS${diagnostic.code}: ${message}` });
    });
  }

  analyze(): void {
    try {
      this.visit(this.sourceFile);
      this.detectCompositionRelationships();
      this.detectReusableUnions();
    } catch (error) {
      console.error('Error during analysis:', error);
      this.errors.push({ message: `Analysis error: ${error}` });
      // Continue processing despite errors
    }
  }

  private visit(node: ts.Node): void {
    try {
      if (ts.isInterfaceDeclaration(node)) {
        this.processInterface(node);
      } else if (ts.isTypeAliasDeclaration(node)) {
        this.processTypeAlias(node);
      } else if (ts.isEnumDeclaration(node)) {
        this.processEnum(node);
      } else if (ts.isClassDeclaration(node)) {
        this.processClass(node);
      }
    } catch (error) {
      const nodeName = (node as any).name?.text || 'unknown';
      console.error(`Error processing ${ts.SyntaxKind[node.kind]} '${nodeName}':`, error);
      this.errors.push({ 
        node, 
        message: `Failed to process ${ts.SyntaxKind[node.kind]} '${nodeName}': ${error}` 
      });
      // Continue processing other nodes
    }

    ts.forEachChild(node, (child) => this.visit(child));
  }

  private checkNodeForErrors(node: ts.Node): boolean {
    // Check if the node or its children have syntax errors
    const sourceFile = node.getSourceFile();
    const start = node.getStart();
    const end = node.getEnd();
    
    // Get diagnostics for this specific node range
    const diagnostics = this.program.getSyntacticDiagnostics(sourceFile);
    
    // Also check if this node appears incomplete in the source
    const nodeText = node.getText(sourceFile);
    const openBraces = (nodeText.match(/{/g) || []).length;
    const closeBraces = (nodeText.match(/}/g) || []).length;
    const hasUnmatchedBraces = openBraces !== closeBraces;
    
    const hasDiagnostics = diagnostics.some(diag => {
      if (diag.start === undefined) return false;
      // Check if the diagnostic is within this node's range
      return diag.start >= start && diag.start <= end;
    });
    
    return hasDiagnostics || hasUnmatchedBraces;
  }

  private processInterface(node: ts.InterfaceDeclaration): void {
    if (!node.name) return;
    const name = node.name.text;
    
    // Check if this node has syntax errors
    const hasErrors = this.checkNodeForErrors(node);
    
    const typeInfo: TypeInfo = {
      name: hasErrors ? `${name} [AUTO-FIXED]` : name,
      kind: 'interface',
      properties: [],
      extends: [],
      typeParameters: node.typeParameters?.map(tp => (tp.name as ts.Identifier)?.text).filter(Boolean),
    };

    // Process extends clauses
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          for (const type of clause.types) {
            const extendedType = type.expression.getText(this.sourceFile);
            typeInfo.extends!.push(extendedType);
            this.relationships.push({
              from: name,
              to: extendedType,
              type: 'extends',
            });
          }
        }
      }
    }

    // Process properties
    node.members.forEach((member) => {
      if (ts.isPropertySignature(member) && member.name) {
        const propName = member.name.getText(this.sourceFile);
        const propType = member.type ? this.getTypeStringForProperty(member.type) : 'any';

        typeInfo.properties.push({
          name: propName,
          type: propType,
          optional: !!member.questionToken,
          readonly: !!member.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword),
        });
      }
    });

    // Use original name as key for relationships to work correctly
    const originalName = name.replace(' [AUTO-FIXED]', '');
    this.types.set(originalName, typeInfo);
  }

  private processTypeAlias(node: ts.TypeAliasDeclaration): void {
    if (!node.name) return;
    const name = node.name.text;
    const hasErrors = this.checkNodeForErrors(node);
    
    const typeInfo: TypeInfo = {
      name: hasErrors ? `${name} [AUTO-FIXED]` : name,
      kind: 'type',
      properties: [],
      typeParameters: node.typeParameters?.map(tp => (tp.name as ts.Identifier)?.text).filter(Boolean),
    };

    // Handle union types
    if (ts.isUnionTypeNode(node.type)) {
      typeInfo.isUnion = true;
      typeInfo.unionTypes = node.type.types.map(t => this.getTypeString(t));
      
      // Classify the union type
      typeInfo.unionMetadata = this.classifyUnion(node.type);

      // For discriminated unions, create separate types for each variant
      if (typeInfo.unionMetadata.kind === 'discriminated' && typeInfo.unionMetadata.discriminator) {
        this.processDiscriminatedUnion(name, node.type, typeInfo.unionMetadata.discriminator);
        // Don't add the union type itself to the types map
        return;
      }

      // Skip creating union relationships since we're rendering as enumeration
      // This keeps the diagram cleaner
    }
    // Handle object type literals
    else if (ts.isTypeLiteralNode(node.type)) {
      node.type.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name) {
          const propName = member.name.getText(this.sourceFile);
          const propType = member.type ? this.getTypeStringForProperty(member.type) : 'any';

          typeInfo.properties.push({
            name: propName,
            type: propType,
            optional: !!member.questionToken,
            readonly: !!member.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword),
          });
        }
      });
    }
    // Handle type references
    else if (ts.isTypeReferenceNode(node.type)) {
      const refType = this.getTypeString(node.type);
      typeInfo.properties.push({
        name: 'value',
        type: refType,
        optional: false,
        readonly: false,
      });
    }
    // Handle template literal types as complex
    else if (ts.isTemplateLiteralTypeNode(node.type)) {
      typeInfo.isUnion = true;
      typeInfo.unionTypes = [this.getTypeString(node.type)];
      typeInfo.unionMetadata = {
        kind: 'complex',
        rawType: this.getTypeString(node.type)
      };
    }

    // Use original name as key for relationships to work correctly
    const originalName = name.replace(' [AUTO-FIXED]', '');
    this.types.set(originalName, typeInfo);
  }

  private processEnum(node: ts.EnumDeclaration): void {
    if (!node.name) return;
    const name = node.name.text;
    const hasErrors = this.checkNodeForErrors(node);
    
    const typeInfo: TypeInfo = {
      name: hasErrors ? `${name} [AUTO-FIXED]` : name,
      kind: 'enum',
      properties: [],
    };

    node.members.forEach((member) => {
      const memberName = member.name?.getText(this.sourceFile) || '';
      const memberValue = member.initializer?.getText(this.sourceFile) || '';

      typeInfo.properties.push({
        name: memberName,
        type: memberValue || 'number',
        optional: false,
        readonly: true,
      });
    });

    // Use original name as key for relationships to work correctly
    const originalName = name.replace(' [AUTO-FIXED]', '');
    this.types.set(originalName, typeInfo);
  }

  private processClass(node: ts.ClassDeclaration): void {
    if (!node.name) return;

    const name = node.name.text;
    const hasErrors = this.checkNodeForErrors(node);
    
    const typeInfo: TypeInfo = {
      name: hasErrors ? `${name} [AUTO-FIXED]` : name,
      kind: 'class',
      properties: [],
      extends: [],
      implements: [],
      typeParameters: node.typeParameters?.map(tp => (tp.name as ts.Identifier)?.text).filter(Boolean),
    };

    // Process heritage clauses
    if (node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          for (const type of clause.types) {
            const extendedType = type.expression.getText(this.sourceFile);
            typeInfo.extends!.push(extendedType);
            this.relationships.push({
              from: name,
              to: extendedType,
              type: 'extends',
            });
          }
        } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
          for (const type of clause.types) {
            const implementedType = type.expression.getText(this.sourceFile);
            typeInfo.implements!.push(implementedType);
            this.relationships.push({
              from: name,
              to: implementedType,
              type: 'implements',
            });
          }
        }
      }
    }

    // Process members
    node.members.forEach((member) => {
      if (ts.isPropertyDeclaration(member) && member.name) {
        const propName = member.name.getText(this.sourceFile);
        const propType = member.type ? this.getTypeStringForProperty(member.type) : 'any';

        typeInfo.properties.push({
          name: propName,
          type: propType,
          optional: !!member.questionToken,
          readonly: !!member.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword),
        });
      }
    });

    // Use original name as key for relationships to work correctly
    const originalName = name.replace(' [AUTO-FIXED]', '');
    this.types.set(originalName, typeInfo);
  }

  private getTypeString(typeNode: ts.TypeNode): string {
    if (ts.isTypeReferenceNode(typeNode)) {
      const typeName = typeNode.typeName.getText(this.sourceFile);
      // Handle array types
      if (typeNode.typeArguments && typeNode.typeArguments.length > 0) {
        const args = typeNode.typeArguments.map(arg => this.getTypeString(arg)).join(', ');
        return `${typeName}<${args}>`;
      }
      return typeName;
    } else if (ts.isArrayTypeNode(typeNode)) {
      return `${this.getTypeString(typeNode.elementType)}[]`;
    } else if (ts.isUnionTypeNode(typeNode)) {
      return typeNode.types.map(t => this.getTypeString(t)).join(' | ');
    } else if (ts.isIntersectionTypeNode(typeNode)) {
      return typeNode.types.map(t => this.getTypeString(t)).join(' & ');
    } else if (ts.isLiteralTypeNode(typeNode)) {
      return typeNode.literal.getText(this.sourceFile);
    } else if (ts.isFunctionTypeNode(typeNode)) {
      return 'Function';
    } else if (ts.isTypeLiteralNode(typeNode)) {
      return 'Object';
    }

    return typeNode.getText(this.sourceFile);
  }

  private getTypeStringForProperty(typeNode: ts.TypeNode): string {
    // Special handling for unions in properties - apply inline annotation rules
    if (ts.isUnionTypeNode(typeNode)) {
      const metadata = this.classifyUnion(typeNode);
      
      if (metadata.kind === 'simple' || metadata.kind === 'primitive') {
        // Inline simple unions directly in property type
        return typeNode.types.map(t => this.getTypeString(t)).join(' | ');
      } else if (metadata.kind === 'complex') {
        // For complex unions in properties, we'll use a placeholder and add a note
        // This will be handled later when we process the containing type
        return 'ComplexUnion';
      } else {
        // For other unions (large, discriminated), use regular string representation
        return this.getTypeString(typeNode);
      }
    }
    
    return this.getTypeString(typeNode);
  }

  private detectCompositionRelationships(): void {
    for (const [typeName, typeInfo] of this.types) {
      for (const prop of typeInfo.properties) {
        const cleanType = this.extractBaseType(prop.type);

        if (this.isCustomType(cleanType) && cleanType !== typeName) {
          // Check if relationship already exists (from extends/implements)
          const exists = this.relationships.some(
            r => r.from === typeName && r.to === cleanType && (r.type === 'extends' || r.type === 'implements')
          );

          if (!exists) {
            this.relationships.push({
              from: typeName,
              to: cleanType,
              type: 'composition',
              label: prop.name,
            });
          }
        }
      }
    }
  }

  private extractBaseType(type: string): string {
    // Remove array notation
    type = type.replace(/\[\]$/, '');

    // Extract from generics (e.g., Array<User> -> User)
    const genericMatch = type.match(/^(?:Array|Promise|Observable|Subject|BehaviorSubject|ReplaySubject)<(.+)>$/);
    if (genericMatch) {
      return genericMatch[1];
    }

    // Handle union types - return first custom type found
    if (type.includes(' | ')) {
      const unionTypes = type.split(' | ').map(t => t.trim());
      for (const unionType of unionTypes) {
        if (this.isCustomType(unionType)) {
          return unionType;
        }
      }
    }

    return type;
  }

  private isCustomType(type: string): boolean {
    const builtInTypes = new Set([
      'string', 'number', 'boolean', 'any', 'unknown', 'void', 'never',
      'object', 'Object', 'Function', 'null', 'undefined', 'symbol',
      'bigint', 'Date', 'RegExp', 'Error', 'Array', 'Map', 'Set',
      'Promise', 'WeakMap', 'WeakSet'
    ]);

    return !builtInTypes.has(type) && !type.match(/^['"].*['"]$/);
  }

  private classifyUnion(unionNode: ts.UnionTypeNode): UnionMetadata {
    const unionTypes = unionNode.types;
    const typeStrings = unionTypes.map(t => this.getTypeString(t));
    
    // Check for template literals or intersections -> complex
    const hasTemplateLiteral = unionTypes.some(t => ts.isTemplateLiteralTypeNode(t));
    const hasIntersection = unionTypes.some(t => ts.isIntersectionTypeNode(t));
    if (hasTemplateLiteral || hasIntersection) {
      return {
        kind: 'complex',
        rawType: this.getTypeString(unionNode)
      };
    }

    // Check for mixed literals and non-literals -> complex
    const literals = unionTypes.filter(t => 
      ts.isLiteralTypeNode(t) || 
      (ts.isTypeReferenceNode(t) && ['true', 'false', 'null', 'undefined'].includes(t.typeName.getText(this.sourceFile)))
    );
    const nonLiterals = unionTypes.filter(t => 
      !ts.isLiteralTypeNode(t) && 
      !(ts.isTypeReferenceNode(t) && ['true', 'false', 'null', 'undefined'].includes(t.typeName.getText(this.sourceFile)))
    );
    
    if (literals.length > 0 && nonLiterals.length > 0) {
      // Check if it's just primitives (string | number | boolean)
      const allPrimitives = typeStrings.every(t => 
        ['string', 'number', 'boolean', 'null', 'undefined'].includes(t) ||
        t.match(/^['"].*['"]$/) || t.match(/^\d+$/)
      );
      
      if (!allPrimitives) {
        return {
          kind: 'complex',
          rawType: this.getTypeString(unionNode)
        };
      }
    }

    // Check for discriminated unions (all members are object types with common property)
    const objectTypes = unionTypes.filter(t => ts.isTypeLiteralNode(t));
    if (objectTypes.length === unionTypes.length && objectTypes.length > 1) {
      // Find common properties
      const commonProps = this.findCommonDiscriminatorProperty(objectTypes as ts.TypeLiteralNode[]);
      if (commonProps) {
        return {
          kind: 'discriminated',
          discriminator: commonProps,
          values: typeStrings
        };
      }
    }

    // Count literal values
    const literalCount = literals.length;
    
    // Simple literals (≤ 5 values)
    if (literalCount <= 5 && literalCount === unionTypes.length) {
      return {
        kind: 'simple',
        values: typeStrings
      };
    }
    
    // Large literals (> 5 values)
    if (literalCount > 5 && literalCount === unionTypes.length) {
      return {
        kind: 'large',
        values: typeStrings
      };
    }

    // Primitive unions (string | number, etc.)
    const allPrimitiveTypes = typeStrings.every(t => 
      ['string', 'number', 'boolean', 'null', 'undefined', 'symbol', 'bigint'].includes(t)
    );
    if (allPrimitiveTypes) {
      return {
        kind: 'primitive',
        values: typeStrings
      };
    }

    // Default to complex for everything else
    return {
      kind: 'complex',
      rawType: this.getTypeString(unionNode)
    };
  }

  private findCommonDiscriminatorProperty(objectTypes: ts.TypeLiteralNode[]): string | null {
    if (objectTypes.length === 0) return null;
    
    // Get properties from first object
    const firstObjectProps = new Map<string, ts.TypeNode>();
    objectTypes[0].members.forEach(member => {
      if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name) && member.type) {
        firstObjectProps.set(member.name.text, member.type);
      }
    });

    // Find properties that exist in all objects with literal values
    for (const [propName] of firstObjectProps) {
      let isDiscriminator = true;
      const discriminatorValues = new Set<string>();

      // Check if this property exists in all objects with a literal type
      for (const objType of objectTypes) {
        let foundProp = false;
        
        objType.members.forEach(member => {
          if (ts.isPropertySignature(member) && 
              member.name && 
              ts.isIdentifier(member.name) && 
              member.name.text === propName &&
              member.type) {
            foundProp = true;
            
            // Check if it's a literal type
            if (ts.isLiteralTypeNode(member.type)) {
              const value = member.type.literal.getText(this.sourceFile);
              discriminatorValues.add(value);
            } else {
              isDiscriminator = false;
            }
          }
        });

        if (!foundProp) {
          isDiscriminator = false;
          break;
        }
      }

      // Valid discriminator if all objects have this property with unique literal values
      if (isDiscriminator && discriminatorValues.size === objectTypes.length) {
        return propName;
      }
    }

    return null;
  }

  private processDiscriminatedUnion(baseName: string, unionNode: ts.UnionTypeNode, discriminator: string): void {
    // Create the base interface with the discriminator property
    const baseTypeInfo: TypeInfo = {
      name: baseName,
      kind: 'interface',
      properties: [{
        name: discriminator,
        type: 'string',
        optional: false,
        readonly: false
      }]
    };
    this.types.set(baseName, baseTypeInfo);

    // Process each variant
    unionNode.types.forEach((variantType, index) => {
      if (ts.isTypeLiteralNode(variantType)) {
        let variantName = '';
        let discriminatorValue = '';

        // Find the discriminator value
        variantType.members.forEach(member => {
          if (ts.isPropertySignature(member) && 
              member.name && 
              ts.isIdentifier(member.name) && 
              member.name.text === discriminator &&
              member.type &&
              ts.isLiteralTypeNode(member.type)) {
            discriminatorValue = member.type.literal.getText(this.sourceFile).replace(/['"]/g, '');
            // Generate variant name from discriminator value
            variantName = discriminatorValue.charAt(0).toUpperCase() + discriminatorValue.slice(1) + baseName;
          }
        });

        if (!variantName) {
          variantName = `${baseName}Variant${index + 1}`;
        }

        // Create the variant type
        const variantTypeInfo: TypeInfo = {
          name: variantName,
          kind: 'interface',
          properties: []
        };

        // Add all properties from the variant
        variantType.members.forEach(member => {
          if (ts.isPropertySignature(member) && member.name) {
            const propName = member.name.getText(this.sourceFile);
            let propType = member.type ? this.getTypeStringForProperty(member.type) : 'any';
            
            // For the discriminator property, use the literal value
            if (propName === discriminator && discriminatorValue) {
              propType = `"${discriminatorValue}"`;
            }

            variantTypeInfo.properties.push({
              name: propName,
              type: propType,
              optional: !!member.questionToken,
              readonly: !!member.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword),
            });
          }
        });

        this.types.set(variantName, variantTypeInfo);

        // Add implementation relationship
        this.relationships.push({
          from: variantName,
          to: baseName,
          type: 'implements'
        });
      }
    });
  }

  generateMermaid(): string {
    const lines: string[] = ['classDiagram'];

    // Add legend/key
    lines.push('  %% Legend');
    lines.push('  %% --|> : Inheritance (extends)');
    lines.push('  %% ..|> : Implementation (implements)');
    lines.push('  %% --* : Composition (has/contains)');
    lines.push('  %% -- : Association');
    lines.push('');

    // Add error summary if there were errors
    if (this.errors.length > 0) {
      lines.push('  %% Errors encountered during conversion:');
      this.errors.slice(0, 5).forEach(err => {
        lines.push(`  %% - ${err.message.replace(/\n/g, ' ')}`);
      });
      if (this.errors.length > 5) {
        lines.push(`  %% ... and ${this.errors.length - 5} more errors`);
      }
      lines.push('');
    }
    
    // Check if any types were auto-fixed
    const autoFixedTypes = Array.from(this.types.values()).filter(t => t.name.includes('[AUTO-FIXED]'));
    if (autoFixedTypes.length > 0) {
      lines.push('  %% WARNING: The following types had syntax errors and were auto-recovered by the TypeScript parser:');
      autoFixedTypes.forEach(type => {
        const originalName = type.name.replace(' [AUTO-FIXED]', '');
        lines.push(`  %% - ${originalName}: Missing closing brace or other syntax error was automatically fixed`);
      });
      lines.push('  %% These auto-fixes may not reflect the intended structure!');
      lines.push('');
    }

    // Generate class definitions
    for (const [, typeInfo] of this.types) {
      // Remove [AUTO-FIXED] marker for the class name
      const className = typeInfo.name.replace(' [AUTO-FIXED]', '');
      const isAutoFixed = typeInfo.name.includes('[AUTO-FIXED]');
      
      lines.push(`  class ${className} {`);

      // Add type kind annotation
      if (typeInfo.kind === 'interface') {
        lines.push(`    <<interface>>`);
      } else if (typeInfo.kind === 'enum') {
        lines.push(`    <<enumeration>>`);
      } else if (typeInfo.kind === 'type' && typeInfo.isUnion) {
        lines.push(`    <<enumeration>>`);
      } else if (typeInfo.kind === 'class') {
        lines.push(`    <<class>>`);
      }
      
      // Add AUTO-FIXED warning with emoji
      if (isAutoFixed) {
        lines.push(`    ⚠️ AUTO-FIXED ⚠️`);
      }

      // Add properties or union members
      if (typeInfo.isUnion && typeInfo.unionTypes && typeInfo.unionMetadata) {
        // Check if this is a reusable union
        if (typeInfo.unionMetadata.isReusable) {
          // For reusable unions, add stereotype and show union inline
          lines.push(`    <<type>>`);
          const inlineUnion = typeInfo.unionTypes.join(' | ');
          lines.push(`    ${inlineUnion}`);
        } else {
          // Handle different union types based on classification
          switch (typeInfo.unionMetadata.kind) {
            case 'simple':
            case 'primitive': {
              // For simple/primitive unions, show inline in type definition
              const inlineUnion = typeInfo.unionTypes.join(' | ');
              lines.push(`    ${inlineUnion}`);
              break;
            }
              
            case 'large':
              // For large unions, use enumeration
              for (const unionType of typeInfo.unionTypes) {
                lines.push(`    ${unionType}`);
              }
              break;
              
            case 'discriminated':
              // For discriminated unions, we'll handle them differently
              // For now, show as enumeration until we implement full support
              for (const unionType of typeInfo.unionTypes) {
                lines.push(`    ${unionType}`);
              }
              break;
              
            case 'complex': {
              // For complex unions, add a placeholder property and create a note
              const complexUnionName = typeInfo.name;
              lines.push(`    +value: ${complexUnionName}`);
              
              // Add note with the full union definition
              if (typeInfo.unionMetadata.rawType) {
                this.notes.push({
                  forClass: className,
                  content: `${complexUnionName} = ${typeInfo.unionMetadata.rawType}`
                });
              }
              break;
            }
          }
        }
      } else if (typeInfo.isUnion && typeInfo.unionTypes) {
        // Fallback for unions without metadata (shouldn't happen)
        for (const unionType of typeInfo.unionTypes) {
          lines.push(`    ${unionType}`);
        }
      } else {
        // Regular properties
        for (const prop of typeInfo.properties) {
          const modifier = prop.readonly ? '+' : prop.optional ? '-' : '+';
          const optional = prop.optional ? '?' : '';
          lines.push(`    ${modifier}${prop.name}${optional}: ${this.sanitizeType(prop.type)}`);
        }
      }

      lines.push(`  }`);
      lines.push('');
    }

    // Generate relationships
    const relationshipMap = {
      extends: '--|>',
      implements: '..|>',
      composition: '--*',
      union: '--|',
    };

    for (const rel of this.relationships) {
      if (this.types.has(rel.to)) {
        const arrow = relationshipMap[rel.type];
        const label = rel.label ? ` : ${rel.label}` : '';
        lines.push(`  ${rel.from} ${arrow} ${rel.to}${label}`);
      }
    }
    
    // Generate notes for complex unions
    if (this.notes.length > 0) {
      lines.push('');
      for (const note of this.notes) {
        lines.push(`  note for ${note.forClass} "${note.content}"`);
      }
    }

    return lines.join('\n');
  }

  private sanitizeType(type: string): string {
    // Escape special characters for Mermaid
    return type
      .replace(/</g, '~')
      .replace(/>/g, '~')
      .replace(/\|/g, 'or')
      .replace(/&/g, 'and')
      .replace(/\[/g, 'Array~')
      .replace(/\]/g, '~');
  }

  private detectReusableUnions(): void {
    // First pass: count union usage across all properties
    for (const [, typeInfo] of this.types) {
      for (const prop of typeInfo.properties) {
        // Check if property type is a union type alias
        if (this.types.has(prop.type)) {
          const propTypeInfo = this.types.get(prop.type);
          if (propTypeInfo?.isUnion && propTypeInfo.unionTypes) {
            const unionKey = propTypeInfo.unionTypes.sort().join('|');
            this.unionUsageCount.set(unionKey, (this.unionUsageCount.get(unionKey) || 0) + 1);
          }
        }
      }
    }

    // Second pass: mark unions used more than once as reusable
    for (const [, typeInfo] of this.types) {
      if (typeInfo.isUnion && typeInfo.unionTypes && typeInfo.unionMetadata) {
        const unionKey = typeInfo.unionTypes.sort().join('|');
        const usageCount = this.unionUsageCount.get(unionKey) || 0;
        
        // Mark as reusable if used more than once
        if (usageCount > 1) {
          typeInfo.unionMetadata.isReusable = true;
        }
      }
    }
  }
}

// Main execution
export function convertTypeScriptToMermaid(filePath: string): string {
  try {
    const converter = new TypeScriptToMermaid(filePath);
    converter.analyze();
    return converter.generateMermaid();
  } catch (error) {
    throw new Error(`Failed to convert TypeScript to Mermaid: ${error}`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: ts-node ts-to-mermaid.ts <path-to-typescript-file> [--save [output-directory]]');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const mermaidDiagram = convertTypeScriptToMermaid(filePath);
    console.log(mermaidDiagram);

    // Optionally save to file
    const saveIndex = args.indexOf('--save');
    if (saveIndex !== -1) {
      let outputPath: string;
      
      // Check if a directory was specified after --save
      if (saveIndex + 1 < args.length && !args[saveIndex + 1].startsWith('--')) {
        const outputDir = path.resolve(args[saveIndex + 1]);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Generate output filename in the specified directory
        const basename = path.basename(filePath).replace(/\.ts$/, '.mermaid');
        outputPath = path.join(outputDir, basename);
      } else {
        // Default behavior: save in the same directory as the input file
        outputPath = filePath.replace(/\.ts$/, '.mermaid');
      }
      
      fs.writeFileSync(outputPath, mermaidDiagram);
      console.log(`\nSaved to: ${outputPath}`);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
