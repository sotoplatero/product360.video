<script>
	import { goto } from "$app/navigation";
	import ProductForm from "$lib/components/ProductForm.svelte";

	let loading = $state(false);

	/**
	 * @param {string} imageUrl
	 */
	async function handleSubmit(imageUrl) {
		loading = true;

		try {
			const response = await fetch("/api/generation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ productImageUrl: imageUrl }),
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.error);

			goto(`/generate/${data.generation.id}`);
		} catch (err) {
			console.error("Submission error:", err);
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
			<span class="text-white">Just upload an image.</span>
		</p>

		<!-- Product Form -->
		<div class="max-w-2xl mx-auto mb-8 animate-fade-up delay-300">
			<ProductForm onSubmit={handleSubmit} disabled={loading} />
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
