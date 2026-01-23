<script lang="ts">
	import { page } from '$app/state';
	import { Clock, Users, Target, Zap, Globe, Heart } from 'lucide-svelte';
	import SiteLogo from '$lib/components/site-logo.svelte';
	import AppFooter from '$lib/components/app-footer.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.about_us()} - TimeUTCNow</title>
	<meta name="description" content="Learn about TimeUTCNow - the world's most precise live UTC clock. Free timezone converter and UTC clock tool for international teams and global scheduling." />
	<meta name="keywords" content="about TimeUTCNow, UTC clock, timezone converter, time tools, international time, UTC time" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://timeutcnow.com/{page.params.locale}/about" />
	<meta property="og:title" content="{m.about_us()} - TimeUTCNow" />
	<meta property="og:description" content="Learn about TimeUTCNow - the world's most precise live UTC clock. Free timezone converter and UTC clock tool." />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{m.about_us()} - TimeUTCNow" />
	<meta name="twitter:description" content="Learn about TimeUTCNow - the world's most precise live UTC clock. Free timezone converter and UTC clock tool." />
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
		<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
			<a href="/{page.params.locale}">
				<SiteLogo class="cursor-pointer" />
			</a>
			
			<div class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href="/{page.params.locale}" class="hover:text-primary">{m.utc_clock()}</a>
				<a href="/{page.params.locale}/converter" class="hover:text-primary">{m.converter()}</a>
			</div>
		</div>
	</nav>

	<main class="max-w-4xl mx-auto px-4 py-12">
		<!-- Hero Section -->
		<section class="text-center mb-16">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
				<Users class="w-4 h-4" />
				{m.about_us()}
			</div>
			<h1 class="text-5xl font-bold mb-6">About TimeUTCNow</h1>
			<p class="text-xl text-base-content/70 max-w-2xl mx-auto">
				The world's most precise live UTC clock. Trusted by developers, pilots, researchers, and professionals worldwide.
			</p>
		</section>

		<!-- Mission Section -->
		<section class="mb-16">
			<div class="bg-base-100 rounded-3xl p-8 md:p-12 border border-base-300">
				<div class="flex items-start gap-4 mb-6">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
						<Target class="w-6 h-6 text-primary" />
					</div>
					<div>
						<h2 class="text-3xl font-bold mb-4">Our Mission</h2>
						<p class="text-base-content/70 leading-relaxed text-lg">
							TimeUTCNow was created to provide the most accurate, accessible, and user-friendly UTC time reference available. 
							We believe that precise timekeeping is essential in our interconnected world, where coordination across time zones 
							is critical for everything from software development to international business.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Section -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-8 text-center">Why Choose TimeUTCNow?</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="bg-base-100 rounded-2xl p-6 border border-base-300">
					<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
						<Zap class="w-5 h-5 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">Lightning Fast</h3>
					<p class="text-base-content/70">
						Built with modern web technologies for instant loading and real-time updates. 
						No lag, no delays - just accurate time when you need it.
					</p>
				</div>

				<div class="bg-base-100 rounded-2xl p-6 border border-base-300">
					<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
						<Target class="w-5 h-5 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">Precision First</h3>
					<p class="text-base-content/70">
						Based on atomic clock standards, synchronized with global time servers. 
						We ensure accuracy down to the millisecond.
					</p>
				</div>

				<div class="bg-base-100 rounded-2xl p-6 border border-base-300">
					<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
						<Globe class="w-5 h-5 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">Global Access</h3>
					<p class="text-base-content/70">
						Available in multiple languages and accessible from anywhere in the world. 
						View times for major cities across all continents.
					</p>
				</div>

				<div class="bg-base-100 rounded-2xl p-6 border border-base-300">
					<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
						<Heart class="w-5 h-5 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">Free & Open</h3>
					<p class="text-base-content/70">
						Completely free to use, no registration required. 
						We're committed to providing accurate time information to everyone.
					</p>
				</div>
			</div>
		</section>

		<!-- Who Uses It Section -->
		<section class="mb-16">
			<div class="bg-primary rounded-3xl p-8 md:p-12 text-primary-content">
				<h2 class="text-3xl font-bold mb-6">Who Uses TimeUTCNow?</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h3 class="text-xl font-semibold mb-3">Software Developers</h3>
						<p class="text-primary-content/90">
							For timestamping, debugging time-related issues, and coordinating with international teams.
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-3">Aviation Professionals</h3>
						<p class="text-primary-content/90">
							Essential for flight planning, scheduling, and understanding Zulu time.
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-3">Researchers & Scientists</h3>
						<p class="text-primary-content/90">
							For precise time measurements, data logging, and synchronized experiments.
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-3">Business Professionals</h3>
						<p class="text-primary-content/90">
							Coordinating meetings across time zones and managing global operations.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="text-center">
			<div class="bg-primary rounded-3xl p-12 text-primary-content shadow-xl">
				<h2 class="text-3xl font-bold mb-4">Ready to Get Started?</h2>
				<p class="text-lg text-primary-content/90 mb-8 max-w-2xl mx-auto">
					Start using TimeUTCNow today and experience the most accurate UTC time reference available.
				</p>
				<a href="/{page.params.locale}" class="btn btn-lg btn-primary-content text-primary">
					View Live UTC Clock
				</a>
			</div>
		</section>
	</main>

	<AppFooter />
</div>