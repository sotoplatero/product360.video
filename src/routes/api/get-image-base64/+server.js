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

		// Get the generation record
		const [gen] = await db.select().from(generation).where(eq(generation.id, generationId));

		if (!gen) {
			return json({ error: 'Generation not found' }, { status: 404 });
		}

		if (!gen.productImageUrl) {
			return json({ error: 'No product image URL found' }, { status: 400 });
		}

		// Extraer el key del archivo desde la URL
		// URL format: https://...r2.cloudflarestorage.com/bucket/key or R2_PUBLIC_URL/key
		const publicUrl = env.R2_PUBLIC_URL || '';
		let key = gen.productImageUrl;

		if (gen.productImageUrl.startsWith(publicUrl)) {
			key = gen.productImageUrl.replace(publicUrl + '/', '');
		} else if (gen.productImageUrl.includes('.r2.cloudflarestorage.com/')) {
			// Extraer key después del bucket name
			const parts = gen.productImageUrl.split('.r2.cloudflarestorage.com/');
			if (parts[1]) {
				// Quitar el nombre del bucket si está presente
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

		// Determinar mimeType desde la extensión
		const extension = key.split('.').pop()?.toLowerCase() || 'png';
		const mimeTypes = {
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png': 'image/png',
			'webp': 'image/webp',
			'gif': 'image/gif'
		};
		const mimeType = mimeTypes[extension] || 'image/png';

		return json({
			success: true,
			imageUrl: gen.productImageUrl,
			base64,
			mimeType
		});
	} catch (error) {
		console.error('Get image base64 error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}
