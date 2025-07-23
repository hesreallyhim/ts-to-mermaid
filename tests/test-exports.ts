// Test file for export syntax handling

export interface User {
  id: number;
  name: string;
  email: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

export class UserService {
  private users: User[];
  
  getUser(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}

export default class DefaultExport {
  value: string;
}

// Named exports with renaming
export { User as UserModel };

// Re-export from another module (this won't work without the actual module)
// export { Something } from './another-module';