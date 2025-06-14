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
  currency: string;
  type: "SALE" | "RENT";
  categoryId: string;
  category: Category;
  images: string[];
  features: string[];
  characteristics: string[];
  location: string;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  parking: number;
  hasParking: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasSecurity: boolean;
  hasGym: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasInternet: boolean;
  hasElevator: boolean;
  statuses: string[];
  isExclusive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
} 