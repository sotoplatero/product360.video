<script>
	const features = [
		{
			title: '4 Product Angles',
			description: 'Get photorealistic views from 90°, 180°, 270°, and 360° angles automatically.',
			icon: 'grid',
			color: 'indigo'
		},
		{
			title: '360° Video',
			description: 'Smooth, loopable rotation video perfect for product pages and ads.',
			icon: 'video',
			color: 'purple'
		},
		{
			title: 'Studio Quality',
			description: 'Professional lighting, clean backgrounds, and consistent styling.',
			icon: 'star',
			color: 'fuchsia'
		},
		{
			title: 'Any Platform',
			description: 'Works with Amazon, Shopify, eBay, WooCommerce, and more.',
			icon: 'globe',
			color: 'pink'
		},
		{
			title: 'Fast Generation',
			description: 'From URL to finished assets in under 5 minutes.',
			icon: 'lightning',
			color: 'amber'
		},
		{
			title: 'Scalable',
			description: 'Generate content for your entire catalog via API.',
			icon: 'scale',
			color: 'emerald'
		}
	];
</script>

<section class="py-24 px-4">
	<div class="max-w-6xl mx-auto">
		<!-- Section header -->
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-5xl font-bold text-white mb-4">
				Everything You <span class="gradient-text">Need</span>
			</h2>
			<p class="text-gray-400 text-lg max-w-2xl mx-auto">
				Professional product photography without the professional price tag.
			</p>
		</div>

		<!-- Features grid -->
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feature, i (i)}
				<div class="group bg-[#171717] border border-white/5 rounded-2xl p-6 hover:border-{feature.color}-500/30 transition-all duration-300 hover:-translate-y-1">
					<!-- Icon -->
					<div class="w-12 h-12 rounded-xl bg-{feature.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
						{#if feature.icon === 'grid'}
							<svg class="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
							</svg>
						{:else if feature.icon === 'video'}
							<svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						{:else if feature.icon === 'star'}
							<svg class="w-6 h-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
							</svg>
						{:else if feature.icon === 'globe'}
							<svg class="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
							</svg>
						{:else if feature.icon === 'lightning'}
							<svg class="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						{:else}
							<svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
							</svg>
						{/if}
					</div>

					<!-- Content -->
					<h3 class="text-lg font-semibold text-white mb-2">{feature.title}</h3>
					<p class="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
