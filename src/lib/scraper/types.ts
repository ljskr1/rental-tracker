export interface PropertyData {
  address: string | null;
  price: number | null; // in cents
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  propertyType: 'house' | 'apartment' | 'townhouse' | 'studio' | 'unit' | 'other' | null;
  description: string | null;
  images: string[];
  availableDate: string | null;
}

export interface ScrapedProperty extends PropertyData {
  url: string;
}