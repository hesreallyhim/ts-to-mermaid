// Edge cases for union type conversion testing

// Nested unions
type NestedSimple = (string | number) | (boolean | null);
type DoubleNested = ((string | number) | boolean) | (null | undefined);

// Generic unions
type GenericUnion<T> = T | null;
type ConstrainedUnion<T extends string | number> = T | "default";

// Function unions
type FunctionUnion = ((x: string) => void) | ((x: number) => number);
type MixedFunctionUnion = (() => void) | string | number;

// Unions with type parameters
type ConditionalUnion<T> = T extends string ? "string" | "text" : number | bigint;
type MappedUnion<T> = T extends { id: infer U } ? U | null : never;

// Recursive union types
type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
interface JSONObject { [key: string]: JSONValue; }
interface JSONArray extends Array<JSONValue> {}

// Arrays and tuples in unions
type ArrayUnion = string[] | number[] | [string, number];
type MixedArrayUnion = string | string[] | Array<string | number>;

// Object literal unions
type ObjectUnion = { type: "a"; value: string } | { type: "b"; value: number };
type MixedObjectUnion = string | { id: number } | { name: string };

// Unions with undefined/null
type OptionalUnion = string | undefined;
type NullableUnion = number | null;
type BothUnion = boolean | null | undefined;

// Large mixed unions
type KitchenSink = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined 
  | { type: "object" }
  | [string, number]
  | (() => void)
  | Array<any>;

// Branded types in unions
type UserId = string & { __brand: "UserId" };
type ProductId = string & { __brand: "ProductId" };
type IdUnion = UserId | ProductId | string;

// Symbol and unique symbol unions
const sym1 = Symbol("sym1");
const sym2 = Symbol("sym2");
type SymbolUnion = typeof sym1 | typeof sym2 | symbol;

// Enum unions
enum Color { Red, Green, Blue }
enum Size { Small, Medium, Large }
type EnumUnion = Color | Size;
type MixedEnumUnion = Color.Red | Size.Large | "custom";

// Conditional types that resolve to unions
type IsArray<T> = T extends any[] ? true | false : false;
type UnwrapArray<T> = T extends (infer U)[] ? U | null : T;

// Using the edge case unions
interface EdgeCaseTests {
  nested: NestedSimple;
  generic: GenericUnion<string>;
  func: FunctionUnion;
  json: JSONValue;
  array: ArrayUnion;
  optional?: OptionalUnion;
  kitchen: KitchenSink;
  enumValue: EnumUnion;
}