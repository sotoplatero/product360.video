<script>
	/** @type {{ onSubmit: (imageUrl: string) => void, disabled?: boolean }} */
	let { onSubmit, disabled = false } = $props();

	let error = $state('');
	let uploading = $state(false);
	let previewUrl = $state('');
	/** @type {File | null} */
	let selectedFile = $state(null);
	let isDragging = $state(false);

	/** @type {HTMLInputElement} */
	let fileInput;

	/**
	 * @param {File} file
	 */
	function handleFile(file) {
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
		if (!allowedTypes.includes(file.type)) {
			error = 'Invalid file type. Use JPEG, PNG, WebP or GIF';
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

	/** @param {DragEvent} e */
	function handleDrop(e) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) handleFile(file);
	}

	/** @param {DragEvent} e */
	function handleDragOver(e) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
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
	<div class="space-y-4">
		{#if !previewUrl}
			<!-- Drop zone -->
			<div
				role="button"
				tabindex="0"
				ondrop={handleDrop}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				onclick={() => fileInput.click()}
				onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
				class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}"
			>
				<div class="flex flex-col items-center gap-3">
					<svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					<div>
						<p class="text-gray-700 font-medium">Drop your product image here</p>
						<p class="text-gray-500 text-sm mt-1">or click to browse</p>
					</div>
					<p class="text-xs text-gray-400">JPEG, PNG, WebP or GIF • Max 10MB</p>
				</div>
			</div>

			<input
				bind:this={fileInput}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				onchange={handleFileSelect}
				class="hidden"
				{disabled}
			/>
		{:else}
			<!-- Preview -->
			<div class="relative border rounded-lg overflow-hidden">
				<img src={previewUrl} alt="Preview" class="w-full h-64 object-contain bg-gray-50" />
				<button
					type="button"
					onclick={clearSelection}
					disabled={disabled || uploading}
					class="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-100 disabled:opacity-50"
				>
					<svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/if}

		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}

		<button
			type="submit"
			disabled={disabled || uploading || !selectedFile}
			class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			{#if uploading}
				Uploading...
			{:else if disabled}
				Processing...
			{:else}
				Generate Product Assets
			{/if}
		</button>
	</div>

	<p class="mt-4 text-sm text-gray-500 text-center">
		Upload a product image to generate 360° product images and video.
	</p>
</form>
