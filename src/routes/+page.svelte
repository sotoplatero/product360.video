<script>
	import Hero from '$lib/components/landing/Hero.svelte';
	import ShowcaseGrid from '$lib/components/landing/ShowcaseGrid.svelte';
	import HowItWorks from '$lib/components/landing/HowItWorks.svelte';
	import Features from '$lib/components/landing/Features.svelte';
	import SocialProof from '$lib/components/landing/SocialProof.svelte';
	import Pricing from '$lib/components/landing/Pricing.svelte';
	import FAQ from '$lib/components/landing/FAQ.svelte';
	import FinalCTA from '$lib/components/landing/FinalCTA.svelte';
	import Footer from '$lib/components/landing/Footer.svelte';
</script>

<svelte:head>
	<title>Product360.video - AI-Powered 360° Product Photography</title>
	<meta name="description" content="Transform any product URL into stunning 360° images and videos. AI-powered product photography for eCommerce. No studio, no photographer, just paste a link." />
	<meta property="og:title" content="Product360.video - AI-Powered 360° Product Photography" />
	<meta property="og:description" content="Transform any product URL into stunning 360° images and videos using AI." />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="relative">
	<!-- Noise overlay for texture -->
	<div class="fixed inset-0 pointer-events-none noise"></div>

	<Hero />
	<ShowcaseGrid />
	<HowItWorks />
	<Features />
	<SocialProof />
	<Pricing />
	<FAQ />
	<FinalCTA />
	<Footer />
</main>
