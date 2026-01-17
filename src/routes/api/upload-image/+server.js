import { json } from '@sveltejs/kit';
import { uploadFile } from '$lib/server/services/r2.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('image');

		if (!file || !(file instanceof File)) {
			return json({ error: 'No image file provided' }, { status: 400 });
		}

		// Validar tipo de archivo
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
		if (!allowedTypes.includes(file.type)) {
			return json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF' }, { status: 400 });
		}

		// Validar tamaño (max 10MB)
		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			return json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 });
		}

		// Generar ID único para el archivo
		const uploadId = crypto.randomUUID();
		const extension = file.name.split('.').pop() || 'png';
		const filename = `uploads/${uploadId}/original.${extension}`;

		// Convertir a buffer y subir
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const imageUrl = await uploadFile({
			key: filename,
			body: buffer,
			contentType: file.type
		});

		return json({
			success: true,
			imageUrl,
			uploadId
		});
	} catch (error) {
		console.error('Upload image error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Upload failed'
		}, { status: 500 });
	}
}
