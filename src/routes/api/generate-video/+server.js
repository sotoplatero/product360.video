import { json } from '@sveltejs/kit';
import { startVideoGeneration } from '$lib/server/services/veo.js';
import { db } from '$lib/server/db/index.js';
import { generation, generatedImage } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { getFile } from '$lib/server/services/r2.js';
import { env } from '$env/dynamic/private';

/**
 * Extract R2 key from URL
 * @param {string} url
 * @returns {string}
 */
function extractKeyFromUrl(url) {
	const publicUrl = env.R2_PUBLIC_URL || '';
	if (url.startsWith(publicUrl)) {
		return url.replace(publicUrl + '/', '');
	}
	if (url.includes('.r2.cloudflarestorage.com/')) {
		const parts = url.split('.r2.cloudflarestorage.com/');
		if (parts[1]) {
			const pathParts = parts[1].split('/');
			if (pathParts[0] === env.R2_BUCKET_NAME) {
				return pathParts.slice(1).join('/');
			}
			return parts[1];
		}
	}
	return url;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { generationId, originalImageBase64 } = await request.json();

		if (!generationId || !originalImageBase64) {
			return json({
				error: 'generationId and originalImageBase64 are required'
			}, { status: 400 });
		}

		// Update status
		await db.update(generation)
			.set({ currentStep: 'generating_video', updatedAt: new Date() })
			.where(eq(generation.id, generationId));

		// Load extracted images from DB to use as additional references
		const images = await db.select().from(generatedImage).where(eq(generatedImage.generationId, generationId));

		// Get base64 of first 2 extracted images (like n8n does)
		const extractedImagesBase64 = [];
		for (const img of images.slice(0, 2)) {
			if (img.imageUrl) {
				const key = extractKeyFromUrl(img.imageUrl);
				const fileBuffer = await getFile(key);
				const base64 = Buffer.from(fileBuffer).toString('base64');
				extractedImagesBase64.push(base64);
			}
		}

		// Start video generation with Veo 3.1
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
