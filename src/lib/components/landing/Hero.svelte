<script>
	import { goto } from "$app/navigation";

	let loading = $state(false);
	let error = $state("");
	let isDragging = $state(false);
	let previewUrl = $state("");
	/** @type {File | null} */
	let selectedFile = $state(null);

	/** @type {HTMLInputElement} */
	let fileInput;

	/**
	 * @param {File} file
	 */
	function handleFile(file) {
		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif",
		];
		if (!allowedTypes.includes(file.type)) {
			error = "Invalid file type. Use JPEG, PNG, WebP or GIF";
			return;
		}

		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			error = "File too large. Maximum 10MB";
			return;
		}

		error = "";
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
			previewUrl = "";
		}
		error = "";
	}

	async function handleSubmit() {
		if (!selectedFile) return;

		loading = true;
		error = "";

		try {
			// 1. Subir imagen a R2
			const formData = new FormData();
			formData.append("image", selectedFile);

			const uploadResponse = await fetch("/api/upload-image", {
				method: "POST",
				body: formData,
			});

			const contentType = uploadResponse.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				const text = await uploadResponse.text();
				throw new Error(
					`Upload failed (${uploadResponse.status}): ${text.substring(0, 100)}...`,
				);
			}

			const uploadData = await uploadResponse.json();
			if (!uploadResponse.ok)
				throw new Error(uploadData.error || "Upload failed");

			// 2. Crear generación con la URL de la imagen
			const response = await fetch("/api/generation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ productImageUrl: uploadData.imageUrl }),
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.error);

			goto(`/generate/${data.generation.id}`);
		} catch (err) {
			console.error("Submission error:", err);
			error = err instanceof Error ? err.message : "Something went wrong";
			loading = false;
		}
	}
</script>

<section
	class="relative min-h-screen flex items-center justify-center overflow-hidden"
>
	<!-- Background gradient orbs -->
	<div class="absolute inset-0 overflow-hidden">
		<div
			class="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
		></div>
		<div
			class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
		></div>
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-3xl"
		></div>
	</div>

	<!-- Grid pattern overlay -->
	<div
		class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"
	></div>

	<div class="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
		<!-- Badge -->
		<div
			class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-up"
		>
			<span class="relative flex h-2 w-2">
				<span
					class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
				></span>
				<span
					class="relative inline-flex rounded-full h-2 w-2 bg-green-500"
				></span>
			</span>
			<span class="text-sm text-gray-300"
				>Trusted by 500+ eCommerce brands</span
			>
		</div>

		<!-- Headline -->
		<h1
			class="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up delay-100"
		>
			<span class="text-white">Turn Any Product Photo</span>
			<br />
			<span class="gradient-text">Into Stunning 360° Content</span>
		</h1>

		<!-- Subheadline -->
		<p
			class="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-up delay-200"
		>
			AI-powered product photography. No studio. No photographer.
			<span class="text-white">Just drop an image.</span>
		</p>

		<!-- Image Upload Area -->
		<div class="max-w-2xl mx-auto mb-8 animate-fade-up delay-300">
			{#if !previewUrl}
				<!-- Drop zone -->
				<div
					role="button"
					tabindex="0"
					ondrop={handleDrop}
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					onclick={() => fileInput.click()}
					onkeydown={(e) => e.key === "Enter" && fileInput.click()}
					class="relative group cursor-pointer"
				>
					<!-- Gradient border -->
					<div
						class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl opacity-50 group-hover:opacity-100 blur transition duration-500 {isDragging
							? 'opacity-100'
							: ''}"
					></div>

					<div
						class="relative bg-[#171717] rounded-2xl border-2 border-dashed border-white/20 p-12 transition-all {isDragging
							? 'border-purple-500 bg-purple-500/10'
							: 'group-hover:border-white/40'}"
					>
						<div class="flex flex-col items-center gap-4">
							<div
								class="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center"
							>
								<svg
									class="w-8 h-8 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<div>
								<p class="text-lg text-white font-medium">
									Drop your product image here
								</p>
								<p class="text-gray-400 mt-1">
									or click to browse
								</p>
							</div>
							<p class="text-sm text-gray-500">
								JPEG, PNG, WebP or GIF • Max 10MB
							</p>
						</div>
					</div>
				</div>

				<input
					bind:this={fileInput}
					type="file"
					accept="image/jpeg,image/png,image/webp,image/gif"
					onchange={handleFileSelect}
					class="hidden"
				/>
			{:else}
				<!-- Preview -->
				<div class="relative group">
					<div
						class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl opacity-75 blur"
					></div>

					<div class="relative bg-[#171717] rounded-2xl p-4">
						<div
							class="relative aspect-video rounded-xl overflow-hidden bg-black/50"
						>
							<img
								src={previewUrl}
								alt="Preview"
								class="w-full h-full object-contain"
							/>

							<!-- Remove button -->
							<button
								onclick={clearSelection}
								disabled={loading}
								class="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50"
							>
								<svg
									class="w-5 h-5 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
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
							onclick={handleSubmit}
							disabled={loading}
							class="w-full mt-4 py-4 gradient-animated rounded-xl font-semibold text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
						>
							{#if loading}
								<span
									class="flex items-center justify-center gap-3"
								>
									<svg
										class="w-5 h-5 animate-spin"
										fill="none"
										viewBox="0 0 24 24"
									>
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
							{:else}
								Generate 360° Content
							{/if}
						</button>
					</div>
				</div>
			{/if}

			{#if error}
				<p class="mt-3 text-red-400 text-sm">{error}</p>
			{/if}
		</div>

		<!-- Trust indicators -->
		<div
			class="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 animate-fade-up delay-400"
		>
			<div class="flex items-center gap-2">
				<svg
					class="w-4 h-4 text-green-500"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
				<span>No signup required</span>
			</div>
			<div class="flex items-center gap-2">
				<svg
					class="w-4 h-4 text-green-500"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
				<span>Results in minutes</span>
			</div>
			<div class="flex items-center gap-2">
				<svg
					class="w-4 h-4 text-green-500"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
				<span>Starting at $9.99</span>
			</div>
		</div>

		<!-- Scroll indicator -->
		<div
			class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
		>
			<svg
				class="w-6 h-6 text-gray-500"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 14l-7 7m0 0l-7-7m7 7V3"
				/>
			</svg>
		</div>
	</div>
</section>
