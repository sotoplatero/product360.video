<script>
	import { goto } from '$app/navigation';

	const included = [
		'4 AI-generated product angles',
		'360° rotation video',
		'4K resolution output',
		'Commercial license',
		'Instant download',
		'No watermarks'
	];

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		// Focus the input after scrolling
		setTimeout(() => {
			const input = document.querySelector('input[type="url"]');
			if (input instanceof HTMLInputElement) {
				input.focus();
			}
		}, 500);
	}
</script>

<section class="py-24 px-4">
	<div class="max-w-3xl mx-auto">
		<!-- Section header -->
		<div class="text-center mb-12">
			<h2 class="text-3xl md:text-5xl font-bold text-white mb-4">
				Simple, <span class="gradient-text">Transparent</span> Pricing
			</h2>
			<p class="text-gray-400 text-lg">
				Pay per generation. No subscriptions. No hidden fees.
			</p>
		</div>

		<!-- Pricing card -->
		<div class="relative">
			<!-- Glow effect -->
			<div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-3xl blur-lg opacity-30"></div>

			<div class="relative bg-[#171717] border border-white/10 rounded-3xl p-8 md:p-12">
				<!-- Badge -->
				<div class="absolute -top-4 left-1/2 -translate-x-1/2">
					<div class="px-4 py-1 gradient-animated rounded-full text-white text-sm font-medium">
						Most Popular
					</div>
				</div>

				<div class="text-center mb-8">
					<div class="text-gray-400 mb-2">Per Generation</div>
					<div class="flex items-baseline justify-center gap-2">
						<span class="text-6xl font-bold text-white">$9.99</span>
						<span class="text-gray-500">USD</span>
					</div>
				</div>

				<!-- Features list -->
				<div class="space-y-4 mb-8">
					{#each included as item, i (i)}
						<div class="flex items-center gap-3">
							<div class="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
								<svg class="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<span class="text-gray-300">{item}</span>
						</div>
					{/each}
				</div>

				<!-- CTA -->
				<button
					onclick={scrollToTop}
					class="w-full py-4 gradient-animated rounded-xl font-semibold text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
				>
					Start Generating Now
				</button>

				<!-- Note -->
				<p class="text-center text-gray-500 text-sm mt-4">
					No account required. Pay only when you're happy with the preview.
				</p>
			</div>
		</div>

		<!-- Volume pricing note -->
		<div class="text-center mt-8">
			<p class="text-gray-400">
				Need high volume?
				<a href="mailto:enterprise@product360.video" class="text-purple-400 hover:text-purple-300 underline">
					Contact us for enterprise pricing
				</a>
			</p>
		</div>
	</div>
</section>
