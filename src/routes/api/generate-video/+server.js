import { json } from '@sveltejs/kit';
import { startVideoGeneration } from '$lib/server/services/veo.js';
import { db } from '$lib/server/db/index.js';
import { generation } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { generationId, originalImageBase64, extractedImagesBase64 } = await request.json();

		if (!generationId || !originalImageBase64 || !extractedImagesBase64) {
			return json({
				error: 'generationId, originalImageBase64, and extractedImagesBase64 are required'
			}, { status: 400 });
		}

		if (!Array.isArray(extractedImagesBase64) || extractedImagesBase64.length < 2) {
			return json({
				error: 'extractedImagesBase64 must be an array with at least 2 images'
			}, { status: 400 });
		}

		// Update status
		await db.update(generation)
			.set({ currentStep: 'generating_video', updatedAt: new Date() })
			.where(eq(generation.id, generationId));

		// Start video generation
		const { operationName } = await startVideoGeneration({
			originalImageBase64,
			extractedImagesBase64
		});

		// Save operation name for polling
		await db.update(generation)
			.set({
				videoOperationName: operationName,
				updatedAt: new Date()
			})
			.where(eq(generation.id, generationId));

		return json({
			success: true,
			operationName
		});
	} catch (error) {
		console.error('Generate video error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}
