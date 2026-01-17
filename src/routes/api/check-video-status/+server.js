import { json } from '@sveltejs/kit';
import { checkVideoStatus, downloadVideo } from '$lib/server/services/veo.js';
import { uploadVideo } from '$lib/server/services/r2.js';
import { db } from '$lib/server/db/index.js';
import { generation } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const generationId = url.searchParams.get('generationId');
		const operationName = url.searchParams.get('operationName');

		if (!generationId || !operationName) {
			return json({
				error: 'generationId and operationName are required'
			}, { status: 400 });
		}

		// Check video generation status
		const status = await checkVideoStatus(operationName);

		if (!status.done) {
			return json({
				done: false,
				message: 'Video is still being generated...'
			});
		}

		if (status.error) {
			// Update generation with error
			await db.update(generation)
				.set({
					status: 'failed',
					error: status.error,
					updatedAt: new Date()
				})
				.where(eq(generation.id, generationId));

			return json({
				done: true,
				error: status.error
			});
		}

		// Video is ready - download and upload to R2
		if (status.videoUri) {
			const videoBuffer = await downloadVideo(status.videoUri);

			const videoUrl = await uploadVideo({
				buffer: videoBuffer,
				generationId,
				filename: 'product-360.mp4'
			});

			// Update generation with video URL and mark as complete
			await db.update(generation)
				.set({
					videoUrl,
					status: 'completed',
					updatedAt: new Date()
				})
				.where(eq(generation.id, generationId));

			return json({
				done: true,
				videoUrl
			});
		}

		return json({
			done: true,
			error: 'No video URI in response'
		});
	} catch (error) {
		console.error('Check video status error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}
