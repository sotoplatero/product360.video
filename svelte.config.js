import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			// images: {
			// 	sizes: [640, 828, 1200, 1920, 3840],
			// 	formats: ['image/avif', 'image/webp'],
			// 	minimumCacheTTL: 300,
			// 	domains: ['360product.video'],
			// },
		})
	},

	preprocess: [mdsvex()],
	extensions: ['.svelte', '.svx']
};

export default config;
