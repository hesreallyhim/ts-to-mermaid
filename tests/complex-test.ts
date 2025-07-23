// Complex TypeScript file to test various features

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User extends BaseEntity {
  username: string;
  email: string;
  profile?: UserProfile;
  roles: Role[];
  preferences: Map<string, any>;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  socialLinks: SocialLink[];
}

interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

type SocialPlatform = 'twitter' | 'linkedin' | 'github' | 'facebook';

enum Role {
  Admin = 'ADMIN',
  User = 'USER',
  Guest = 'GUEST'
}

class UserService implements Service<User> {
  private repository: Repository<User>;
  private cache: Cache<User>;
  
  async findById(id: string): Promise<User | null> {
    return null;
  }
  
  async create(data: CreateUserDto): Promise<User> {
    throw new Error('Not implemented');
  }
  
  async update(id: string, data: UpdateUserDto): Promise<User> {
    throw new Error('Not implemented');
  }
}

interface Service<T> {
  findById(id: string): Promise<T | null>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
}

interface Repository<T> {
  find(query: any): Promise<T[]>;
  findOne(query: any): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
}

type CreateUserDto = {
  username: string;
  email: string;
  password: string;
  roles?: Role[];
};

type UpdateUserDto = Partial<CreateUserDto> & {
  profile?: Partial<UserProfile>;
};

// Generic constraints example
interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

type UserResponse = Paginated<User>;

// Union and intersection types
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: Date;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}