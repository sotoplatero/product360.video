<script>
	const faqs = [
		{
			question: 'What eCommerce platforms are supported?',
			answer: 'We support virtually any eCommerce platform including Amazon, Shopify, eBay, Etsy, WooCommerce, BigCommerce, Magento, and any website with product images. If it has a URL, we can work with it.'
		},
		{
			question: 'How long does generation take?',
			answer: 'Most generations complete in 2-5 minutes. The AI extracts your product image, generates 4 different angles, and creates a smooth 360° video. Complex products may take slightly longer.'
		},
		{
			question: 'What resolution are the outputs?',
			answer: 'All images are generated at 4K resolution (up to 2048x2048 pixels). Videos are rendered at 1080p with smooth 60fps playback, perfect for product pages and social media.'
		},
		{
			question: 'Can I use these commercially?',
			answer: 'Yes! All generated content comes with a full commercial license. You can use the images and videos on your store, marketplace listings, social media, and advertising.'
		},
		{
			question: 'What if the result isn\'t what I expected?',
			answer: 'You\'ll see a preview before paying. If you\'re not satisfied with the generated content, you can try again with a different source image or contact our support for assistance.'
		},
		{
			question: 'Do you offer an API for bulk generation?',
			answer: 'Yes! We offer API access for businesses that need to generate content at scale. Contact us for enterprise pricing and integration support.'
		}
	];

	let openIndex = $state(/** @type {number | null} */ (null));

	/** @param {number} index */
	function toggle(index) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<section class="py-24 px-4">
	<div class="max-w-3xl mx-auto">
		<!-- Section header -->
		<div class="text-center mb-12">
			<h2 class="text-3xl md:text-5xl font-bold text-white mb-4">
				Frequently Asked <span class="gradient-text">Questions</span>
			</h2>
			<p class="text-gray-400 text-lg">
				Everything you need to know about Product360.
			</p>
		</div>

		<!-- FAQ items -->
		<div class="space-y-4">
			{#each faqs as faq, i (i)}
				<div class="border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
					<button
						onclick={() => toggle(i)}
						class="w-full flex items-center justify-between p-6 text-left"
					>
						<span class="font-medium text-white pr-4">{faq.question}</span>
						<div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
							<svg
								class="w-4 h-4 text-gray-400 transition-transform duration-200 {openIndex === i ? 'rotate-180' : ''}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</button>

					{#if openIndex === i}
						<div class="px-6 pb-6">
							<p class="text-gray-400 leading-relaxed">{faq.answer}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
