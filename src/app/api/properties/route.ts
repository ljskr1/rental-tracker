import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { properties } from '@/lib/db/schema';
import { scrapeProperty } from '@/lib/scraper';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, inspectionDate, inspectionTime, notes } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check if property already exists
    const existing = await db.select().from(properties).where(eq(properties.url, url)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ 
        property: existing[0], 
        message: 'Property already exists' 
      }, { status: 200 });
    }

    let scraped;
    try {
      scraped = await scrapeProperty(url);
    } catch (scrapeError) {
      console.warn('Scraping failed, saving with manual data:', scrapeError);
      scraped = {
        address: null,
        price: null,
        bedrooms: null,
        bathrooms: null,
        parking: null,
        propertyType: null,
        description: null,
        images: [],
        availableDate: null,
      };
    }

    // Insert into database
    const [property] = await db.insert(properties).values({
      url,
      address: scraped.address || 'Address not found',
      price: scraped.price,
      bedrooms: scraped.bedrooms,
      bathrooms: scraped.bathrooms,
      parking: scraped.parking,
      propertyType: scraped.propertyType,
      description: scraped.description,
      images: scraped.images || [],
      availableDate: scraped.availableDate,
      inspectionDate: inspectionDate || null,
      inspectionTime: inspectionTime || null,
      notes: notes || null,
    }).returning();

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error('POST /api/properties error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add property' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const sortColumn = {
      price: properties.price,
      bedrooms: properties.bedrooms,
      inspectionDate: properties.inspectionDate,
      createdAt: properties.createdAt,
    }[sort] || properties.createdAt;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderFn = order === 'asc' ? (col: any) => col : (col: any) => desc(col);

    const allProperties = await db.select().from(properties).orderBy(orderFn(sortColumn));

    return NextResponse.json({ 
      properties: allProperties,
      total: allProperties.length 
    });
  } catch (error) {
    console.error('GET /api/properties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}