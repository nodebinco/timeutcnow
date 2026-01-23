<script lang="ts">
	import { page } from '$app/state';
	import { Clock, Users, Target, Zap, Globe, Heart, Menu, X } from 'lucide-svelte';
	import SiteLogo from '$lib/components/site-logo.svelte';
	import AppFooter from '$lib/components/app-footer.svelte';
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';
	import * as m from '$lib/paraglide/messages';
	
	let mobileMenuOpen = $state(false);
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
				<a href="/{page.params.locale}/time-zone-converter" class="hover:text-primary">{m.time_zone_converter()}</a>
				<LanguageSwitcher />
			</div>

			<div class="md:hidden">
				<button
					type="button"
					class="btn btn-ghost btn-sm"
					onclick={() => mobileMenuOpen = !mobileMenuOpen}
					aria-label="Toggle menu"
				>
					{#if mobileMenuOpen}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</button>
			</div>
		</div>
	</nav>
	
	<!-- Mobile Sidebar -->
	{#if mobileMenuOpen}
		<div class="md:hidden fixed inset-0 z-[100] bg-base-100/95 backdrop-blur-md">
			<div class="flex flex-col h-full">
				<div class="flex items-center justify-between p-4 border-b border-base-300">
					<SiteLogo />
					<button
						type="button"
						class="btn btn-ghost btn-sm"
						onclick={() => mobileMenuOpen = false}
						aria-label="Close menu"
					>
						<X class="w-6 h-6" />
					</button>
				</div>
				<div class="flex-1 overflow-y-auto p-4 space-y-4">
					<a
						href="/{page.params.locale}"
						class="block py-2 text-base font-medium hover:text-primary"
						onclick={() => mobileMenuOpen = false}
					>
						{m.utc_clock()}
					</a>
					<a
						href="/{page.params.locale}/time-zone-converter"
						class="block py-2 text-base font-medium hover:text-primary"
						onclick={() => mobileMenuOpen = false}
					>
						{m.time_zone_converter()}
					</a>
				</div>
			</div>
		</div>
	{/if}

	<main class="max-w-4xl mx-auto px-4 py-12">
		<!-- Hero Section -->
		<section class="text-center mb-16">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
				<Users class="w-4 h-4" />
				{m.about_us()}
			</div>
			<h1 class="text-5xl font-bold mb-6">{m.about_title()}</h1>
			<p class="text-xl text-base-content/70 max-w-2xl mx-auto">
				{m.about_subtitle()}
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
						<h2 class="text-3xl font-bold mb-4">{m.about_mission_title()}</h2>
						<p class="text-base-content/70 leading-relaxed text-lg">
							{m.about_mission_text()}
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Section -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-8 text-center">{m.about_features_title()}</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="bg-base-100 rounded-2xl p-6 border border-base-300">
					<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
						<Zap class="w-5 h-5 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">{m.about_feature_fast_title()}</h3>
					<p class="text-base-content/70">
						{m.about_feature_fast_text()}
					</p>
				</div>

				<div class="bg-base-100 rounded-2xl p-6 border border-base-300">
					<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
						<Target class="w-5 h-5 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">{m.about_feature_precision_title()}</h3>
					<p class="text-base-content/70">
						{m.about_feature_precision_text()}
					</p>
				</div>

				<div class="bg-base-100 rounded-2xl p-6 border border-base-300">
					<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
						<Globe class="w-5 h-5 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">{m.about_feature_global_title()}</h3>
					<p class="text-base-content/70">
						{m.about_feature_global_text()}
					</p>
				</div>

				<div class="bg-base-100 rounded-2xl p-6 border border-base-300">
					<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
						<Heart class="w-5 h-5 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">{m.about_feature_free_title()}</h3>
					<p class="text-base-content/70">
						{m.about_feature_free_text()}
					</p>
				</div>
			</div>
		</section>

		<!-- Who Uses It Section -->
		<section class="mb-16">
			<div class="bg-primary rounded-3xl p-8 md:p-12 text-primary-content">
				<h2 class="text-3xl font-bold mb-6">{m.about_users_title()}</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h3 class="text-xl font-semibold mb-3">{m.about_users_developers_title()}</h3>
						<p class="text-primary-content/90">
							{m.about_users_developers_text()}
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-3">{m.about_users_aviation_title()}</h3>
						<p class="text-primary-content/90">
							{m.about_users_aviation_text()}
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-3">{m.about_users_researchers_title()}</h3>
						<p class="text-primary-content/90">
							{m.about_users_researchers_text()}
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-3">{m.about_users_business_title()}</h3>
						<p class="text-primary-content/90">
							{m.about_users_business_text()}
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="text-center">
			<div class="bg-primary rounded-3xl p-12 text-primary-content shadow-xl">
				<h2 class="text-3xl font-bold mb-4">{m.about_cta_title()}</h2>
				<p class="text-lg text-primary-content/90 mb-8 max-w-2xl mx-auto">
					{m.about_cta_text()}
				</p>
				<a href="/{page.params.locale}" class="btn btn-lg btn-primary-content text-primary">
					{m.about_cta_button()}
				</a>
			</div>
		</section>
	</main>

	<AppFooter />
</div>