// Test for reusable union types - Rule 7

// Used in multiple places - should be a dedicated type
type UserRole = "admin" | "user" | "guest";

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface Post {
  id: string;
  content: string;
  authorRole: UserRole;
  visibility: UserRole; // Who can see this post
}

interface Permission {
  resource: string;
  action: string;
  allowedRoles: UserRole[];
}

// Another reusable union used in multiple places
type Status = "active" | "inactive" | "pending" | "suspended";

interface Account {
  id: string;
  status: Status;
}

interface Service {
  name: string;
  status: Status;
}

interface Task {
  id: string;
  status: Status;
  previousStatus?: Status;
}

// Union used only once - should remain inline
type SingleUseUnion = "option1" | "option2" | "option3";

interface Config {
  mode: SingleUseUnion;
}

// Large union used in multiple places
type Country = "US" | "UK" | "FR" | "DE" | "IT" | "ES" | "JP" | "CN" | "IN" | "BR";

interface Address {
  street: string;
  country: Country;
}

interface User2 {
  name: string;
  nationality: Country;
}

interface Store {
  name: string;
  locations: Country[];
}