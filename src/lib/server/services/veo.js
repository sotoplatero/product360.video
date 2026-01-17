import { env } from '$env/dynamic/private';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * @typedef {Object} VideoGenerationResult
 * @property {string} operationName - The operation name for status polling
 */

/**
 * Start video generation using Google Veo 2.0
 * @param {Object} options
 * @param {string} options.originalImageBase64 - Original product image
 * @param {string[]} [options.extractedImagesBase64] - Array of extracted quadrant images
 * @returns {Promise<VideoGenerationResult>}
 */
export async function startVideoGeneration({ originalImageBase64, extractedImagesBase64 = [] }) {
	if (!env.GOOGLE_GEMINI_API_KEY) {
		throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
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
- Preserve all product details: matte black finish, gold/champagne metal accents, BOSE branding
- Smooth motion with no stuttering, jumping, or warping
- High-end e-commerce product video quality

AUDIO:
- Completely muted audio
- Without music in output
- Without sound effects in the output

REFERENCE IMAGES: Use the provided images as keyframes showing the product from different angles. The video should smoothly transition through all these views in a continuous rotation.`;

	// Build referenceImages array - original image + extracted quadrant images (like n8n)
	const referenceImages = [
		{
			image: {
				bytesBase64Encoded: originalImageBase64,
				mimeType: 'image/png'
			},
			referenceType: 'asset'
		}
	];

	// Add extracted images as additional references (up to 2 like n8n)
	for (const imgBase64 of extractedImagesBase64.slice(0, 2)) {
		referenceImages.push({
			image: {
				bytesBase64Encoded: imgBase64,
				mimeType: 'image/png'
			},
			referenceType: 'asset'
		});
	}

	// Veo 3.1 con la estructura exacta de n8n
	const response = await fetch(
		`${GEMINI_API_URL}/models/veo-3.1-generate-preview:predictLongRunning?key=${env.GOOGLE_GEMINI_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				instances: [{
					prompt,
					referenceImages
				}],
				parameters: {
					durationSeconds: 8,
					personGeneration: 'allow_adult'
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

	// Log full response for debugging
	console.log('Veo status response:', JSON.stringify(data, null, 2));

	// Check if operation is complete
	if (data.done) {
		// Check for error
		if (data.error) {
			return {
				done: true,
				error: data.error.message || 'Video generation failed'
			};
		}

		// Try multiple paths to extract video URI (different Veo versions have different response structures)
		let videoUri =
			// Veo 2.0 path
			data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
			// Alternative paths for Veo 3.x
			data.response?.videos?.[0]?.uri ||
			data.response?.generatedVideos?.[0]?.uri ||
			data.result?.videos?.[0]?.uri ||
			data.result?.generatedSamples?.[0]?.video?.uri ||
			// Vertex AI style
			data.response?.predictions?.[0]?.video?.uri ||
			data.metadata?.videos?.[0]?.uri;

		if (!videoUri) {
			console.error('Full Veo response (no URI found):', JSON.stringify(data, null, 2));

			// Check if it was filtered by RAI (safety filters)
			const raiReasons = data.response?.generateVideoResponse?.raiMediaFilteredReasons;
			if (raiReasons && raiReasons.length > 0) {
				return {
					done: true,
					error: raiReasons[0]
				};
			}

			return {
				done: true,
				error: 'No video URI in response. Check server logs for full response.'
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
