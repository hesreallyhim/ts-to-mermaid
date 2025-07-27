// Test for discriminated unions - Rule 4

// Basic discriminated union with 'kind' property
type Shape = 
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

// Discriminated union with 'type' property
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string; modifiers: string[] }
  | { type: "scroll"; deltaY: number };

// More complex discriminated union
type ApiResponse =
  | { status: "success"; data: any }
  | { status: "error"; error: string; code: number }
  | { status: "loading" };

// Discriminated union with nested properties
type Animal =
  | { species: "dog"; breed: string; goodBoy: boolean }
  | { species: "cat"; breed: string; livesRemaining: number }
  | { species: "bird"; wingspan: number; canFly: boolean };

// Using discriminated unions in interfaces
interface ShapeContainer {
  id: string;
  shape: Shape;
}

interface EventHandler {
  name: string;
  handle(event: Event): void;
}

// Multiple discriminators (should be treated as complex)
type MultiDiscriminator =
  | { category: "A"; type: "1"; value: string }
  | { category: "A"; type: "2"; value: number }
  | { category: "B"; type: "1"; value: boolean };

// Non-discriminated union (no common property with literals)
type NotDiscriminated =
  | { name: string; value: number }
  | { label: string; count: number }
  | { title: string; amount: number };