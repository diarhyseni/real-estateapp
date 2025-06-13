export type Category = {
  id: string;
  name: string;
  value: string;
}

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "SALE" | "RENT";
  categoryId: string;
  images: string[];
  features: string[];
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
} 