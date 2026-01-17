import { env } from '$env/dynamic/private';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * @typedef {Object} VideoGenerationResult
 * @property {string} operationName - The operation name for status polling
 */

/**
 * Start video generation using Google Veo
 * @param {Object} options
 * @param {string} options.originalImageBase64 - Original product image
 * @param {string[]} options.extractedImagesBase64 - Array of extracted quadrant images (at least 2)
 * @returns {Promise<VideoGenerationResult>}
 */
export async function startVideoGeneration({ originalImageBase64, extractedImagesBase64 }) {
	if (!env.GOOGLE_GEMINI_API_KEY) {
		throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
	}

	if (extractedImagesBase64.length < 2) {
		throw new Error('At least 2 extracted images are required for video generation');
	}

	const prompt = `Create a smooth, seamless product showcase video of the provided ecommerce. Please pay close attention to the product dimensions and marks on the provided reference image ingredients. The scaling needs to be right, so the object that we're actually showing in this video matches what that object looks like in reality. It's very important you get the hyperrealism correct here.

VIDEO SPECIFICATIONS:
- Duration: 4-6 seconds
- Motion: Continuous smooth rotation, clockwise direction
- Speed: Slow, elegant rotation completing one full 360° turn
- Loop: The end frame should seamlessly connect back to the start frame for perfect looping

PRODUCT & CAMERA:
- Product stays perfectly centered throughout the entire rotation
- Camera remains completely stationary - only the product rotates
- Maintain consistent distance and framing - no zoom or camera movement
- Eye-level perspective, straight-on angle

LIGHTING & ENVIRONMENT:
- Pure white background (#FFFFFF), clean studio setting
- Soft, even studio lighting that remains constant throughout rotation
- Subtle reflections and shadows for depth and realism
- No harsh shadows or lighting changes during rotation

QUALITY:
- Photorealistic rendering matching the reference images
- Preserve all product details: colors, textures, branding
- Smooth motion with no stuttering, jumping, or warping
- High-end e-commerce product video quality

AUDIO:
- Completely muted audio
- No music allowed in output
- No sound effects allowed in the output

REFERENCE: Use the provided images as keyframes showing the product from different angles. The video should smoothly transition through all these views in a continuous rotation.`;

	// Build reference images array
	const referenceImages = [
		{
			image: {
				bytesBase64Encoded: originalImageBase64,
				mimeType: 'image/png'
			},
			referenceType: 'STYLE_IMAGE'
		},
		{
			image: {
				bytesBase64Encoded: extractedImagesBase64[0],
				mimeType: 'image/png'
			},
			referenceType: 'STYLE_IMAGE'
		},
		{
			image: {
				bytesBase64Encoded: extractedImagesBase64[1],
				mimeType: 'image/png'
			},
			referenceType: 'STYLE_IMAGE'
		}
	];

	const response = await fetch(
		`${GEMINI_API_URL}/models/veo-2.0-generate-001:predictLongRunning?key=${env.GOOGLE_GEMINI_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				instances: [{
					prompt,
					referenceImages
				}],
				parameters: {
					aspectRatio: '16:9',
					durationSeconds: 8,
					personGeneration: 'dont_allow'
				}
			})
		}
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Veo API error: ${response.status} - ${errorText}`);
	}

	const data = await response.json();

	if (!data.name) {
		throw new Error('No operation name returned from Veo API');
	}

	return { operationName: data.name };
}

/**
 * @typedef {Object} VideoStatusResult
 * @property {boolean} done - Whether the operation is complete
 * @property {string} [videoUri] - The video URI (if done)
 * @property {string} [error] - Error message (if failed)
 */

/**
 * Check the status of a video generation operation
 * @param {string} operationName - The operation name returned from startVideoGeneration
 * @returns {Promise<VideoStatusResult>}
 */
export async function checkVideoStatus(operationName) {
	if (!env.GOOGLE_GEMINI_API_KEY) {
		throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
	}

	const response = await fetch(
		`${GEMINI_API_URL}/${operationName}?key=${env.GOOGLE_GEMINI_API_KEY}`,
		{
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		}
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Veo status API error: ${response.status} - ${errorText}`);
	}

	const data = await response.json();

	// Check if operation is complete
	if (data.done) {
		// Check for error
		if (data.error) {
			return {
				done: true,
				error: data.error.message || 'Video generation failed'
			};
		}

		// Extract video URI
		const videoUri = data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;

		if (!videoUri) {
			return {
				done: true,
				error: 'No video URI in response'
			};
		}

		return {
			done: true,
			videoUri
		};
	}

	return { done: false };
}

/**
 * Download a video from Google's servers
 * @param {string} videoUri - The video URI from Veo
 * @returns {Promise<Buffer>} - The video buffer
 */
export async function downloadVideo(videoUri) {
	if (!env.GOOGLE_GEMINI_API_KEY) {
		throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
	}

	// The videoUri might need the API key appended
	const url = videoUri.includes('?')
		? `${videoUri}&key=${env.GOOGLE_GEMINI_API_KEY}`
		: `${videoUri}?key=${env.GOOGLE_GEMINI_API_KEY}`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to download video: ${response.status}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}
