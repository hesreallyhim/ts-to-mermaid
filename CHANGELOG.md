# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-28

### Added
- Initial release of TypeScript to Mermaid converter
- TypeScript AST parsing using TypeScript Compiler API
- Intelligent union type classification and handling
  - Simple unions (≤5 values) rendered inline
  - Large unions (>5 values) as enumeration classes
  - Discriminated unions as inheritance hierarchies
  - Complex unions with note annotations
- Support for interfaces, type aliases, classes, and enums
- Detection of inheritance, implementation, and composition relationships
- Reusable union type detection with dual stereotypes
- Error recovery for files with syntax errors
- CLI tool with console and file output options
- Comprehensive test suite with various TypeScript patterns
- Full documentation with examples

### Features
- 🔍 Analyzes TypeScript files using the TypeScript Compiler API
- 🏗️ Detects inheritance, implementation, and composition relationships
- 📊 Generates clean Mermaid class diagram syntax
- 🎯 Smart union type handling based on complexity
- 🔄 Detects and visualizes discriminated unions as inheritance hierarchies
- 📝 Inline annotations for simple unions (≤5 values)
- ⚠️ Continues processing files with syntax errors and marks auto-fixed types
- 📦 Single file solution with minimal dependencies

[1.0.0]: https://github.com/hesreallyhim/ts-to-mermaid/releases/tag/v1.0.0