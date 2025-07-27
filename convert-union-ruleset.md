# TypeScript Union to Mermaid Conversion Ruleset

## Comparison of Approaches

### 1. **Inline Annotation**

```mermaid
classDiagram
    class User {
        +status: "active" | "inactive" | "pending"
    }
```

**Pros:** Most accurate to TypeScript, concise, readable  
**Cons:** Can get unwieldy with many values or complex types

### 2. **Inheritance Hierarchy**

```mermaid
classDiagram
    class Status {
        <<abstract>>
    }
    Status <|-- Active
    Status <|-- Inactive
    Status <|-- Pending
```

**Pros:** Good for discriminated unions, shows relationships  
**Cons:** Verbose, creates many boxes, overkill for simple unions

### 3. **Enumeration Class**

```mermaid
classDiagram
    class Status {
        <<enumeration>>
        ACTIVE: "active"
        INACTIVE: "inactive"
        PENDING: "pending"
    }
```

**Pros:** Reusable, clear for enum-like unions  
**Cons:** Not accurate for complex unions, extra indirection

### 4. **Note Annotation**

```mermaid
classDiagram
    class User {
        +data: ComplexUnion
    }
    note for User "ComplexUnion = string | number | { nested: boolean }"
```

**Pros:** Handles any complexity, preserves exact TypeScript syntax  
**Cons:** Separates type info from property, can clutter diagram

## Conversion Rules

### Rule 1: String Literal Unions (≤ 5 values)

```typescript
type Status = "active" | "inactive" | "pending";
```

**→ Use inline annotation:**

```mermaid
+status: "active" | "inactive" | "pending"
```

### Rule 2: String Literal Unions (> 5 values)

```typescript
type Country = 'US' | 'UK' | 'FR' | 'DE' | 'IT' | 'ES' | 'JP' | ...;
```

**→ Use enumeration class:**

```mermaid
class Country {
    <<enumeration>>
    US: "US"
    UK: "UK"
    FR: "FR"
    ...
}
```

### Rule 3: Primitive Type Unions

```typescript
type ID = string | number;
type Nullable<T> = T | null | undefined;
```

**→ Use inline annotation for simple cases:**

```mermaid
+id: string | number
+value: T | null | undefined
```

### Rule 4: Discriminated Unions

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };
```

**→ Use inheritance hierarchy:**

```mermaid
classDiagram
    class Shape {
        <<interface>>
        +kind: string
    }
    class Circle {
        +kind: "circle"
        +radius: number
    }
    class Rectangle {
        +kind: "rectangle"
        +width: number
        +height: number
    }
    Shape <|.. Circle
    Shape <|.. Rectangle
```

### Rule 5: Complex Mixed Unions

```typescript
type Data = string | number | User | { custom: boolean } | null;
```

**→ Use note annotation:**

```mermaid
class MyClass {
    +data: Data
}
note for MyClass "Data = string | number | User | { custom: boolean } | null"
```

### Rule 6: Boolean Unions

```typescript
type Flags = true | false | "maybe";
```

**→ Use inline annotation:**

```mermaid
+flag: true | false | "maybe"
```

### Rule 7: Reusable Type Aliases

```typescript
// Used in multiple places
type UserRole = "admin" | "user" | "guest";
```

**→ Create a dedicated type class:**

```mermaid
class UserRole {
    <<type>>
    "admin" | "user" | "guest"
}
User --> UserRole : role
Post --> UserRole : authorRole
```

### Rule 8: Union with Type Parameters

```typescript
type Result<T> = T | Error;
```

**→ Use note or simplified annotation:**

```mermaid
class Result~T~ {
    <<type>>
}
note for Result "T | Error"
```

### Rule 9: Nested Unions

```typescript
type NestedUnion = (string | number) | (User | Admin);
```

**→ Simplify with note:**

```mermaid
+value: NestedUnion
note "NestedUnion = (string | number) | (User | Admin)"
```

### Rule 10: Function Unions

```typescript
type Handler = ((x: string) => void) | ((x: number) => void);
```

**→ Use note annotation:**

```mermaid
+handler: Handler
note "Handler = ((x: string) => void) | ((x: number) => void)"
```

### Rule 11: Mixed Literal and Non-literal Unions

```typescript
type Mixed = "auto" | number | CustomType;
type Status = "loading" | "error" | Response;
```

**→ Use note annotation:**

```mermaid
+mode: Mixed
note "Mixed = \"auto\" | number | CustomType"
```

### Rule 12: Template Literal Types

```typescript
type Pattern = `${string}-${number}`;
type EventName = `on${Capitalize<string>}`;
```

**→ Use note annotation:**

```mermaid
+pattern: Pattern
note "Pattern = `${string}-${number}`"
```

### Rule 13: Unions with Intersections

```typescript
type Combined = (A & B) | C;
type User = (BaseUser & Admin) | Guest;
```

**→ Use note annotation:**

```mermaid
+user: User
note "User = (BaseUser & Admin) | Guest"
```

### Rule 14: Discriminated Union Detection

For discriminated unions, only single-property discriminators are detected:

```typescript
// Supported - single discriminator "kind"
type Shape = 
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

// Not supported - multiple discriminators treated as complex
type Event =
  | { type: "click"; target: "button"; x: number }
  | { type: "key"; target: "input"; key: string };
```

## Quick Decision Tree

1. **Is it a discriminated union?** → Use inheritance (single discriminator only)
2. **Contains template literals or intersections?** → Use note annotation
3. **Mixes literals with non-literals?** → Use note annotation
4. **Is it > 5 string/number literals?** → Use enumeration
5. **Is it ≤ 5 simple values?** → Use inline annotation
6. **Is it reused multiple times?** → Create dedicated type class
7. **Is it complex/mixed types?** → Use note annotation
8. **Default** → Use inline annotation

## Summary

This ruleset prioritizes diagram readability while maintaining as much type information as possible. The key principle is to match the complexity of the representation to the complexity of the type - simple unions get simple representations, complex unions get more elaborate ones.
