import { json } from '@sveltejs/kit';
import { getFile } from '$lib/server/services/r2.js';
import { db } from '$lib/server/db/index.js';
import { generation } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { generationId } = await request.json();

		if (!generationId) {
			return json({ error: 'generationId is required' }, { status: 400 });
		}

		const [gen] = await db.select().from(generation).where(eq(generation.id, generationId));

		if (!gen) {
			return json({ error: 'Generation not found' }, { status: 404 });
		}

		if (!gen.canvasImageUrl) {
			return json({ error: 'No canvas image URL found' }, { status: 400 });
		}

		// Extraer el key del archivo desde la URL
		const publicUrl = env.R2_PUBLIC_URL || '';
		let key = gen.canvasImageUrl;

		if (gen.canvasImageUrl.startsWith(publicUrl)) {
			key = gen.canvasImageUrl.replace(publicUrl + '/', '');
		} else if (gen.canvasImageUrl.includes('.r2.cloudflarestorage.com/')) {
			const parts = gen.canvasImageUrl.split('.r2.cloudflarestorage.com/');
			if (parts[1]) {
				const pathParts = parts[1].split('/');
				if (pathParts[0] === env.R2_BUCKET_NAME) {
					key = pathParts.slice(1).join('/');
				} else {
					key = parts[1];
				}
			}
		}

		// Leer directamente desde R2
		const fileBuffer = await getFile(key);
		const base64 = Buffer.from(fileBuffer).toString('base64');

		return json({
			success: true,
			base64,
			mimeType: 'image/png'
		});
	} catch (error) {
		console.error('Get canvas base64 error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}
