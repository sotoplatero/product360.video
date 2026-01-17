import { db } from '$lib/server/db/index.js';
import { generation, generatedImage } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { id } = params;

	const [gen] = await db.select().from(generation).where(eq(generation.id, id));

	if (!gen) {
		throw error(404, 'Generation not found');
	}

	const images = await db.select()
		.from(generatedImage)
		.where(eq(generatedImage.generationId, id));

	return {
		generation: gen,
		images
	};
}
