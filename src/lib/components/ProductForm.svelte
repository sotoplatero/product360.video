<script>
	/** @type {{ onSubmit: (imageUrl: string) => void, disabled?: boolean }} */
	let { onSubmit, disabled = false } = $props();

	let error = $state('');
	let uploading = $state(false);
	let previewUrl = $state('');
	/** @type {File | null} */
	let selectedFile = $state(null);

	/** @type {HTMLInputElement} */
	let fileInput;

	/**
	 * @param {File} file
	 */
	function handleFile(file) {
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
		if (!allowedTypes.includes(file.type)) {
			error = 'Invalid file type. Use JPEG, PNG, WebP, GIF or AVIF';
			return;
		}

		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			error = 'File too large. Maximum 10MB';
			return;
		}

		error = '';
		selectedFile = file;
		previewUrl = URL.createObjectURL(file);
	}

	/** @param {Event} e */
	function handleFileSelect(e) {
		const input = /** @type {HTMLInputElement} */ (e.target);
		const file = input.files?.[0];
		if (file) handleFile(file);
	}

	function clearSelection() {
		selectedFile = null;
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = '';
		}
		error = '';
	}

	/** @param {SubmitEvent} e */
	async function handleSubmit(e) {
		e.preventDefault();
		if (!selectedFile) {
			error = 'Please select an image';
			return;
		}

		uploading = true;
		error = '';

		try {
			const formData = new FormData();
			formData.append('image', selectedFile);

			const response = await fetch('/api/upload-image', {
				method: 'POST',
				body: formData
			});

			const contentType = response.headers.get('content-type');
			if (!contentType || !contentType.includes('application/json')) {
				const text = await response.text();
				throw new Error(`Upload failed (${response.status}): ${text.substring(0, 100)}...`);
			}

			const data = await response.json();
			if (!response.ok) throw new Error(data.error);

			onSubmit(data.imageUrl);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Upload failed';
			uploading = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="w-full max-w-2xl mx-auto">
	{#if !previewUrl}
		<!-- Upload button -->
		<div class="flex flex-col items-center gap-4">
			<button
				type="button"
				onclick={() => fileInput.click()}
				disabled={disabled}
				class="relative group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<!-- Gradient border -->
				<div
					class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-xl opacity-50 group-hover:opacity-100 blur transition duration-500"
				></div>

				<div
					class="relative flex items-center gap-3 bg-[#171717] rounded-xl px-8 py-4 transition-all group-hover:bg-[#1f1f1f]"
				>
					<div
						class="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center"
					>
						<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<span class="text-lg text-white font-medium">Select Product Image</span>
				</div>
			</button>
			<p class="text-sm text-gray-500">JPEG, PNG, WebP, GIF or AVIF • Max 10MB</p>
		</div>

		<input
			bind:this={fileInput}
			type="file"
			accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
			onchange={handleFileSelect}
			class="hidden"
			{disabled}
		/>
	{:else}
		<!-- Preview -->
		<div class="relative group">
			<div
				class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl opacity-75 blur"
			></div>

			<div class="relative bg-[#171717] rounded-2xl p-4">
				<div class="relative aspect-video rounded-xl overflow-hidden bg-black/50">
					<img src={previewUrl} alt="Preview" class="w-full h-full object-contain" />

					<!-- Remove button -->
					<button
						type="button"
						onclick={clearSelection}
						disabled={disabled || uploading}
						class="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50"
					>
						<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Generate button -->
				<button
					type="submit"
					disabled={disabled || uploading}
					class="w-full mt-4 py-4 gradient-animated rounded-xl font-semibold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
				>
					{#if uploading}
						<span class="flex items-center justify-center gap-3">
							<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Uploading...
						</span>
					{:else if disabled}
						Processing...
					{:else}
						Generate 360° Content
					{/if}
				</button>
			</div>
		</div>
	{/if}

	{#if error}
		<p class="mt-3 text-red-400 text-sm text-center">{error}</p>
	{/if}
</form>
