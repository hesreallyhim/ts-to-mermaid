// Test file for circular dependencies
// Tests: self-referencing types, mutual dependencies, indirect cycles

// Direct self-reference
interface TreeNode {
  id: string;
  value: any;
  children: TreeNode[];
  parent?: TreeNode;
}

// Mutual dependency between two types
interface Author {
  id: string;
  name: string;
  books: Book[];
}

interface Book {
  id: string;
  title: string;
  author: Author;
  relatedBooks?: Book[];
}

// Three-way circular dependency
interface User {
  id: string;
  username: string;
  posts: Post[];
  comments: Comment[];
}

interface Post {
  id: string;
  content: string;
  author: User;
  comments: Comment[];
  parentPost?: Post;
}

interface Comment {
  id: string;
  text: string;
  author: User;
  post: Post;
  replies: Comment[];
}

// Circular dependency through type alias
type LinkedListNode<T> = {
  value: T;
  next?: LinkedListNode<T>;
  prev?: LinkedListNode<T>;
};

// Complex graph structure
interface GraphNode {
  id: string;
  data: any;
  edges: Edge[];
}

interface Edge {
  id: string;
  from: GraphNode;
  to: GraphNode;
  weight?: number;
}

// Circular dependency with inheritance
interface BaseEntity {
  id: string;
  created: Date;
  relatedEntities?: Entity[];
}

interface Entity extends BaseEntity {
  name: string;
  parent?: Entity;
  children: Entity[];
}

// State machine with circular references
interface State {
  name: string;
  transitions: Transition[];
  onEnter?: () => void;
  onExit?: () => void;
}

interface Transition {
  event: string;
  from: State;
  to: State;
  condition?: () => boolean;
}

// Recursive type through union
type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONObject 
  | JSONArray;

interface JSONObject {
  [key: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

// File system representation
interface File {
  name: string;
  size: number;
  parent: Directory;
}

interface Directory {
  name: string;
  files: File[];
  subdirectories: Directory[];
  parent?: Directory;
}

// Social network circular references
interface Person {
  id: string;
  name: string;
  friends: Person[];
  following: Person[];
  followers: Person[];
  groups: Group[];
}

interface Group {
  id: string;
  name: string;
  members: Person[];
  admins: Person[];
  parentGroup?: Group;
  subgroups: Group[];
}

// Expression tree with circular possibilities
type Expression = 
  | NumberLiteral
  | StringLiteral
  | BinaryExpression
  | UnaryExpression
  | ConditionalExpression;

interface NumberLiteral {
  type: "number";
  value: number;
}

interface StringLiteral {
  type: "string";
  value: string;
}

interface BinaryExpression {
  type: "binary";
  operator: "+" | "-" | "*" | "/" | "&&" | "||";
  left: Expression;
  right: Expression;
}

interface UnaryExpression {
  type: "unary";
  operator: "!" | "-" | "+";
  operand: Expression;
}

interface ConditionalExpression {
  type: "conditional";
  condition: Expression;
  consequent: Expression;
  alternate: Expression;
}

// Class-based circular dependencies
class Department {
  name: string;
  manager: Employee;
  employees: Employee[];
  
  constructor(name: string) {
    this.name = name;
    this.employees = [];
  }
}

class Employee {
  name: string;
  department: Department;
  manager?: Employee;
  subordinates: Employee[];
  
  constructor(name: string, department: Department) {
    this.name = name;
    this.department = department;
    this.subordinates = [];
  }
}