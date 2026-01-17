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

	// Initialize steps based on current progress
	function initializeSteps() {
		const gen = data.generation;
		const existingImages = data.images || [];
		const hasImage = !!gen.productImageUrl;
		const hasCanvas = !!gen.canvasImageUrl;
		const hasAllImages = existingImages.length >= 4;
		const hasVideoOperation = !!gen.videoOperationName;
		const hasVideo = !!gen.videoUrl;
		const isFailed = gen.status === 'failed';

		// Determine which step failed (the first incomplete step when status is failed)
		let failedStep = -1;
		if (isFailed) {
			if (!hasImage) failedStep = 0;
			else if (!hasCanvas) failedStep = 1;
			else if (!hasAllImages) failedStep = 2;
			else if (!hasVideo) failedStep = 3;
		}

		return [
			{
				name: 'Preparing image',
				status: /** @type {'pending' | 'active' | 'completed' | 'error'} */ (
					hasImage ? 'completed' : (failedStep === 0 ? 'error' : 'pending')
				),
				message: hasImage ? 'Image ready' : (failedStep === 0 ? (gen.error || 'Failed') : '')
			},
			{
				name: 'Generating product views',
				status: /** @type {'pending' | 'active' | 'completed' | 'error'} */ (
					hasCanvas ? 'completed' : (failedStep === 1 ? 'error' : 'pending')
				),
				message: hasCanvas ? 'Product views generated' : (failedStep === 1 ? (gen.error || 'Failed') : '')
			},
			{
				name: 'Extracting individual images',
				status: /** @type {'pending' | 'active' | 'completed' | 'error'} */ (
					hasAllImages ? 'completed' : (failedStep === 2 ? 'error' : 'pending')
				),
				message: hasAllImages ? 'All views extracted' : (failedStep === 2 ? (gen.error || 'Failed') : '')
			},
			{
				name: 'Generating 360° video',
				status: /** @type {'pending' | 'active' | 'completed' | 'error'} */ (
					hasVideo ? 'completed' :
					failedStep === 3 ? 'error' :
					hasVideoOperation ? 'active' : 'pending'
				),
				message: hasVideo ? 'Video generated successfully!' :
					failedStep === 3 ? (gen.error || 'Failed') :
					hasVideoOperation ? 'Video is being generated...' : ''
			}
		];
	}

	// Processing steps
	let steps = $state(initializeSteps());

	// Derived state
	let showPayment = $derived(data.generation.status === 'payment_required');
	let showProcessing = $derived(data.generation.status === 'processing' || isProcessing);
	let showResults = $derived(data.generation.status === 'completed');

	// Check if there's an error in any step (including when loaded from failed status)
	let hasStepError = $derived(steps.some(s => s.status === 'error'));

	// Show progress section when processing, has step error, or status is failed with progress
	let showProgressSection = $derived(
		showProcessing ||
		hasStepError ||
		(data.generation.status === 'failed' && steps.some(s => s.status === 'completed'))
	);

	// Retry generation from where it failed
	async function retryGeneration() {
		// Reset error state
		currentError = '';

		// Reset step that had error back to pending
		for (const step of steps) {
			if (step.status === 'error') {
				step.status = 'pending';
				step.message = '';
			}
		}

		// Update status back to processing
		await fetch('/api/generation', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				generationId: data.generation.id,
				status: 'processing'
			})
		});

		await invalidateAll();
		startGeneration();
	}

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

	// Start the generation process (with resume support)
	async function startGeneration() {
		isProcessing = true;
		currentError = '';

		// Verificar estado actual para reanudar donde quedó
		const gen = data.generation;
		const existingImages = data.images || [];
		const hasCanvas = !!gen.canvasImageUrl;
		const hasAllImages = existingImages.length >= 4;
		const hasVideoOperation = !!gen.videoOperationName;
		const hasVideo = !!gen.videoUrl;

		try {
			// Step 1: Get uploaded image as base64 (siempre necesario para pasos posteriores)
			steps[0].status = 'active';
			steps[0].message = 'Loading product image...';

			const imageRes = await fetch('/api/get-image-base64', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ generationId: gen.id })
			});

			const imageData = await imageRes.json();
			if (!imageRes.ok) throw new Error(imageData.error);

			originalImageBase64 = imageData.base64;
			originalImageMimeType = imageData.mimeType;
			steps[0].status = 'completed';
			steps[0].message = 'Image ready';

			// Step 2: Generate canvas (skip si ya existe)
			if (hasCanvas) {
				steps[1].status = 'completed';
				steps[1].message = 'Product views already generated';
				// Cargar canvas existente para usarlo en paso 3 si es necesario
				canvasBase64 = ''; // No lo necesitamos si ya tenemos las imágenes
			} else {
				steps[1].status = 'active';
				steps[1].message = 'Creating 4 product views with AI...';

				const canvasRes = await fetch('/api/generate-canvas', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						generationId: gen.id,
						imageBase64: originalImageBase64,
						mimeType: originalImageMimeType
					})
				});

				const canvasData = await canvasRes.json();
				if (!canvasRes.ok) throw new Error(canvasData.error);

				canvasBase64 = canvasData.canvasBase64;
				steps[1].status = 'completed';
				steps[1].message = 'Product views generated';
			}

			// Step 3: Extract quadrants (skip si ya existen las 4 imágenes)
			if (hasAllImages) {
				steps[2].status = 'completed';
				steps[2].message = 'All views already extracted';
			} else {
				steps[2].status = 'active';
				const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
				const existingPositions = existingImages.map((/** @type {{position: string}} */ img) => img.position);

				for (let i = 0; i < positions.length; i++) {
					const position = positions[i];

					// Skip si esta posición ya existe
					if (existingPositions.includes(position)) {
						continue;
					}

					steps[2].message = `Extracting view ${i + 1} of 4...`;

					// Si no tenemos canvas en memoria, necesitamos cargarlo
					if (!canvasBase64 && hasCanvas) {
						// Cargar canvas desde R2
						const canvasRes = await fetch('/api/get-canvas-base64', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ generationId: gen.id })
						});
						const canvasData = await canvasRes.json();
						if (canvasRes.ok) {
							canvasBase64 = canvasData.base64;
						}
					}

					const extractRes = await fetch('/api/extract-quadrant', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							generationId: gen.id,
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
			}

			// Step 4: Generate video (skip si ya existe, continuar polling si hay operación pendiente)
			if (hasVideo) {
				steps[3].status = 'completed';
				steps[3].message = 'Video already generated';
			} else if (hasVideoOperation) {
				// Continuar polling de operación existente
				steps[3].status = 'active';
				steps[3].message = 'Resuming video generation...';

				let videoComplete = false;
				let pollCount = 0;
				const maxPolls = 60;

				while (!videoComplete && pollCount < maxPolls) {
					const statusRes = await fetch(
						`/api/check-video-status?generationId=${gen.id}&operationName=${encodeURIComponent(gen.videoOperationName)}`
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
						await new Promise(resolve => setTimeout(resolve, 10000));
					}
				}

				if (!videoComplete) {
					throw new Error('Video generation timed out. Please try again.');
				}
			} else {
				// Iniciar nueva generación de video
				steps[3].status = 'active';
				steps[3].message = 'Starting video generation...';

				const videoRes = await fetch('/api/generate-video', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						generationId: gen.id,
						originalImageBase64
					})
				});

				const videoData = await videoRes.json();
				if (!videoRes.ok) throw new Error(videoData.error);

				const operationName = videoData.operationName;
				steps[3].message = 'Video is being generated (this may take a few minutes)...';

				let videoComplete = false;
				let pollCount = 0;
				const maxPolls = 60;

				while (!videoComplete && pollCount < maxPolls) {
					await new Promise(resolve => setTimeout(resolve, 10000));

					const statusRes = await fetch(
						`/api/check-video-status?generationId=${gen.id}&operationName=${encodeURIComponent(operationName)}`
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
			{#if data.generation.productImageUrl}
				<div class="mt-4 inline-block">
					<img
						src={data.generation.productImageUrl}
						alt="Product"
						class="h-20 w-20 object-contain rounded-lg border border-gray-200 bg-white"
					/>
				</div>
			{/if}
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

		<!-- Processing Section (shows progress and errors) -->
		{#if showProgressSection}
			<div class="bg-white rounded-2xl shadow-lg p-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">
					{hasStepError && !isProcessing ? 'Generation Error' : 'Generating Your Assets'}
				</h2>
				<ProcessingStatus {steps} />

				<!-- Retry button when there's an error -->
				{#if hasStepError && !isProcessing}
					<div class="mt-6 flex flex-col items-center gap-3">
						{#if currentError || data.generation.error}
							<p class="text-red-600 text-sm text-center max-w-md">{currentError || data.generation.error}</p>
						{/if}
						<button
							onclick={retryGeneration}
							class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Retry from this step
						</button>
					</div>
				{/if}
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
