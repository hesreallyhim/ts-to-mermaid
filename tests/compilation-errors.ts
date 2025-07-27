// Test file with various compilation errors
// Purpose: Test how the converter handles non-compiling TypeScript
// Created: Testing error recovery and partial parsing capabilities
// Status: Temporary test file - DO NOT DELETE
// 
// This file intentionally contains various TypeScript compilation errors to ensure
// the ts-to-mermaid converter can handle real-world scenarios where code might be
// incomplete, have syntax errors, or reference undefined types. The converter should
// still produce a useful diagram for the parts it can parse.

// Missing type imports (should still work)
interface UserAccount {
  id: string;
  profile: NonExistentType; // Type doesn't exist
  settings: MissingInterface; // Interface not defined
}

// Syntax error in interface (missing closing brace
interface BrokenInterface {
  name: string;
  value: number
  // Missing closing brace

// Another interface that should still parse
interface ValidInterface {
  id: number;
  data: string;
}

// Class with undefined base class
class MyClass extends NonExistentBase {
  prop: string;
  
  constructor() {
    super(); // Will have error
    this.prop = "test";
  }
}

// Interface with syntax errors in property
interface InterfaceWithErrors {
  validProp: string;
  // Invalid syntax below
  broken prop: number; // Space in property name
  another-prop: boolean; // Hyphen in name (actually valid in quotes)
  "quoted-prop": string; // This should work
}

// Type with circular reference (should work)
type Circular = {
  self: Circular;
  value: string;
};

// Enum with duplicate values (TS error but should parse)
enum DuplicateEnum {
  A = 1,
  B = 1, // Duplicate value
  C = 2
}

// Interface extending non-existent interface
interface ExtendsMissing extends MissingBase {
  ownProp: string;
}

// Class implementing non-existent interface
class ImplementsMissing implements MissingInterface {
  someProp: string = "test";
}

// Generic with invalid constraint
interface GenericBroken<T extends NonExistentConstraint> {
  value: T;
}

// Method with wrong syntax
interface MethodErrors {
  // Missing parameter type
  method1(param): void;
  
  // Invalid return type
  method2(): InvalidReturnType;
  
  // Valid method for comparison
  method3(param: string): number;
}

// Type alias with undefined types
type BrokenAlias = UndefinedTypeA | UndefinedTypeB | string;

// Namespace with errors
namespace BrokenNamespace {
  // Missing export keyword but should still be in namespace
  interface InternalInterface {
    prop: string;
  }
  
  export class {  // Missing class name
    value: number;
  }
}

// Interface with computed property (not supported in all TS versions)
const key = "dynamic";
interface ComputedProp {
  [key]: string; // May cause issues
  normalProp: number;
}

// Decorators without proper setup
@nonExistentDecorator
class DecoratedClass {
  @propertyDecorator
  prop: string;
}

// Interface with missing comma
interface MissingComma {
  prop1: string
  prop2: number  // Missing comma
  prop3: boolean
}

// Still include some valid types to ensure partial success
interface ValidUser {
  id: string;
  name: string;
  email: string;
}

interface ValidProduct {
  id: number;
  name: string;
  price: number;
  owner: ValidUser;
}

class ValidService {
  private users: ValidUser[] = [];
  
  addUser(user: ValidUser): void {
    this.users.push(user);
  }
  
  getUser(id: string): ValidUser | undefined {
    return this.users.find(u => u.id === id);
  }
}