// Simple test file with minor syntax errors
// Purpose: Demonstrate partial parsing and error recovery
// This shows how the converter can still produce useful diagrams despite errors
// 
// Key demonstration: Even with syntax errors, the converter:
// 1. Continues parsing the entire file
// 2. Preserves all valid type definitions
// 3. Maintains relationships between types
// 4. Reports only one error instead of cascading failures
//
// This is a more realistic example than compilation-errors.ts as it shows
// common typos and mistakes that happen during development

// Valid interface - should render correctly
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Valid enum - should render correctly
enum UserRole {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST"
}

// Interface with syntax error - missing closing brace
interface Product {
  id: number;
  name: string;
  price: number;
  owner: User;  // This relationship should still be detected
// Missing closing brace here

// Valid interface that follows the error - should still parse
interface Order {
  id: string;
  user: User;
  products: Product[];
  total: number;
  status: OrderStatus;
}

// Another valid type
type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

// Class with error in method syntax
class OrderService {
  private orders: Order[] = [];
  
  // Method with missing parameter type - syntax error
  addOrder(order): void {
    this.orders.push(order);
  }
  
  // Valid method - should work
  getOrder(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }
  
  // Property should still be detected
  serviceName: string = "OrderService";
}

// Interface extending the one with syntax error - interesting edge case
interface SpecialProduct extends Product {
  discount: number;
  featured: boolean;
}

// Valid class implementing valid interface
class UserManager {
  private users: Map<string, User> = new Map();
  
  addUser(user: User): void {
    this.users.set(user.id, user);
  }
  
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }
}

// One more interface with comma error
interface Dashboard {
  title: string
  widgets: Widget[]  // Missing comma on previous line
  user: User;
  lastUpdated: Date;
}

// Type that doesn't exist yet
interface Widget {
  id: string;
  type: "chart" | "table" | "metric";
  data: any;
}

// Final valid class to show the converter continues to the end
class Application {
  userManager: UserManager;
  orderService: OrderService;
  
  constructor() {
    this.userManager = new UserManager();
    this.orderService = new OrderService();
  }
}