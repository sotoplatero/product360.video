<script>
	/**
	 * @typedef {{ position: string, imageUrl: string }} GeneratedImage
	 */

	/** @type {{ images: GeneratedImage[], canvasUrl?: string | null }} */
	let { images, canvasUrl } = $props();

	let selectedImage = $state(/** @type {string | null} */ (null));

	/** @type {Record<string, string>} */
	const positionLabels = {
		'top-left': 'View 1 (90°)',
		'top-right': 'View 2 (180°)',
		'bottom-left': 'View 3 (270°)',
		'bottom-right': 'View 4 (360°)'
	};

	function closeModal() {
		selectedImage = null;
	}
</script>

<div class="w-full">
	{#if canvasUrl}
		<div class="mb-8">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Original Canvas (2x2 Grid)</h3>
			<div class="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
				<img src={canvasUrl} alt="Product canvas" class="w-full h-full object-contain" />
			</div>
		</div>
	{/if}

	{#if images.length > 0}
		<h3 class="text-lg font-semibold text-gray-900 mb-4">Extracted Product Views</h3>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			{#each images as image (image.position)}
				<button
					type="button"
					onclick={() => selectedImage = image.imageUrl}
					class="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
				>
					<img
						src={image.imageUrl}
						alt={positionLabels[image.position] || image.position}
						class="w-full h-full object-contain group-hover:scale-105 transition-transform"
					/>
					<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
						<p class="text-sm text-white font-medium">
							{positionLabels[image.position] || image.position}
						</p>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

{#if selectedImage}
	<div
		class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
		onclick={closeModal}
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="relative max-w-4xl max-h-full">
			<img src={selectedImage} alt="Full size view" class="max-w-full max-h-[90vh] object-contain rounded-lg" />
			<button
				type="button"
				onclick={closeModal}
				aria-label="Close modal"
				class="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
			>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
{/if}
