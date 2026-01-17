import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { generation, generatedImage } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const generationId = url.searchParams.get('id');

		if (!generationId) {
			return json({ error: 'id is required' }, { status: 400 });
		}

		// Get generation with images
		const [gen] = await db.select().from(generation).where(eq(generation.id, generationId));

		if (!gen) {
			return json({ error: 'Generation not found' }, { status: 404 });
		}

		// Get generated images
		const images = await db.select()
			.from(generatedImage)
			.where(eq(generatedImage.generationId, generationId));

		return json({
			generation: gen,
			images
		});
	} catch (error) {
		console.error('Get generation error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { productUrl, productImageUrl } = await request.json();

		// Debe tener al menos una de las dos
		if (!productUrl && !productImageUrl) {
			return json({ error: 'productUrl or productImageUrl is required' }, { status: 400 });
		}

		// Validar URL si se proporciona
		if (productUrl) {
			try {
				new URL(productUrl);
			} catch {
				return json({ error: 'Invalid URL format' }, { status: 400 });
			}
		}

		// Create new generation with payment_required status
		const [newGeneration] = await db.insert(generation)
			.values({
				productUrl: productUrl || null,
				productImageUrl: productImageUrl || null,
				status: 'payment_required'
			})
			.returning();

		return json({
			success: true,
			generation: newGeneration
		});
	} catch (error) {
		console.error('Create generation error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ request }) {
	try {
		const { generationId, status: newStatus, paymentStatus } = await request.json();

		if (!generationId) {
			return json({ error: 'generationId is required' }, { status: 400 });
		}

		const updates = { updatedAt: new Date() };

		if (newStatus) {
			const validStatuses = ['pending', 'payment_required', 'processing', 'completed', 'failed'];
			if (!validStatuses.includes(newStatus)) {
				return json({ error: 'Invalid status' }, { status: 400 });
			}
			// @ts-ignore
			updates.status = newStatus;
		}

		if (paymentStatus) {
			const validPaymentStatuses = ['pending', 'completed'];
			if (!validPaymentStatuses.includes(paymentStatus)) {
				return json({ error: 'Invalid payment status' }, { status: 400 });
			}
			// @ts-ignore
			updates.paymentStatus = paymentStatus;
		}

		const [updated] = await db.update(generation)
			.set(updates)
			.where(eq(generation.id, generationId))
			.returning();

		if (!updated) {
			return json({ error: 'Generation not found' }, { status: 404 });
		}

		return json({
			success: true,
			generation: updated
		});
	} catch (error) {
		console.error('Update generation error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}
