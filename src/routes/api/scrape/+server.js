import { json } from '@sveltejs/kit';
import { scrapeProductPage, fetchImageAsBase64 } from '$lib/server/services/firecrawl.js';
import { db } from '$lib/server/db/index.js';
import { generation } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { generationId } = await request.json();

		if (!generationId) {
			return json({ error: 'generationId is required' }, { status: 400 });
		}

		// Get the generation record
		const [gen] = await db.select().from(generation).where(eq(generation.id, generationId));

		if (!gen) {
			return json({ error: 'Generation not found' }, { status: 404 });
		}

		// Update status
		await db.update(generation)
			.set({ currentStep: 'scraping', updatedAt: new Date() })
			.where(eq(generation.id, generationId));

		// Scrape the product page
		const { imageUrl } = await scrapeProductPage(gen.productUrl);

		// Fetch and convert to base64
		const { base64, mimeType } = await fetchImageAsBase64(imageUrl);

		// Update the generation with the product image URL
		await db.update(generation)
			.set({
				productImageUrl: imageUrl,
				updatedAt: new Date()
			})
			.where(eq(generation.id, generationId));

		return json({
			success: true,
			imageUrl,
			base64,
			mimeType
		});
	} catch (error) {
		console.error('Scrape error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}
