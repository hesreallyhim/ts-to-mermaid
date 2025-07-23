// Test file for various type relationships
// Tests: extends, implements, composition, type references

// Base interfaces for inheritance testing
interface Entity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Auditable {
  createdBy: string;
  updatedBy: string;
}

interface Deletable {
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

// Extended interfaces
interface User extends Entity, Auditable {
  username: string;
  email: string;
  profile: UserProfile;
}
/** @ts-ignore */
interface Admin extends User, Deletable {
  permissions: Permission[];
  role: AdminRole;
}

// Composition relationships
interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: "light" | "dark";
  language: string;
  notifications: NotificationSettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// Type for composition
type Permission = {
  resource: string;
  action: string;
  granted: boolean;
};

type AdminRole = "super_admin" | "moderator" | "support";

// Classes implementing interfaces
class BaseEntity implements Entity {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: number) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  update(): void {
    this.updatedAt = new Date();
  }
}

class UserService implements CrudService<User>, Auditable {
  createdBy: string;
  updatedBy: string;
  private users: Map<string, User>;

  constructor(actor: string) {
    this.createdBy = actor;
    this.updatedBy = actor;
    this.users = new Map();
  }

  create(user: User): User {
    this.users.set(user.id.toString(), user);
    return user;
  }

  read(id: string): User | undefined {
    return this.users.get(id.toString());
  }

  update(id: string, user: Partial<User>): User | undefined {
    const existing = this.users.get(id);
    if (existing) {
      const updated = { ...existing, ...user };
      this.users.set(id, updated);
      this.updatedBy = user.updatedBy || this.updatedBy;
      return updated;
    }
    return undefined;
  }

  delete(id: string): boolean {
    return this.users.delete(id);
  }
}

// Generic interface for services
interface CrudService<T> {
  create(item: T): T;
  read(id: string): T | undefined;
  update(id: string, item: Partial<T>): T | undefined;
  delete(id: string): boolean;
}

// Abstract class with inheritance
abstract class BaseService<T extends Entity> {
  protected items: T[] = [];

  abstract validate(item: T): boolean;

  add(item: T): void {
    if (this.validate(item)) {
      this.items.push(item);
    }
  }

  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }
}

class UserEntityService extends BaseService<User> {
  validate(user: User): boolean {
    return user.email.includes('@') && user.username.length > 0;
  }
}

// Type with multiple relationships
interface Application {
  id: string;
  name: string;
  owner: User;
  admins: Admin[];
  settings: ApplicationSettings;
  status: ApplicationStatus;
}

interface ApplicationSettings {
  public: boolean;
  maxUsers: number;
  features: string[];
}

type ApplicationStatus = "active" | "suspended" | "archived";
