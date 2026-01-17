import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

/** @type {S3Client | null} */
let client = null;

function getClient() {
	if (!client) {
		if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
			throw new Error('R2 credentials not configured');
		}
		client = new S3Client({
			region: 'auto',
			endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: env.R2_ACCESS_KEY_ID,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY
			}
		});
	}
	return client;
}

/**
 * Upload a file to R2
 * @param {Object} options
 * @param {string} options.key - The file key/path in the bucket
 * @param {Buffer | Uint8Array | string} options.body - The file content
 * @param {string} options.contentType - MIME type of the file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadFile({ key, body, contentType }) {
	const s3Client = getClient();

	await s3Client.send(new PutObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: key,
		Body: body,
		ContentType: contentType
	}));

	return `${env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Upload a base64 encoded image to R2
 * @param {Object} options
 * @param {string} options.base64 - Base64 encoded image data
 * @param {string} options.generationId - The generation ID for organizing files
 * @param {string} options.filename - The filename to use
 * @param {string} [options.contentType='image/png'] - MIME type
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadBase64Image({ base64, generationId, filename, contentType = 'image/png' }) {
	const buffer = Buffer.from(base64, 'base64');
	const key = `generations/${generationId}/${filename}`;

	return uploadFile({ key, body: buffer, contentType });
}

/**
 * Upload a video to R2
 * @param {Object} options
 * @param {Buffer | Uint8Array} options.buffer - The video buffer
 * @param {string} options.generationId - The generation ID for organizing files
 * @param {string} options.filename - The filename to use
 * @param {string} [options.contentType='video/mp4'] - MIME type
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadVideo({ buffer, generationId, filename, contentType = 'video/mp4' }) {
	const key = `generations/${generationId}/${filename}`;

	return uploadFile({ key, body: buffer, contentType });
}

/**
 * Get a file from R2
 * @param {string} key - The file key/path in the bucket
 * @returns {Promise<Uint8Array>} - The file content as a buffer
 */
export async function getFile(key) {
	const s3Client = getClient();

	const response = await s3Client.send(new GetObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: key
	}));

	return response.Body?.transformToByteArray() ?? new Uint8Array();
}
