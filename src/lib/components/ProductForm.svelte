<script>
	/** @type {{ onSubmit: (url: string) => void, disabled?: boolean }} */
	let { onSubmit, disabled = false } = $props();

	let productUrl = $state('');
	let error = $state('');

	/** @param {SubmitEvent} e */
	function handleSubmit(e) {
		e.preventDefault();
		error = '';

		if (!productUrl.trim()) {
			error = 'Please enter a product URL';
			return;
		}

		try {
			new URL(productUrl);
		} catch {
			error = 'Please enter a valid URL';
			return;
		}

		onSubmit(productUrl);
	}
</script>

<form onsubmit={handleSubmit} class="w-full max-w-2xl mx-auto">
	<div class="space-y-4">
		<div>
			<label for="productUrl" class="block text-sm font-medium text-gray-700 mb-2">
				Product URL
			</label>
			<input
				type="url"
				id="productUrl"
				bind:value={productUrl}
				placeholder="https://www.example.com/product/..."
				class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
				{disabled}
			/>
			{#if error}
				<p class="mt-2 text-sm text-red-600">{error}</p>
			{/if}
		</div>

		<button
			type="submit"
			{disabled}
			class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			{#if disabled}
				Processing...
			{:else}
				Generate Product Assets
			{/if}
		</button>
	</div>

	<p class="mt-4 text-sm text-gray-500 text-center">
		Paste a product URL from any eCommerce site to generate 360° product images and video.
	</p>
</form>
