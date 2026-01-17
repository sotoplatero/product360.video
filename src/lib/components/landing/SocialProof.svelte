<script>
	const stats = [
		{ value: '10,000+', label: 'Products Generated' },
		{ value: '4.9', label: 'Average Rating', suffix: '★' },
		{ value: '50+', label: 'Countries' },
		{ value: '<3min', label: 'Avg Generation Time' }
	];

	const testimonials = [
		{
			quote: "Game changer for our Shopify store. We went from spending $500 per product shoot to $10. The quality is indistinguishable.",
			author: 'Sarah Chen',
			role: 'Founder, ModernHome',
			avatar: null
		},
		{
			quote: "Finally, a tool that actually delivers. Our product pages look professional now, and conversions are up 34%.",
			author: 'Marcus Johnson',
			role: 'eCommerce Manager',
			avatar: null
		},
		{
			quote: "The 360° videos are incredible. Customers spend more time on product pages, and returns have dropped significantly.",
			author: 'Elena Rodriguez',
			role: 'CEO, TechGear Pro',
			avatar: null
		}
	];

	const brands = [
		'Shopify',
		'Amazon',
		'eBay',
		'Etsy',
		'WooCommerce',
		'BigCommerce'
	];
</script>

<section class="py-24 px-4 border-y border-white/5">
	<div class="max-w-6xl mx-auto">
		<!-- Stats -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
			{#each stats as stat, i (i)}
				<div class="text-center">
					<div class="text-4xl md:text-5xl font-bold text-white mb-2">
						{stat.value}{#if stat.suffix}<span class="text-yellow-400">{stat.suffix}</span>{/if}
					</div>
					<div class="text-gray-500 text-sm">{stat.label}</div>
				</div>
			{/each}
		</div>

		<!-- Testimonials -->
		<div class="mb-20">
			<h3 class="text-center text-gray-500 text-sm uppercase tracking-wider mb-12">
				What Our Users Say
			</h3>

			<div class="grid md:grid-cols-3 gap-6">
				{#each testimonials as testimonial, i (i)}
					<div class="bg-[#171717] border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
						<!-- Stars -->
						<div class="flex gap-1 mb-4">
							{#each Array(5) as _, j (j)}
								<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
							{/each}
						</div>

						<!-- Quote -->
						<p class="text-gray-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>

						<!-- Author -->
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
								{testimonial.author.charAt(0)}
							</div>
							<div>
								<div class="text-white font-medium text-sm">{testimonial.author}</div>
								<div class="text-gray-500 text-xs">{testimonial.role}</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Brand logos -->
		<div>
			<h3 class="text-center text-gray-500 text-sm uppercase tracking-wider mb-8">
				Works With Your Favorite Platforms
			</h3>

			<div class="flex flex-wrap justify-center items-center gap-8 md:gap-12">
				{#each brands as brand, i (i)}
					<div class="text-gray-500 hover:text-gray-300 transition-colors text-lg font-medium">
						{brand}
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
