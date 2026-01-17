<script>
	import ProcessingStatus from '$lib/components/ProcessingStatus.svelte';
	import ImageGallery from '$lib/components/ImageGallery.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	// Generation state
	let isProcessing = $state(false);
	let currentError = $state('');

	// Data for generation process
	let originalImageBase64 = $state('');
	let originalImageMimeType = $state('image/png');
	let canvasBase64 = $state('');
	let extractedImages = $state(/** @type {Array<{position: string, base64: string}>} */ ([]));

	// Processing steps
	let steps = $state([
		{ name: 'Scraping product page', status: /** @type {'pending' | 'active' | 'completed' | 'error'} */ ('pending'), message: '' },
		{ name: 'Generating product views', status: /** @type {'pending' | 'active' | 'completed' | 'error'} */ ('pending'), message: '' },
		{ name: 'Extracting individual images', status: /** @type {'pending' | 'active' | 'completed' | 'error'} */ ('pending'), message: '' },
		{ name: 'Generating 360° video', status: /** @type {'pending' | 'active' | 'completed' | 'error'} */ ('pending'), message: '' }
	]);

	// Derived state
	let showPayment = $derived(data.generation.status === 'payment_required');
	let showProcessing = $derived(data.generation.status === 'processing' || isProcessing);
	let showResults = $derived(data.generation.status === 'completed');
	let showError = $derived(data.generation.status === 'failed' || currentError);

	// Skip payment and start processing (demo mode)
	async function skipPayment() {
		try {
			// Update status to processing
			await fetch('/api/generation', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					generationId: data.generation.id,
					status: 'processing',
					paymentStatus: 'completed'
				})
			});

			await invalidateAll();
			startGeneration();
		} catch (err) {
			currentError = err instanceof Error ? err.message : 'Failed to start';
		}
	}

	// Start the generation process
	async function startGeneration() {
		isProcessing = true;
		currentError = '';

		try {
			// Step 1: Scrape product page
			steps[0].status = 'active';
			steps[0].message = 'Extracting product image from URL...';

			const scrapeRes = await fetch('/api/scrape', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ generationId: data.generation.id })
			});

			const scrapeData = await scrapeRes.json();
			if (!scrapeRes.ok) throw new Error(scrapeData.error);

			originalImageBase64 = scrapeData.base64;
			originalImageMimeType = scrapeData.mimeType;
			steps[0].status = 'completed';
			steps[0].message = 'Product image extracted';

			// Step 2: Generate canvas
			steps[1].status = 'active';
			steps[1].message = 'Creating 4 product views with AI...';

			const canvasRes = await fetch('/api/generate-canvas', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					generationId: data.generation.id,
					imageBase64: originalImageBase64,
					mimeType: originalImageMimeType
				})
			});

			const canvasData = await canvasRes.json();
			if (!canvasRes.ok) throw new Error(canvasData.error);

			canvasBase64 = canvasData.canvasBase64;
			steps[1].status = 'completed';
			steps[1].message = 'Product views generated';

			// Step 3: Extract quadrants
			steps[2].status = 'active';
			const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

			for (let i = 0; i < positions.length; i++) {
				const position = positions[i];
				steps[2].message = `Extracting view ${i + 1} of 4...`;

				const extractRes = await fetch('/api/extract-quadrant', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						generationId: data.generation.id,
						canvasBase64,
						position
					})
				});

				const extractData = await extractRes.json();
				if (!extractRes.ok) throw new Error(extractData.error);

				extractedImages.push({ position, base64: extractData.imageBase64 });
			}

			steps[2].status = 'completed';
			steps[2].message = 'All views extracted';

			// Step 4: Generate video
			steps[3].status = 'active';
			steps[3].message = 'Starting video generation...';

			const videoRes = await fetch('/api/generate-video', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					generationId: data.generation.id,
					originalImageBase64,
					extractedImagesBase64: extractedImages.slice(0, 2).map(img => img.base64)
				})
			});

			const videoData = await videoRes.json();
			if (!videoRes.ok) throw new Error(videoData.error);

			// Poll for video completion
			const operationName = videoData.operationName;
			steps[3].message = 'Video is being generated (this may take a few minutes)...';

			let videoComplete = false;
			let pollCount = 0;
			const maxPolls = 60; // ~10 minutes max

			while (!videoComplete && pollCount < maxPolls) {
				await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

				const statusRes = await fetch(
					`/api/check-video-status?generationId=${data.generation.id}&operationName=${encodeURIComponent(operationName)}`
				);
				const statusData = await statusRes.json();

				if (statusData.error) {
					throw new Error(statusData.error);
				}

				if (statusData.done) {
					videoComplete = true;
					steps[3].status = 'completed';
					steps[3].message = 'Video generated successfully!';
				} else {
					pollCount++;
					steps[3].message = `Video is being generated... (${Math.floor(pollCount * 10 / 60)} min)`;
				}
			}

			if (!videoComplete) {
				throw new Error('Video generation timed out. Please try again.');
			}

			// Refresh page data
			await invalidateAll();
			isProcessing = false;

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			currentError = errorMessage;

			// Mark current step as error
			const activeStep = steps.find(s => s.status === 'active');
			if (activeStep) {
				activeStep.status = 'error';
				activeStep.message = errorMessage;
			}

			// Update generation status to failed
			await fetch('/api/generation', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					generationId: data.generation.id,
					status: 'failed'
				})
			});

			isProcessing = false;
		}
	}

	// Auto-start if already processing
	onMount(() => {
		if (data.generation.status === 'processing' && !data.generation.videoUrl) {
			startGeneration();
		}
	});
</script>

<svelte:head>
	<title>Generate Assets - Product360.video</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-4xl mx-auto px-4 py-12">
		<!-- Header -->
		<div class="mb-8">
			<a href="/" class="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Back to home
			</a>
			<h1 class="text-3xl font-bold text-gray-900">Product Asset Generator</h1>
			<p class="text-gray-600 mt-2 break-all">{data.generation.productUrl}</p>
		</div>

		<!-- Payment Section -->
		{#if showPayment}
			<div class="bg-white rounded-2xl shadow-lg p-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Generate</h2>

				<div class="bg-gray-50 rounded-lg p-6 mb-6">
					<h3 class="font-semibold text-gray-900 mb-4">What you'll get:</h3>
					<ul class="space-y-3">
						<li class="flex items-center gap-3">
							<svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span>4 AI-generated product views (90°, 180°, 270°, 360°)</span>
						</li>
						<li class="flex items-center gap-3">
							<svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span>High-quality 360° product rotation video</span>
						</li>
						<li class="flex items-center gap-3">
							<svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span>Download all assets for your store</span>
						</li>
					</ul>
				</div>

				<div class="border-t pt-6">
					<div class="flex items-center justify-between mb-6">
						<span class="text-lg font-semibold">Total</span>
						<span class="text-2xl font-bold">$9.99</span>
					</div>

					<button
						disabled
						class="w-full bg-gray-300 text-gray-500 py-4 rounded-lg font-semibold cursor-not-allowed mb-4"
					>
						Pay & Generate (Coming Soon)
					</button>

					<button
						onclick={skipPayment}
						class="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
					>
						Skip Payment (Demo Mode)
					</button>

					<p class="text-sm text-gray-500 text-center mt-4">
						Payment integration coming soon. Click "Skip Payment" to test the generation.
					</p>
				</div>
			</div>
		{/if}

		<!-- Processing Section -->
		{#if showProcessing}
			<div class="bg-white rounded-2xl shadow-lg p-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Generating Your Assets</h2>
				<ProcessingStatus {steps} />
			</div>
		{/if}

		<!-- Error Section -->
		{#if showError && !showProcessing}
			<div class="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
				<h2 class="text-xl font-bold text-red-700 mb-2">Generation Failed</h2>
				<p class="text-red-600">{currentError || data.generation.error}</p>
				<button
					onclick={skipPayment}
					class="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
				>
					Try Again
				</button>
			</div>
		{/if}

		<!-- Results Section -->
		{#if showResults}
			<div class="space-y-8">
				<div class="bg-white rounded-2xl shadow-lg p-8">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
							<svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 class="text-2xl font-bold text-gray-900">Generation Complete!</h2>
					</div>

					<ImageGallery images={data.images} canvasUrl={data.generation.canvasImageUrl} />
				</div>

				{#if data.generation.videoUrl}
					<div class="bg-white rounded-2xl shadow-lg p-8">
						<VideoPlayer videoUrl={data.generation.videoUrl} />
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
