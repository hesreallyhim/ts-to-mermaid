// Test file for generic types
// Tests: generic interfaces, generic classes, generic type aliases, constraints

// Simple generic interface
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(val: T): void;
}

// Generic interface with multiple type parameters
interface Pair<K, V> {
  key: K;
  value: V;
}

// Generic interface with constraints
interface NumberContainer<T extends number> {
  value: T;
  add(other: T): T;
}

// Generic type alias
type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Generic type with default
type Optional<T = string> = T | undefined;

// Generic class
class Stack<T> {
  private items: T[];
  
  constructor() {
    this.items = [];
  }
  
  push(item: T): void {
    this.items.push(item);
  }
  
  pop(): T | undefined {
    return this.items.pop();
  }
  
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Generic class with constraints
class NumericStack<T extends number> extends Stack<T> {
  sum(): number {
    let total = 0;
    // Use public methods instead of accessing private items
    const temp: T[] = [];
    while (!this.isEmpty()) {
      const item = this.pop();
      if (item !== undefined) {
        temp.push(item);
        total += item;
      }
    }
    // Restore items
    temp.reverse().forEach(item => this.push(item));
    return total;
  }
}

// Interface using generic types
interface DataStore {
  users: Container<User>;
  settings: Pair<string, any>[];
  cache: Stack<string>;
}

// Non-generic types for testing relationships
interface User {
  id: string;
  name: string;
  email: string;
}

// Generic function type
type Mapper<T, U> = (item: T) => U;

// Nested generics
type NestedContainer<T> = Container<Container<T>>;
type Matrix<T> = T[][];

// Generic with union constraint
interface StringOrNumberContainer<T extends string | number> {
  value: T;
  stringify(): string;
}

// Usage example with concrete types
class UserRepository implements Container<User> {
  private user: User;
  
  constructor(user: User) {
    this.user = user;
  }
  
  get value(): User {
    return this.user;
  }
  
  getValue(): User {
    return this.user;
  }
  
  setValue(val: User): void {
    this.user = val;
  }
}