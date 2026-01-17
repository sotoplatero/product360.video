import { json } from '@sveltejs/kit';
import { generateProductCanvas } from '$lib/server/services/gemini.js';
import { uploadBase64Image } from '$lib/server/services/r2.js';
import { db } from '$lib/server/db/index.js';
import { generation } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { generationId, imageBase64, mimeType = 'image/png' } = await request.json();

		if (!generationId || !imageBase64) {
			return json({ error: 'generationId and imageBase64 are required' }, { status: 400 });
		}

		// Update status
		await db.update(generation)
			.set({ currentStep: 'generating_canvas', updatedAt: new Date() })
			.where(eq(generation.id, generationId));

		// Generate the 2x2 canvas with Gemini
		const canvasBase64 = await generateProductCanvas(imageBase64, mimeType);

		// Upload to R2
		const canvasUrl = await uploadBase64Image({
			base64: canvasBase64,
			generationId,
			filename: 'canvas.png'
		});

		// Update the generation with canvas URL
		await db.update(generation)
			.set({
				canvasImageUrl: canvasUrl,
				updatedAt: new Date()
			})
			.where(eq(generation.id, generationId));

		return json({
			success: true,
			canvasBase64,
			canvasUrl
		});
	} catch (error) {
		console.error('Generate canvas error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}
