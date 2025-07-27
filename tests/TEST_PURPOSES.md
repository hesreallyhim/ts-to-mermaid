# TypeScript to Mermaid Test Files Documentation

## Overview
This document describes the purpose of each test file in the test suite for the TypeScript to Mermaid converter.

## Existing Test Files

### 1. **basic-types.ts**
- **Purpose**: Tests fundamental TypeScript constructs
- **Coverage**: 
  - Interfaces with basic properties
  - Classes implementing interfaces
  - Enums with string values
  - Inheritance relationships (extends)
  - Implementation relationships (implements)
  - Composition relationships
  - Optional and readonly modifiers
  - Arrays as property types

### 2. **relationships.ts**
- **Purpose**: Tests complex type relationships and inheritance patterns
- **Coverage**:
  - Multiple interface inheritance
  - Class inheritance chains
  - Generic interfaces and classes
  - Abstract classes
  - Composition with nested objects
  - Type aliases for object types
  - Union types in properties
  - Complex relationship graphs

### 3. **generic-types.ts**
- **Purpose**: Tests generic type handling
- **Coverage**:
  - Simple generic interfaces
  - Multi-parameter generics
  - Generic constraints (extends)
  - Generic classes
  - Generic type aliases
  - Nested generic types
  - Default generic parameters
  - Concrete implementations of generic interfaces

### 4. **union-types.ts**
- **Purpose**: Tests union type representation
- **Coverage**:
  - String literal unions
  - Number literal unions
  - Mixed type unions
  - Union types with null/undefined
  - Complex object unions
  - Nested unions
  - Union types used in interfaces and classes

### 5. **comments-test.ts**
- **Purpose**: Tests handling of various comment styles
- **Coverage**:
  - JSDoc comments
  - Single-line comments
  - Multi-line comments
  - Deprecated annotations
  - Comments on properties
  - Comments on types and interfaces

### 6. **test-exports.ts**
- **Purpose**: Tests export syntax handling
- **Coverage**:
  - Named exports
  - Default exports
  - Export statements
  - Re-exports
  - Various export syntaxes

### 7. **schema.ts**
- **Purpose**: Tests a real-world complex schema (JSON-RPC types)
- **Coverage**:
  - Large-scale type definitions
  - Complex nested interfaces
  - Type unions and intersections
  - Constants and literal types
  - Optional properties
  - Documentation comments

## Proposed New Test Files

### 1. **intersection-types.ts**
- **Purpose**: Test intersection type handling
- **Rationale**: The converter currently handles unions but intersection types need dedicated testing
- **Expected Output**: Should show combined properties from intersected types

### 2. **method-signatures.ts**
- **Purpose**: Test method signatures in interfaces and classes
- **Rationale**: Current tests focus on properties but methods are also important
- **Expected Output**: Methods should appear with proper signatures in the diagram

### 3. **namespace-modules.ts**
- **Purpose**: Test namespace and module declarations
- **Rationale**: TypeScript namespaces and modules are common organizational patterns
- **Expected Output**: Nested type structures within namespaces

### 4. **mapped-conditional-types.ts**
- **Purpose**: Test advanced TypeScript features like mapped and conditional types
- **Rationale**: These are powerful TypeScript features that should be represented
- **Expected Output**: Simplified representation of complex type transformations

### 5. **circular-dependencies.ts**
- **Purpose**: Test handling of circular type dependencies
- **Rationale**: Real codebases often have circular dependencies that need proper handling
- **Expected Output**: Diagram should handle cycles without infinite loops

## Validation Strategy

For each test file:
1. Run the converter on the test TypeScript file
2. Compare output with expected `.mermaid` file in `outputs/` directory
3. Verify the diagram renders correctly in a Mermaid viewer
4. Check that all types, relationships, and modifiers are properly represented