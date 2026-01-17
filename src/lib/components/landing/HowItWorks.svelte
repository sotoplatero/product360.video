<script>
	const steps = [
		{
			number: '01',
			title: 'Paste Any URL',
			description: 'Copy a product link from Amazon, Shopify, eBay, or any eCommerce site.',
			icon: 'link'
		},
		{
			number: '02',
			title: 'AI Generates',
			description: 'Our AI extracts the product and creates multiple photorealistic angles.',
			icon: 'sparkles'
		},
		{
			number: '03',
			title: 'Download Assets',
			description: 'Get 4 product views and a smooth 360° video ready for your store.',
			icon: 'download'
		}
	];
</script>

<section class="py-24 px-4 relative">
	<!-- Background decoration -->
	<div class="absolute inset-0 overflow-hidden">
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-fuchsia-500/10 blur-3xl rounded-full"></div>
	</div>

	<div class="relative max-w-6xl mx-auto">
		<!-- Section header -->
		<div class="text-center mb-20">
			<h2 class="text-3xl md:text-5xl font-bold text-white mb-4">
				How It <span class="gradient-text">Works</span>
			</h2>
			<p class="text-gray-400 text-lg max-w-2xl mx-auto">
				Three simple steps to transform any product listing into professional-grade content.
			</p>
		</div>

		<!-- Steps -->
		<div class="grid md:grid-cols-3 gap-8 relative">
			<!-- Connection line -->
			<div class="hidden md:block absolute top-24 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-fuchsia-500/50"></div>

			{#each steps as step, i (i)}
				<div class="relative group">
					<!-- Step card -->
					<div class="bg-[#171717] border border-white/5 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 h-full">
						<!-- Number badge -->
						<div class="w-12 h-12 rounded-full gradient-animated flex items-center justify-center text-white font-bold mb-6 group-hover:scale-110 transition-transform">
							{step.number}
						</div>

						<!-- Icon -->
						<div class="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
							{#if step.icon === 'link'}
								<svg class="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
								</svg>
							{:else if step.icon === 'sparkles'}
								<svg class="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
								</svg>
							{:else}
								<svg class="w-7 h-7 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
							{/if}
						</div>

						<!-- Content -->
						<h3 class="text-xl font-semibold text-white mb-3">{step.title}</h3>
						<p class="text-gray-400 leading-relaxed">{step.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
