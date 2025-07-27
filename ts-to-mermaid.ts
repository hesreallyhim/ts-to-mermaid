import ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface TypeInfo {
  name: string;
  kind: 'interface' | 'type' | 'enum' | 'class';
  properties: Property[];
  extends?: string[];
  implements?: string[];
  typeParameters?: string[];
  isUnion?: boolean;
  unionTypes?: string[];
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

  constructor(filePath: string) {
    const program = ts.createProgram([filePath], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
    });

    this.sourceFile = program.getSourceFile(filePath)!;

    if (!this.sourceFile) {
      throw new Error(`Could not parse file: ${filePath}`);
    }
  }

  analyze(): void {
    try {
      this.visit(this.sourceFile);
      this.detectCompositionRelationships();
    } catch (error) {
      console.error('Error during analysis:', error);
      throw error;
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
      console.error('Error processing node:', node.kind, error);
      throw error;
    }

    ts.forEachChild(node, (child) => this.visit(child));
  }

  private processInterface(node: ts.InterfaceDeclaration): void {
    if (!node.name) return;
    const name = node.name.text;
    const typeInfo: TypeInfo = {
      name,
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
        const propType = member.type ? this.getTypeString(member.type) : 'any';

        typeInfo.properties.push({
          name: propName,
          type: propType,
          optional: !!member.questionToken,
          readonly: !!member.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword),
        });
      }
    });

    this.types.set(name, typeInfo);
  }

  private processTypeAlias(node: ts.TypeAliasDeclaration): void {
    if (!node.name) return;
    const name = node.name.text;
    const typeInfo: TypeInfo = {
      name,
      kind: 'type',
      properties: [],
      typeParameters: node.typeParameters?.map(tp => (tp.name as ts.Identifier)?.text).filter(Boolean),
    };

    // Handle union types
    if (ts.isUnionTypeNode(node.type)) {
      typeInfo.isUnion = true;
      typeInfo.unionTypes = node.type.types.map(t => this.getTypeString(t));

      // Skip creating union relationships since we're rendering as enumeration
      // This keeps the diagram cleaner
    }
    // Handle object type literals
    else if (ts.isTypeLiteralNode(node.type)) {
      node.type.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name) {
          const propName = member.name.getText(this.sourceFile);
          const propType = member.type ? this.getTypeString(member.type) : 'any';

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

    this.types.set(name, typeInfo);
  }

  private processEnum(node: ts.EnumDeclaration): void {
    if (!node.name) return;
    const name = node.name.text;
    const typeInfo: TypeInfo = {
      name,
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

    this.types.set(name, typeInfo);
  }

  private processClass(node: ts.ClassDeclaration): void {
    if (!node.name) return;

    const name = node.name.text;
    const typeInfo: TypeInfo = {
      name,
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
        const propType = member.type ? this.getTypeString(member.type) : 'any';

        typeInfo.properties.push({
          name: propName,
          type: propType,
          optional: !!member.questionToken,
          readonly: !!member.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword),
        });
      }
    });

    this.types.set(name, typeInfo);
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

  generateMermaid(): string {
    const lines: string[] = ['classDiagram'];

    // Add legend/key
    lines.push('  %% Legend');
    lines.push('  %% --|> : Inheritance (extends)');
    lines.push('  %% ..|> : Implementation (implements)');
    lines.push('  %% --* : Composition (has/contains)');
    lines.push('  %% -- : Association');
    lines.push('');

    // Generate class definitions
    for (const [name, typeInfo] of this.types) {
      lines.push(`  class ${name} {`);

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

      // Add properties or union members
      if (typeInfo.isUnion && typeInfo.unionTypes) {
        // For unions, display members as enum values
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
