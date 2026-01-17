<script>
	import { goto } from '$app/navigation';

	let productUrl = $state('');
	let loading = $state(false);

	/** @param {SubmitEvent} e */
	async function handleSubmit(e) {
		e.preventDefault();
		if (!productUrl.trim()) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/generation', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ productUrl })
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.error);

			goto(`/generate/${data.generation.id}`);
		} catch (err) {
			loading = false;
		}
	}
</script>

<section class="py-24 px-4 relative overflow-hidden">
	<!-- Background effects -->
	<div class="absolute inset-0">
		<div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
		<div class="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
	</div>

	<div class="relative max-w-4xl mx-auto text-center">
		<!-- Headline -->
		<h2 class="text-3xl md:text-5xl font-bold text-white mb-6">
			Ready to Transform Your
			<span class="gradient-text">Product Content?</span>
		</h2>

		<p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
			Join thousands of eCommerce brands using AI to create stunning product visuals. Start generating in seconds.
		</p>

		<!-- URL Input -->
		<form onsubmit={handleSubmit} class="max-w-xl mx-auto mb-8">
			<div class="flex flex-col sm:flex-row gap-3">
				<input
					type="url"
					bind:value={productUrl}
					placeholder="Paste your product URL..."
					class="flex-1 bg-[#171717] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 outline-none focus:border-purple-500/50 transition-colors"
					disabled={loading}
				/>
				<button
					type="submit"
					disabled={loading}
					class="px-8 py-4 gradient-animated rounded-xl font-semibold text-white hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
				>
					{#if loading}
						Generating...
					{:else}
						Generate Now
					{/if}
				</button>
			</div>
		</form>

		<!-- Trust badges -->
		<div class="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
			<div class="flex items-center gap-2">
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
				<span>Secure Payment</span>
			</div>
			<div class="flex items-center gap-2">
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				<span>Instant Results</span>
			</div>
			<div class="flex items-center gap-2">
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
				</svg>
				<span>Pay Per Use</span>
			</div>
		</div>
	</div>
</section>
