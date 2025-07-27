// Test for complex unions requiring note annotations - Rules 5, 11, 12, 13

// Rule 5: Complex mixed unions
type MixedData = string | number | User | { custom: boolean } | null;

// Rule 11: Mixed literal and non-literal unions
type AutoMode = "auto" | number | CustomType;
type LoadingState = "loading" | "error" | Response;

// Rule 12: Template literal types
type EventPattern = `on${Capitalize<string>}`;
type RoutePattern = `/api/${string}/${number}`;
type Prefix<T extends string> = `prefix_${T}`;

// Rule 13: Unions with intersections
type CombinedType = (A & B) | C;
type UserAccess = (BaseUser & Admin) | Guest;
type ConfigOption = (Config & { readonly: true }) | DefaultConfig;

// Function unions
type Handler = ((x: string) => void) | ((x: number) => void);
type AsyncOperation<T> = Promise<T> | (() => Promise<T>);

// Nested unions
type NestedUnion = (string | number) | (User | Admin);
type DeepNested = (A | B) | (C | D) | E;

// Complex conditional types resulting in unions
type ValueOrArray<T> = T | T[];
type Nullable<T> = T | null | undefined;

// Using complex unions in interfaces
interface DataProcessor {
  data: MixedData;
  handler: Handler;
  pattern: EventPattern;
}

// Supporting types
interface User {
  id: string;
  name: string;
}

interface Admin {
  role: string;
  permissions: string[];
}

interface CustomType {
  value: any;
}

interface Response {
  status: number;
  body: string;
}

interface A { a: string; }
interface B { b: number; }
interface C { c: boolean; }
interface D { d: Date; }
interface E { e: Error; }

interface BaseUser {
  id: string;
  name: string;
}

interface Guest {
  sessionId: string;
}

interface Config {
  settings: object;
}

interface DefaultConfig {
  defaults: object;
}