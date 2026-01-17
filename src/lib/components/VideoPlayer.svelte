<script>
	/** @type {{ videoUrl: string, poster?: string }} */
	let { videoUrl, poster } = $props();
</script>

<div class="w-full">
	<h3 class="text-lg font-semibold text-gray-900 mb-4">360° Product Video</h3>
	<div class="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
		<video
			src={videoUrl}
			{poster}
			controls
			loop
			class="w-full h-full object-contain"
		>
			<track kind="captions" />
			Your browser does not support the video tag.
		</video>
	</div>
	<div class="mt-4 flex gap-4">
		<a
			href={videoUrl}
			download="product-360.mp4"
			class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
		>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
			</svg>
			Download Video
		</a>
	</div>
</div>
