<script>
	// Example showcase items - replace with real generated examples
	const showcases = [
		{
			id: 1,
			original: '/examples/headphones-original.jpg',
			views: ['/examples/headphones-1.jpg', '/examples/headphones-2.jpg', '/examples/headphones-3.jpg', '/examples/headphones-4.jpg'],
			video: '/examples/headphones-360.mp4',
			category: 'Electronics',
			product: 'Wireless Headphones'
		},
		{
			id: 2,
			original: '/examples/sneakers-original.jpg',
			views: ['/examples/sneakers-1.jpg', '/examples/sneakers-2.jpg', '/examples/sneakers-3.jpg', '/examples/sneakers-4.jpg'],
			video: '/examples/sneakers-360.mp4',
			category: 'Fashion',
			product: 'Running Sneakers'
		},
		{
			id: 3,
			original: '/examples/perfume-original.jpg',
			views: ['/examples/perfume-1.jpg', '/examples/perfume-2.jpg', '/examples/perfume-3.jpg', '/examples/perfume-4.jpg'],
			video: '/examples/perfume-360.mp4',
			category: 'Beauty',
			product: 'Luxury Perfume'
		}
	];

	let activeIndex = $state(0);
	let showVideo = $state(false);
</script>

<section class="py-24 px-4">
	<div class="max-w-6xl mx-auto">
		<!-- Section header -->
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-5xl font-bold text-white mb-4">
				See the <span class="gradient-text">Magic</span> in Action
			</h2>
			<p class="text-gray-400 text-lg max-w-2xl mx-auto">
				From a single product URL to professional 360° content. Here's what our AI can create.
			</p>
		</div>

		<!-- Category tabs -->
		<div class="flex justify-center gap-2 mb-12">
			{#each showcases as showcase, i (showcase.id)}
				<button
					onclick={() => { activeIndex = i; showVideo = false; }}
					class="px-6 py-2 rounded-full text-sm font-medium transition-all {activeIndex === i ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}"
				>
					{showcase.category}
				</button>
			{/each}
		</div>

		<!-- Showcase display -->
		<div class="gradient-border p-8">
			<div class="grid md:grid-cols-2 gap-8">
				<!-- Left: Original + transformation -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
						<span class="w-2 h-2 rounded-full bg-indigo-500"></span>
						Original Product Image
					</div>

					<!-- Placeholder for original image -->
					<div class="aspect-square bg-[#1a1a1a] rounded-xl flex items-center justify-center border border-white/5">
						<div class="text-center text-gray-500">
							<svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<p class="text-sm">{showcases[activeIndex].product}</p>
							<p class="text-xs text-gray-600">Original from URL</p>
						</div>
					</div>

					<!-- Arrow indicator -->
					<div class="flex justify-center">
						<div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
							<svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
							</svg>
						</div>
					</div>
				</div>

				<!-- Right: Generated content -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2 text-sm text-gray-400">
							<span class="w-2 h-2 rounded-full bg-fuchsia-500"></span>
							AI Generated Content
						</div>

						<!-- Toggle: Images / Video -->
						<div class="flex bg-white/5 rounded-lg p-1">
							<button
								onclick={() => showVideo = false}
								class="px-3 py-1 rounded-md text-sm transition-all {!showVideo ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}"
							>
								Images
							</button>
							<button
								onclick={() => showVideo = true}
								class="px-3 py-1 rounded-md text-sm transition-all {showVideo ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}"
							>
								Video
							</button>
						</div>
					</div>

					{#if showVideo}
						<!-- Video placeholder -->
						<div class="aspect-video bg-[#1a1a1a] rounded-xl flex items-center justify-center border border-white/5 relative group cursor-pointer">
							<div class="absolute inset-0 flex items-center justify-center">
								<div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
									<svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
										<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
									</svg>
								</div>
							</div>
							<p class="absolute bottom-4 left-4 text-sm text-gray-500">360° Product Video</p>
						</div>
					{:else}
						<!-- Images grid -->
						<div class="grid grid-cols-2 gap-3">
							{#each ['90°', '180°', '270°', '360°'] as angle, i (i)}
								<div class="aspect-square bg-[#1a1a1a] rounded-xl flex items-center justify-center border border-white/5 hover:border-purple-500/50 transition-all cursor-pointer group">
									<div class="text-center text-gray-500 group-hover:text-gray-400 transition-colors">
										<svg class="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<p class="text-xs">View {i + 1} ({angle})</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Stats -->
					<div class="flex items-center justify-between pt-4 border-t border-white/5">
						<div class="text-sm">
							<span class="text-gray-500">Generation time:</span>
							<span class="text-white ml-1">~2 min</span>
						</div>
						<div class="text-sm">
							<span class="text-gray-500">Quality:</span>
							<span class="text-green-400 ml-1">4K Ready</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
