// Test file for union types
// Tests: literal unions, type unions, mixed unions, nested unions

// Simple string literal union
type ColorName = "red" | "green" | "blue" | "yellow";

// Number literal union
type Priority = 1 | 2 | 3 | 4 | 5;

// Mixed literal union
type Status = "active" | "inactive" | "pending" | 404 | 503;

// Boolean union (edge case)
type Toggle = true | false;

// Union of type references
type PrimaryColor = "red" | "green" | "blue";
type SecondaryColor = "orange" | "purple" | "green";
type AllColors = PrimaryColor | SecondaryColor;

// Union with undefined/null
type OptionalStatus = "success" | "error" | "loading" | undefined;
type NullableResult = string | number | null;

// Complex union for API responses
type ApiResponse = 
  | { status: "success"; data: any }
  | { status: "error"; message: string }
  | { status: "loading" };

// Union used in interface
interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  color?: ColorName;
}

// Union used in class
class StateManager {
  private currentState: Status;
  private previousStates: Status[];
  
  constructor() {
    this.currentState = "pending";
    this.previousStates = [];
  }
  
  setState(newState: Status): void {
    this.previousStates.push(this.currentState);
    this.currentState = newState;
  }
  
  getState(): Status {
    return this.currentState;
  }
}

// Nested union type
type NestedStatus = 
  | { type: "simple"; value: Status }
  | { type: "complex"; primary: Status; secondary: OptionalStatus };

// Union with template literal types (if supported)
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ApiEndpoint = "/users" | "/posts" | "/comments";

// Type alias that uses unions
type RequestConfig = {
  method: HttpMethod;
  endpoint: ApiEndpoint;
  status?: OptionalStatus;
};