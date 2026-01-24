<script lang="ts">
	import { page } from '$app/state';
	import { localizeHref, getLocale } from '$lib/paraglide/runtime';
	import { Clock, Shield, Lock, Eye, Database, Cookie, Menu, X } from 'lucide-svelte';
	import SiteLogo from '$lib/components/site-logo.svelte';
	import AppFooter from '$lib/components/app-footer.svelte';
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';
	import * as m from '$lib/paraglide/messages';
	
	let mobileMenuOpen = $state(false);
	const locale = $derived(getLocale());
</script>

<svelte:head>
	<title>{m.privacy_policy()} - TimeUTCNow</title>
	<meta name="description" content="Privacy Policy for TimeUTCNow - Learn how we protect your data. We respect your privacy and are committed to keeping your information safe." />
	<meta name="keywords" content="privacy policy, data protection, TimeUTCNow privacy, user privacy, data security" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://timeutcnow.com/{page.params.locale}/privacy" />
	<meta property="og:title" content="{m.privacy_policy()} - TimeUTCNow" />
	<meta property="og:description" content="Privacy Policy for TimeUTCNow - Learn how we protect your data. We respect your privacy and are committed to keeping your information safe." />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{m.privacy_policy()} - TimeUTCNow" />
	<meta name="twitter:description" content="Privacy Policy for TimeUTCNow - Learn how we protect your data. We respect your privacy and are committed to keeping your information safe." />
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
		<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
			<a href={localizeHref("/")}>
				<SiteLogo class="cursor-pointer" />
			</a>
			
			<div class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href={localizeHref("/")} class="hover:text-primary">{m.utc_clock()}</a>
				<a href={localizeHref("/time-zone-converter")} class="hover:text-primary">{m.time_zone_converter()}</a>
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
						href={localizeHref("/")}
						class="block py-2 text-base font-medium hover:text-primary"
						onclick={() => mobileMenuOpen = false}
					>
						{m.utc_clock()}
					</a>
					<a
						href={localizeHref("/time-zone-converter")}
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
				<Shield class="w-4 h-4" />
				{m.privacy_policy()}
			</div>
			<h1 class="text-5xl font-bold mb-6">{m.privacy_title()}</h1>
			<p class="text-xl text-base-content/70 max-w-2xl mx-auto">
				{m.privacy_last_updated()} {new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
			</p>
		</section>

		<!-- Introduction -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-3xl p-8 md:p-12 border border-base-300">
				<p class="text-lg text-base-content/70 leading-relaxed">
					{m.privacy_intro()}
				</p>
			</div>
		</section>

		<!-- Information We Collect -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300">
				<div class="flex items-start gap-4 mb-6">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
						<Database class="w-6 h-6 text-primary" />
					</div>
					<div class="flex-1">
						<h2 class="text-3xl font-bold mb-4">{m.privacy_collect_title()}</h2>
						<div class="space-y-4 text-base-content/70">
							<div>
								<h3 class="text-xl font-semibold mb-2">{m.privacy_collect_storage_title()}</h3>
								<p>
									{m.privacy_collect_storage_text()}
								</p>
								<ul class="list-disc list-inside mt-2 space-y-1 ml-4">
									<li>{m.privacy_collect_storage_item1()}</li>
									<li>{m.privacy_collect_storage_item2()}</li>
									<li>{m.privacy_collect_storage_item3()}</li>
									<li>{m.privacy_collect_storage_item4()}</li>
								</ul>
								<p class="mt-3">
									<strong>{m.privacy_collect_storage_important()}</strong> {m.privacy_collect_storage_important_text()}
								</p>
							</div>
							<div>
								<h3 class="text-xl font-semibold mb-2">{m.privacy_collect_personal_title()}</h3>
								<p>
									{m.privacy_collect_personal_text()}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- How We Use Information -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300">
				<div class="flex items-start gap-4 mb-6">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
						<Eye class="w-6 h-6 text-primary" />
					</div>
					<div class="flex-1">
						<h2 class="text-3xl font-bold mb-4">{m.privacy_use_title()}</h2>
						<div class="space-y-3 text-base-content/70">
							<p>
								{m.privacy_use_text()}
							</p>
							<ul class="list-disc list-inside space-y-1 ml-4">
								<li>{m.privacy_use_item1()}</li>
								<li>{m.privacy_use_item2()}</li>
								<li>{m.privacy_use_item3()}</li>
								<li>{m.privacy_use_item4()}</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Cookies and Tracking -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300">
				<div class="flex items-start gap-4 mb-6">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
						<Cookie class="w-6 h-6 text-primary" />
					</div>
					<div class="flex-1">
						<h2 class="text-3xl font-bold mb-4">{m.privacy_cookies_title()}</h2>
						<div class="space-y-3 text-base-content/70">
							<p>
								{m.privacy_cookies_text1()}
							</p>
							<p>
								{m.privacy_cookies_text2()}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Data Security -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300">
				<div class="flex items-start gap-4 mb-6">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
						<Lock class="w-6 h-6 text-primary" />
					</div>
					<div class="flex-1">
						<h2 class="text-3xl font-bold mb-4">{m.privacy_security_title()}</h2>
						<div class="space-y-3 text-base-content/70">
							<p>
								{m.privacy_security_text1()}
							</p>
							<p>
								{m.privacy_security_text2()}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Third-Party Services -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300">
						<h2 class="text-3xl font-bold mb-4">{m.privacy_third_party_title()}</h2>
						<div class="space-y-3 text-base-content/70">
							<p>
								{m.privacy_third_party_text()}
							</p>
							<ul class="list-disc list-inside space-y-1 ml-4">
								<li>{m.privacy_third_party_item1()}</li>
								<li>{m.privacy_third_party_item2()}</li>
								<li>{m.privacy_third_party_item3()}</li>
								<li>{m.privacy_third_party_item4()}</li>
								<li>{m.privacy_third_party_item5()}</li>
							</ul>
						</div>
			</div>
		</section>

		<!-- Your Rights -->
		<section class="mb-12">
			<div class="bg-primary rounded-3xl p-8 md:p-12 text-primary-content">
				<h2 class="text-3xl font-bold mb-6">{m.privacy_rights_title()}</h2>
				<div class="space-y-4 text-primary-content/90">
					<div>
						<h3 class="text-xl font-semibold mb-2">{m.privacy_rights_control_title()}</h3>
						<p>
							{m.privacy_rights_control_text()}
						</p>
						<ul class="list-disc list-inside mt-2 space-y-1 ml-4">
							<li>{m.privacy_rights_control_item1()}</li>
							<li>{m.privacy_rights_control_item2()}</li>
							<li>{m.privacy_rights_control_item3()}</li>
						</ul>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-2">{m.privacy_rights_no_collection_title()}</h3>
						<p>
							{m.privacy_rights_no_collection_text()}
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Changes to Privacy Policy -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300">
				<h2 class="text-3xl font-bold mb-4">{m.privacy_changes_title()}</h2>
				<p class="text-base-content/70">
					{m.privacy_changes_text()}
				</p>
			</div>
		</section>

		<!-- Contact -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300 text-center">
				<h2 class="text-3xl font-bold mb-4">{m.privacy_questions_title()}</h2>
				<p class="text-base-content/70 mb-6">
					{m.privacy_questions_text()}
				</p>
				<a href={localizeHref("/contact")} class="btn btn-primary">
					{m.contact()}
				</a>
			</div>
		</section>
	</main>

	<AppFooter />
</div>