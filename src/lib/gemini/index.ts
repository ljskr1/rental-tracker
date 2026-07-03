import { GoogleGenAI } from '@google/genai';
import type { PropertyData } from '@/lib/scraper/types';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const EXTRACTION_PROMPT = `
Extract rental property details from this realestate.com.au listing HTML.
Return ONLY valid JSON matching the schema below. Do not include any explanation or markdown.

Required fields (must be present):
- address: Full property address as string
- price: Weekly rent in AUD cents (e.g., 55000 for $550/week)
- bedrooms: Number of bedrooms as integer
- url: Original listing URL

Optional fields (include if found, otherwise null):
- bathrooms: Number of bathrooms as integer
- parking: Number of parking spaces as integer
- propertyType: One of "house", "apartment", "townhouse", "studio", "unit", "other"
- description: Brief description summary (max 500 chars)
- images: Array of image URLs (property photos)
- availableDate: Available date as string (e.g., "2024-03-15" or "Now")

Price parsing: Extract weekly rent. If listed as "per week", use that. If "per month", divide by 4.33. Convert to cents.
`;

export async function extractPropertyData(html: string, url: string): Promise<PropertyData & { url: string }> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { text: EXTRACTION_PROMPT },
        { text: `URL: ${url}\n\nHTML:\n${html.slice(0, 100000)}` },
      ],
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            price: { type: 'integer' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer', nullable: true },
            parking: { type: 'integer', nullable: true },
            propertyType: { 
              type: 'string', 
              enum: ['house', 'apartment', 'townhouse', 'studio', 'unit', 'other'],
              nullable: true 
            },
            description: { type: 'string', nullable: true },
            images: { 
              type: 'array', 
              items: { type: 'string' },
              nullable: true 
            },
            availableDate: { type: 'string', nullable: true },
          },
          required: ['address', 'price', 'bedrooms'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    return { ...data, url };
  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw new Error(`Failed to extract property data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}