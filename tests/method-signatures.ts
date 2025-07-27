// Test file for method signatures
// Tests: methods in interfaces, classes, optional methods, overloads, generic methods

// Interface with various method signatures
interface Calculator {
  // Simple methods
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  
  // Method with optional parameters
  multiply(a: number, b?: number): number;
  
  // Method with rest parameters
  sum(...numbers: number[]): number;
  
  // Method returning void
  clear(): void;
  
  // Method returning Promise
  calculateAsync(expression: string): Promise<number>;
  
  // Optional method
  debug?(): void;
}

// Interface with generic methods
interface DataProcessor<T> {
  process(data: T): T;
  transform<U>(data: T, transformer: (item: T) => U): U;
  batch(items: T[]): T[];
  filter(predicate: (item: T) => boolean): T[];
}

// Class with method implementations
class BasicCalculator implements Calculator {
  private memory: number = 0;
  
  add(a: number, b: number): number {
    return a + b;
  }
  
  subtract(a: number, b: number): number {
    return a - b;
  }
  
  multiply(a: number, b: number = 1): number {
    return a * b;
  }
  
  sum(...numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0);
  }
  
  clear(): void {
    this.memory = 0;
  }
  
  async calculateAsync(expression: string): Promise<number> {
    // Simulated async calculation
    return Promise.resolve(eval(expression));
  }
  
  // Private method
  private validate(value: number): boolean {
    return !isNaN(value) && isFinite(value);
  }
  
  // Protected method
  protected getMemory(): number {
    return this.memory;
  }
  
  // Static method
  static createDefault(): BasicCalculator {
    return new BasicCalculator();
  }
}

// Type with function properties
type MathOperations = {
  // Function properties (not methods)
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
  // Function with multiple signatures (overload)
  convert: {
    (value: number, to: "string"): string;
    (value: string, to: "number"): number;
  };
};

// Interface with method overloads
interface Converter {
  convert(value: string): number;
  convert(value: number): string;
  convert(value: boolean): string;
  convert(value: any): any;
}

// Abstract class with abstract methods
abstract class BaseService {
  protected serviceName: string;
  
  constructor(name: string) {
    this.serviceName = name;
  }
  
  // Abstract methods
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  
  // Concrete method
  getName(): string {
    return this.serviceName;
  }
  
  // Protected abstract method
  protected abstract validateConnection(): boolean;
}

// Interface with callable signature
interface Callable {
  (message: string): void;
  id: string;
  timestamp: Date;
}

// Interface mixing properties and methods
interface Component {
  id: string;
  name: string;
  
  // Lifecycle methods
  init(): void;
  render(): string;
  destroy(): void;
  
  // Event handlers
  onClick?(event: MouseEvent): void;
  onFocus?(event: FocusEvent): void;
  
  // Getter/setter style
  getValue(): any;
  setValue(value: any): void;
}

// Generic class with methods
class Collection<T> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  remove(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }
  
  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }
  
  map<U>(mapper: (item: T) => U): U[] {
    return this.items.map(mapper);
  }
}