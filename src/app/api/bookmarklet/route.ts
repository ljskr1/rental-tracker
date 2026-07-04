import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { properties } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const data = await request.json();
    const { url, address, price, bedrooms, bathrooms, parking, propertyType, description, images, availableDate } = data;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400, headers: corsHeaders });
    }

    const existing = await db.select().from(properties).where(eq(properties.url, url)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ property: existing[0], message: 'Property already exists' }, { status: 200, headers: corsHeaders });
    }

    const [property] = await db.insert(properties).values({
      url,
      address: address || 'Address not found',
      price: price || null,
      bedrooms: bedrooms ?? null,
      bathrooms: bathrooms ?? null,
      parking: parking ?? null,
      propertyType: propertyType || null,
      description: description || null,
      images: images || [],
      availableDate: availableDate || null,
    }).returning();

    return NextResponse.json({ property }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Bookmarklet API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save property' },
      { status: 500, headers: corsHeaders }
    );
  }
}
