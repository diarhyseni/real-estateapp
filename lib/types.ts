export type Category = {
  id: string;
  name: string;
  value: string;
}

export type User = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  type?: string;
  category?: Category;
  categoryId: string;
  user?: User;
  userId?: string;
  location: string;
  area: number;
  areaUnit: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  createdAt: string;
  updatedAt: string;
  isExclusive: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasSecurity: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasInternet: boolean;
  hasElevator: boolean;
  latitude?: number;
  longitude?: number;
  characteristics: string[];
  nearbyPlaces: string[];
  images: string[];
  statuses?: string[];
  googleMapsIframe?: string;
} 