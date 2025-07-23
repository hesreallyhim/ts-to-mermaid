interface User {
  id: number;
  name: string;
  email?: string;
  readonly createdAt: Date;
}

interface Admin extends User {
  permissions: string[];
  role: AdminRole;
}

type AdminRole = 'super' | 'moderator' | 'editor';

enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

class UserService {
  private users: User[];
  
  getUser(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
  
  createAdmin(user: User, role: AdminRole): Admin {
    return {
      ...user,
      permissions: [],
      role
    };
  }
}