// Shared serializable types used across server/client boundaries.
import type {
  Product,
  Category,
  Order,
  OrderItem,
  CartItem,
  User,
  Role,
  OrderStatus,
} from "@prisma/client";

export type { Role, OrderStatus };

export type SafeUser = Omit<User, "password">;

export type ProductWithRelations = Product & {
  category: Category;
  seller: Pick<User, "id" | "name" | "businessName" | "city">;
};

export type CartItemWithProduct = CartItem & {
  product: ProductWithRelations;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Pick<Product, "id" | "slug" | "image"> })[];
};

export type OrderWithItemsAndBuyer = OrderWithItems & {
  buyer: Pick<User, "id" | "name" | "businessName" | "phone">;
};

export interface ApiError {
  error: string;
}

export const UNITS = ["kg", "quintal", "crate", "dozen", "bag", "piece"] as const;
export type Unit = (typeof UNITS)[number];
