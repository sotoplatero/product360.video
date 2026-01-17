import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	age: integer('age')
});

// Tabla de generaciones de assets
export const generation = sqliteTable('generation', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	productUrl: text('product_url').notNull(),
	productImageUrl: text('product_image_url'),
	status: text('status').default('pending'), // pending, payment_required, processing, completed, failed
	currentStep: text('current_step'), // scraping, generating_canvas, extracting_images, generating_video
	paymentStatus: text('payment_status').default('pending'), // pending, completed
	paymentIntentId: text('payment_intent_id'),
	canvasImageUrl: text('canvas_image_url'),
	videoOperationName: text('video_operation_name'),
	videoUrl: text('video_url'),
	error: text('error'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Tabla de imágenes extraídas (4 cuadrantes)
export const generatedImage = sqliteTable('generated_image', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	generationId: text('generation_id').notNull().references(() => generation.id),
	position: text('position').notNull(), // top-left, top-right, bottom-left, bottom-right
	imageUrl: text('image_url').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
