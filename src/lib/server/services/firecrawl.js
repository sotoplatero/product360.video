import { env } from '$env/dynamic/private';

const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

/**
 * Scrape a product page and extract the main product image URL
 * @param {string} url - The product page URL to scrape
 * @returns {Promise<{imageUrl: string, markdown?: string}>} - The extracted product image URL
 */
export async function scrapeProductPage(url) {
	if (!env.FIRECRAWL_API_KEY) {
		throw new Error('FIRECRAWL_API_KEY is not configured');
	}

	const response = await fetch(`${FIRECRAWL_API_URL}/scrape`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${env.FIRECRAWL_API_KEY}`
		},
		body: JSON.stringify({
			url,
			formats: ['json'],
			jsonOptions: {
				prompt: 'Please extract the absolute URL of the main product image that is on this product listing e-commerce page.',
				schema: {
					type: 'string',
					description: 'The main product image url extracted from this ecommerce product page.'
				}
			}
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Firecrawl API error: ${response.status} - ${errorText}`);
	}

	const data = await response.json();

	if (!data.success) {
		throw new Error(`Firecrawl scraping failed: ${data.error || 'Unknown error'}`);
	}

	const imageUrl = data.data?.json;
	if (!imageUrl) {
		throw new Error('Could not extract product image URL from page');
	}

	return {
		imageUrl,
		markdown: data.data?.markdown
	};
}

/**
 * Fetch an image and convert it to base64
 * @param {string} imageUrl - The URL of the image to fetch
 * @returns {Promise<{base64: string, mimeType: string}>} - The base64 encoded image data
 */
export async function fetchImageAsBase64(imageUrl) {
	const response = await fetch(imageUrl);

	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.status}`);
	}

	const contentType = response.headers.get('content-type') || 'image/png';
	const arrayBuffer = await response.arrayBuffer();
	const base64 = Buffer.from(arrayBuffer).toString('base64');

	return {
		base64,
		mimeType: contentType
	};
}
