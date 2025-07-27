// Test file for namespaces and modules
// Tests: namespace declarations, nested namespaces, module augmentation

// Basic namespace
namespace Utils {
  export interface Logger {
    log(message: string): void;
    error(message: string): void;
    warn(message: string): void;
  }
  
  export class ConsoleLogger implements Logger {
    log(message: string): void {
      console.log(message);
    }
    
    error(message: string): void {
      console.error(message);
    }
    
    warn(message: string): void {
      console.warn(message);
    }
  }
  
  export type LogLevel = "info" | "warn" | "error" | "debug";
  
  export enum LogFormat {
    JSON = "json",
    Plain = "plain",
    Structured = "structured"
  }
}

// Nested namespaces
namespace Application {
  export namespace Models {
    export interface User {
      id: string;
      username: string;
      email: string;
      profile: UserProfile;
    }
    
    export interface UserProfile {
      firstName: string;
      lastName: string;
      bio?: string;
      avatar?: string;
    }
    
    export type UserRole = "admin" | "user" | "guest";
  }
  
  export namespace Services {
    export interface UserService {
      getUser(id: string): Models.User;
      updateUser(id: string, data: Partial<Models.User>): Models.User;
      deleteUser(id: string): boolean;
    }
    
    export class UserServiceImpl implements UserService {
      private users: Map<string, Models.User> = new Map();
      
      getUser(id: string): Models.User {
        const user = this.users.get(id);
        if (!user) throw new Error("User not found");
        return user;
      }
      
      updateUser(id: string, data: Partial<Models.User>): Models.User {
        const user = this.getUser(id);
        Object.assign(user, data);
        return user;
      }
      
      deleteUser(id: string): boolean {
        return this.users.delete(id);
      }
    }
  }
  
  export namespace Controllers {
    export class UserController {
      private userService: Services.UserService;
      
      constructor(service: Services.UserService) {
        this.userService = service;
      }
      
      handleGetUser(id: string): Models.User {
        return this.userService.getUser(id);
      }
    }
  }
}

// Deeply nested namespace
namespace Company {
  export namespace Department {
    export namespace Engineering {
      export interface Developer {
        id: string;
        name: string;
        skills: string[];
        level: DeveloperLevel;
      }
      
      export enum DeveloperLevel {
        Junior = "JUNIOR",
        Mid = "MID",
        Senior = "SENIOR",
        Lead = "LEAD"
      }
      
      export namespace Frontend {
        export interface FrontendDeveloper extends Developer {
          frameworks: string[];
          designSkills: boolean;
        }
      }
      
      export namespace Backend {
        export interface BackendDeveloper extends Developer {
          databases: string[];
          devOpsSkills: boolean;
        }
      }
    }
  }
}

// Global namespace augmentation
declare global {
  namespace GlobalUtils {
    interface GlobalConfig {
      apiUrl: string;
      timeout: number;
      retries: number;
    }
  }
}

// Module pattern with namespace
namespace ModulePattern {
  interface PrivateInterface {
    secret: string;
  }
  
  export interface PublicInterface {
    id: string;
    getData(): string;
  }
  
  export class PublicClass implements PublicInterface {
    id: string;
    private hidden: PrivateInterface;
    
    constructor(id: string) {
      this.id = id;
      this.hidden = { secret: "hidden" };
    }
    
    getData(): string {
      return this.id;
    }
  }
}

// Namespace with type imports/exports
namespace TypeSystem {
  export type ID = string | number;
  export type Timestamp = number;
  
  export interface Entity {
    id: ID;
    created: Timestamp;
    updated: Timestamp;
  }
  
  export namespace Validators {
    export interface Validator<T> {
      validate(value: T): boolean;
      getErrors(): string[];
    }
    
    export class EntityValidator implements Validator<Entity> {
      private errors: string[] = [];
      
      validate(value: Entity): boolean {
        this.errors = [];
        if (!value.id) this.errors.push("ID is required");
        if (!value.created) this.errors.push("Created timestamp is required");
        return this.errors.length === 0;
      }
      
      getErrors(): string[] {
        return this.errors;
      }
    }
  }
}