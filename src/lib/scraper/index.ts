import { load } from 'cheerio';
import type { ScrapedProperty } from './types';
import { extractPropertyData } from '@/lib/gemini';

const SUPPORTED_DOMAINS = ['realestate.com.au', 'domain.com.au'];

export function isSupportedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return SUPPORTED_DOMAINS.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
}

function parseArgonautExchange(html: string): Partial<ScrapedProperty> | null {
  const $ = load(html);
  const scripts = $('script').toArray();

  for (const script of scripts) {
    const content = $(script).html() || '';
    if (content.includes('window.ArgonautExchange')) {
      try {
        const match = content.match(/window\.ArgonautExchange\s*=\s*(\{[\s\S]+\});/);
        if (match) {
          const data = JSON.parse(match[1]);
          const cacheKey = Object.keys(data).find(k => k.includes('urqlClientCache'));
          if (cacheKey) {
            const cache = JSON.parse(data[cacheKey]['urqlClientCache']);
            const listingKey = Object.keys(cache).find(k => k.includes('listing'));
            if (listingKey) {
              const listing = JSON.parse(cache[listingKey]['data']);
              return {
                address: listing.address?.displayAddress || null,
                price: listing.price?.weekly ? Math.round(listing.price.weekly * 100) : null,
                bedrooms: listing.bedrooms || null,
                bathrooms: listing.bathrooms || null,
                parking: listing.carSpaces || null,
                propertyType: listing.propertyType?.toLowerCase() || null,
                description: listing.description || null,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                images: listing.images?.map((img: any) => img.url).filter(Boolean) || [],
                availableDate: listing.availableDate || null,
              };
            }
          }
        }
      } catch (e) {
        console.error('ArgonautExchange parse error:', e);
      }
    }
  }
  return null;
}

export async function scrapeProperty(url: string): Promise<ScrapedProperty> {
  if (!isSupportedDomain(url)) {
    throw new Error(`Unsupported domain. Supported: ${SUPPORTED_DOMAINS.join(', ')}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Try ArgonautExchange first (structured data)
    const argonautData = parseArgonautExchange(html);
    
    if (argonautData && argonautData.address) {
      return { url, ...argonautData } as ScrapedProperty;
    }

    // Fallback to Gemini extraction
    console.log('ArgonautExchange not found, using Gemini extraction...');
    const geminiData = await extractPropertyData(html, url);
    
    return geminiData;
  } catch (error) {
    clearTimeout(timeout);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - the site may be blocking automated requests');
    }
    
    throw new Error(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}