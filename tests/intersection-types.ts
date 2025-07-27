// Test file for intersection types
// Tests: type intersections, merged properties, complex intersections

// Basic intersection of two interfaces
interface Named {
  name: string;
}

interface Aged {
  age: number;
}

// Simple intersection type
type NamedAndAged = Named & Aged;

// Interface extending intersection
interface Person extends Named, Aged {
  email: string;
}

// Intersection with object literal
type WithId = {
  id: string;
  createdAt: Date;
};

type IdentifiablePerson = Person & WithId;

// Multiple intersections
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Versioned {
  version: number;
  previousVersions: number[];
}

interface Authored {
  author: string;
  contributors: string[];
}

type Document = Named & Timestamped & Versioned & Authored;

// Intersection with type aliases
type ReadPermissions = {
  canRead: boolean;
  readGroups: string[];
};

type WritePermissions = {
  canWrite: boolean;
  writeGroups: string[];
};

type AdminPermissions = {
  canDelete: boolean;
  canManageUsers: boolean;
};

type FullPermissions = ReadPermissions & WritePermissions & AdminPermissions;

// Class implementing intersection type
class User implements NamedAndAged {
  name: string;
  age: number;
  
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// Complex intersection with generics
interface Identifiable<T> {
  id: T;
}

interface Trackable {
  trackingId: string;
  lastModified: Date;
}

type TrackedEntity<T> = Identifiable<T> & Trackable & Named;

// Intersection with method signatures
interface Saveable {
  save(): Promise<void>;
  isDirty(): boolean;
}

interface Loadable {
  load(): Promise<void>;
  isLoaded(): boolean;
}

type Persistable = Saveable & Loadable;

// Intersection creating property conflicts (same property different types)
// This is valid TypeScript - the intersection results in 'never' for conflicting properties
interface A {
  prop: string;
  shared: number;
}

interface B {
  prop: number;
  shared: number;
}

type Intersection = A & B; // prop becomes never, shared remains number