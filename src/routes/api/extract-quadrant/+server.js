import { json } from '@sveltejs/kit';
import { extractQuadrant } from '$lib/server/services/gemini.js';
import { uploadBase64Image } from '$lib/server/services/r2.js';
import { db } from '$lib/server/db/index.js';
import { generation, generatedImage } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { generationId, canvasBase64, position } = await request.json();

		if (!generationId || !canvasBase64 || !position) {
			return json({
				error: 'generationId, canvasBase64, and position are required'
			}, { status: 400 });
		}

		const validPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
		if (!validPositions.includes(position)) {
			return json({
				error: `Invalid position. Must be one of: ${validPositions.join(', ')}`
			}, { status: 400 });
		}

		// Update status
		await db.update(generation)
			.set({ currentStep: 'extracting_images', updatedAt: new Date() })
			.where(eq(generation.id, generationId));

		// Extract the quadrant using Gemini
		const imageBase64 = await extractQuadrant(canvasBase64, position);

		// Upload to R2
		const imageUrl = await uploadBase64Image({
			base64: imageBase64,
			generationId,
			filename: `${position}.png`
		});

		// Save to database
		await db.insert(generatedImage).values({
			generationId,
			position,
			imageUrl
		});

		return json({
			success: true,
			imageBase64,
			imageUrl,
			position
		});
	} catch (error) {
		console.error('Extract quadrant error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}
