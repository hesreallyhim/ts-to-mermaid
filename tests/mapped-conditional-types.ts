// Test file for mapped and conditional types
// Tests: mapped types, conditional types, utility types, template literal types

// Basic mapped type
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// Interface to apply mapped types to
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Applied mapped types
type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
type NullableUser = Nullable<User>;

// Key remapping
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;

// Conditional types
type IsString<T> = T extends string ? true : false;
type IsNumber<T> = T extends number ? true : false;

// Extract and Exclude patterns
type Extract<T, U> = T extends U ? T : never;
type Exclude<T, U> = T extends U ? never : T;

type StringsOnly = Extract<string | number | boolean, string>;
type NotString = Exclude<string | number | boolean, string>;

// Conditional type with inference
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// Example function types
type ExampleFunc = (a: string, b: number) => boolean;
type FuncReturn = ReturnType<ExampleFunc>;
type FuncParams = Parameters<ExampleFunc>;

// Template literal types
type EventName = "click" | "focus" | "blur";
type EventHandlerName<T extends string> = `on${Capitalize<T>}`;
type Handler = EventHandlerName<EventName>;

// Complex mapped type with conditions
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedUser {
  id: string;
  profile: {
    name: string;
    settings: {
      theme: string;
      notifications: boolean;
    };
  };
}

type DeepPartialUser = DeepPartial<NestedUser>;

// Discriminated unions with conditional types
type Action =
  | { type: "ADD"; payload: { id: string; value: number } }
  | { type: "REMOVE"; payload: { id: string } }
  | { type: "UPDATE"; payload: { id: string; value: number } };

type ActionType = Action["type"];
type ExtractAction<T extends ActionType> = Extract<Action, { type: T }>;

type AddAction = ExtractAction<"ADD">;
type RemoveAction = ExtractAction<"REMOVE">;

// Pick and Omit utilities
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};

type UserBasicInfo = Pick<User, "id" | "name">;
type UserWithoutAge = Omit<User, "age">;

// Record type
type Record<K extends string | number | symbol, T> = {
  [P in K]: T;
};

type UserRecord = Record<string, User>;
type StatusRecord = Record<"active" | "inactive" | "pending", boolean>;

// Awaited type (unwrap promises)
type Awaited<T> = T extends Promise<infer U> ? U : T;

type PromiseString = Promise<string>;
type UnwrappedString = Awaited<PromiseString>;

// Recursive conditional types
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;

type NestedArray = number[][][];
type FlatType = Flatten<NestedArray>;

// Mapped type with key filtering
type OnlyStringProperties<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface MixedTypes {
  id: number;
  name: string;
  active: boolean;
  description: string;
}

type StringProperties = OnlyStringProperties<MixedTypes>;

// Union to intersection
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type Union = { a: string } | { b: number } | { c: boolean };
type Intersection = UnionToIntersection<Union>;