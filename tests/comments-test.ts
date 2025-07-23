/**
 * User management system types
 * @module UserTypes
 */

/**
 * Represents a user in the system
 * @interface User
 */
interface User {
  /** Unique identifier */
  id: number;
  
  /** User's full name */
  name: string;
  
  // Email address for notifications
  email: string;
  
  /**
   * User's role in the system
   * @deprecated Use RoleAssignment instead
   */
  role?: UserRole;
}

/**
 * Available user roles
 * @enum {string}
 */
type UserRole = 'admin' | 'moderator' | 'user';

// Status values for accounts
enum AccountStatus {
  /** Account is active and can be used */
  Active = 1,
  /** Account is temporarily suspended */
  Suspended = 2,
  /** Account is permanently deleted */
  Deleted = 3
}

/**
 * Service for managing users
 * @class UserService
 * @example
 * const service = new UserService();
 * const user = service.getUser(123);
 */
class UserService {
  // Internal storage of users
  private users: User[];
  
  /**
   * Gets a user by ID
   * @param {number} id - The user ID
   * @returns {User | undefined} The user or undefined
   */
  getUser(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
  
  /** Active user count */
  activeCount: number; // Tracks active users
}

/*
 * Multi-line comment
 * This interface extends User
 */
interface AdminUser extends User {
  // Admin-specific properties
  permissions: string[]; // List of permissions
  /** When the admin was promoted */
  promotedAt: Date;
}