<script lang="ts">
	import { page } from '$app/state';
	import { Clock, Mail, MessageSquare, Github, Send, CheckCircle, Menu, X } from 'lucide-svelte';
	import SiteLogo from '$lib/components/site-logo.svelte';
	import AppFooter from '$lib/components/app-footer.svelte';
	import LanguageSwitcher from '$lib/components/language-switcher.svelte';
	import * as m from '$lib/paraglide/messages';
	
	let mobileMenuOpen = $state(false);
	let formSubmitted = $state(false);
	let formData = $state({
		name: '',
		email: '',
		subject: '',
		message: ''
	});

	function handleSubmit(event: Event) {
		event.preventDefault();
		// Since there's no API, we'll just show a success message
		// In a real implementation, this would send data to a backend
		formSubmitted = true;
		setTimeout(() => {
			formSubmitted = false;
			formData = { name: '', email: '', subject: '', message: '' };
		}, 5000);
	}
</script>

<svelte:head>
	<title>{m.contact()} - TimeUTCNow</title>
	<meta name="description" content="Contact TimeUTCNow - Get in touch with our team. Have questions about our UTC clock or timezone converter? We'd love to hear from you." />
	<meta name="keywords" content="contact TimeUTCNow, UTC clock support, timezone converter help, contact us, feedback" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://timeutcnow.com/{page.params.locale}/contact" />
	<meta property="og:title" content="{m.contact()} - TimeUTCNow" />
	<meta property="og:description" content="Contact TimeUTCNow - Get in touch with our team. Have questions about our UTC clock or timezone converter?" />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{m.contact()} - TimeUTCNow" />
	<meta name="twitter:description" content="Contact TimeUTCNow - Get in touch with our team. Have questions about our UTC clock or timezone converter?" />
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
				<MessageSquare class="w-4 h-4" />
				{m.contact()}
			</div>
			<h1 class="text-5xl font-bold mb-6">{m.contact_title()}</h1>
			<p class="text-xl text-base-content/70 max-w-2xl mx-auto">
				{m.contact_subtitle()}
			</p>
		</section>

		<!-- Contact Form -->
		<section class="mb-16">
			<div class="bg-base-100 rounded-3xl p-8 md:p-12 border border-base-300">
				{#if formSubmitted}
					<div class="text-center py-12">
						<div class="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle class="w-8 h-8 text-success" />
						</div>
						<h2 class="text-2xl font-bold mb-2">{m.contact_form_success_title()}</h2>
						<p class="text-base-content/70 mb-6">
							{m.contact_form_success_text()}
						</p>
						<p class="text-sm text-base-content/50">
							{m.contact_form_success_note()}
						</p>
					</div>
				{:else}
					<form onsubmit={handleSubmit} class="space-y-6">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label for="name" class="block text-sm font-medium mb-2">
									{m.contact_form_name()} <span class="text-error">*</span>
								</label>
								<input
									type="text"
									id="name"
									bind:value={formData.name}
									required
									class="input input-bordered w-full"
									placeholder={m.contact_form_name_placeholder()}
								/>
							</div>
							<div>
								<label for="email" class="block text-sm font-medium mb-2">
									{m.contact_form_email()} <span class="text-error">*</span>
								</label>
								<input
									type="email"
									id="email"
									bind:value={formData.email}
									required
									class="input input-bordered w-full"
									placeholder={m.contact_form_email_placeholder()}
								/>
							</div>
						</div>
						<div>
							<label for="subject" class="block text-sm font-medium mb-2">
								{m.contact_form_subject()} <span class="text-error">*</span>
							</label>
							<input
								type="text"
								id="subject"
								bind:value={formData.subject}
								required
								class="input input-bordered w-full"
								placeholder={m.contact_form_subject_placeholder()}
							/>
						</div>
						<div>
							<label for="message" class="block text-sm font-medium mb-2">
								{m.contact_form_message()} <span class="text-error">*</span>
							</label>
							<textarea
								id="message"
								bind:value={formData.message}
								required
								rows="6"
								class="textarea textarea-bordered w-full"
								placeholder={m.contact_form_message_placeholder()}
							></textarea>
						</div>
						<div class="flex items-center gap-4">
							<button type="submit" class="btn btn-primary">
								<Send class="w-4 h-4 mr-2" />
								{m.contact_form_send()}
							</button>
							<p class="text-sm text-base-content/50">
								{m.contact_form_required()} <span class="text-error">*</span> {m.contact_form_required_are()}
							</p>
						</div>
					</form>
				{/if}
			</div>
		</section>

		<!-- Alternative Contact Methods -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-8 text-center">{m.contact_other_title()}</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="bg-base-100 rounded-2xl p-8 border border-base-300 text-center">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Mail class="w-6 h-6 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">{m.contact_email_title()}</h3>
					<p class="text-base-content/70 mb-4">
						{m.contact_email_text()}
					</p>
					<a href="mailto:contact@timeutcnow.com" class="text-primary hover:underline">
						contact@timeutcnow.com
					</a>
				</div>

				<div class="bg-base-100 rounded-2xl p-8 border border-base-300 text-center">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Github class="w-6 h-6 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">{m.contact_github_title()}</h3>
					<p class="text-base-content/70 mb-4">
						{m.contact_github_text()}
					</p>
					<a href="https://github.com/nodebinco/timeutcnow" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
						github.com/nodebinco/timeutcnow
					</a>
				</div>
			</div>
		</section>

		<!-- FAQ Section -->
		<section class="mb-16">
			<div class="bg-primary rounded-3xl p-8 md:p-12 text-primary-content">
				<h2 class="text-3xl font-bold mb-6">{m.contact_faq_title()}</h2>
				<div class="space-y-6">
					<div>
						<h3 class="text-xl font-semibold mb-2">{m.contact_faq_response_q()}</h3>
						<p class="text-primary-content/90">
							{m.contact_faq_response_a()}
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-2">{m.contact_faq_bug_q()}</h3>
						<p class="text-primary-content/90">
							{m.contact_faq_bug_a()}
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-2">{m.contact_faq_free_q()}</h3>
						<p class="text-primary-content/90">
							{m.contact_faq_free_a()}
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Support Section -->
		<section class="text-center">
			<div class="bg-primary rounded-3xl p-12 text-primary-content shadow-xl">
				<h2 class="text-3xl font-bold mb-4">{m.contact_support_title()}</h2>
				<p class="text-lg text-primary-content/90 mb-8 max-w-2xl mx-auto">
					{m.contact_support_text()}
				</p>
				<a href="/{page.params.locale}" class="btn btn-lg btn-primary-content text-primary">
					{m.contact_support_button()}
				</a>
			</div>
		</section>
	</main>

	<AppFooter />
</div>