import { pgTable, uuid, text, integer, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const propertyTypeEnum = pgEnum('property_type', [
  'house',
  'apartment',
  'townhouse',
  'studio',
  'unit',
  'other'
]);

export const propertyStatusEnum = pgEnum('property_status', [
  'interested',
  'inspection_scheduled',
  'applied',
  'rejected',
  'approved',
  'archived'
]);

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull().unique(),
  address: text('address').notNull(),
  price: integer('price'), // weekly price in cents
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  parking: integer('parking'),
  propertyType: propertyTypeEnum('property_type'),
  description: text('description'),
  images: jsonb('images').$type<string[]>(),
  availableDate: text('available_date'),
  inspectionDate: text('inspection_date'),
  inspectionTime: text('inspection_time'),
  status: propertyStatusEnum('status').default('interested'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;