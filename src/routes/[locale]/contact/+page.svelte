<script lang="ts">
	import { page } from '$app/state';
	import { Clock, Mail, MessageSquare, Github, Send, CheckCircle } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	
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
	<title>{m.site_name()} - {m.contact()}</title>
	<meta name="description" content="Contact TimeUTCNow - Get in touch with our team." />
</svelte:head>

<div class="min-h-screen bg-base-200 text-base-content">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
		<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
			<a href="/{page.params.locale}" class="flex items-center gap-2 cursor-pointer">
				<div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
					<Clock class="text-primary-content w-5 h-5" />
				</div>
				<span class="font-bold text-xl tracking-tight">{m.site_name()}</span>
			</a>
			
			<div class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href="/{page.params.locale}" class="hover:text-primary">{m.world_clock()}</a>
				<a href="/{page.params.locale}/converter" class="hover:text-primary">{m.converter()}</a>
			</div>
		</div>
	</nav>

	<main class="max-w-4xl mx-auto px-4 py-12">
		<!-- Hero Section -->
		<section class="text-center mb-16">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
				<MessageSquare class="w-4 h-4" />
				{m.contact()}
			</div>
			<h1 class="text-5xl font-bold mb-6">Get in Touch</h1>
			<p class="text-xl text-base-content/70 max-w-2xl mx-auto">
				Have a question, suggestion, or feedback? We'd love to hear from you!
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
						<h2 class="text-2xl font-bold mb-2">Thank You!</h2>
						<p class="text-base-content/70 mb-6">
							Your message has been received. We'll get back to you as soon as possible.
						</p>
						<p class="text-sm text-base-content/50">
							Note: This is a demo form. In a production environment, this would send your message to our team.
						</p>
					</div>
				{:else}
					<form onsubmit={handleSubmit} class="space-y-6">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label for="name" class="block text-sm font-medium mb-2">
									Name <span class="text-error">*</span>
								</label>
								<input
									type="text"
									id="name"
									bind:value={formData.name}
									required
									class="input input-bordered w-full"
									placeholder="Your name"
								/>
							</div>
							<div>
								<label for="email" class="block text-sm font-medium mb-2">
									Email <span class="text-error">*</span>
								</label>
								<input
									type="email"
									id="email"
									bind:value={formData.email}
									required
									class="input input-bordered w-full"
									placeholder="your.email@example.com"
								/>
							</div>
						</div>
						<div>
							<label for="subject" class="block text-sm font-medium mb-2">
								Subject <span class="text-error">*</span>
							</label>
							<input
								type="text"
								id="subject"
								bind:value={formData.subject}
								required
								class="input input-bordered w-full"
								placeholder="What's this about?"
							/>
						</div>
						<div>
							<label for="message" class="block text-sm font-medium mb-2">
								Message <span class="text-error">*</span>
							</label>
							<textarea
								id="message"
								bind:value={formData.message}
								required
								rows="6"
								class="textarea textarea-bordered w-full"
								placeholder="Tell us what's on your mind..."
							></textarea>
						</div>
						<div class="flex items-center gap-4">
							<button type="submit" class="btn btn-primary">
								<Send class="w-4 h-4 mr-2" />
								Send Message
							</button>
							<p class="text-sm text-base-content/50">
								All fields marked with <span class="text-error">*</span> are required
							</p>
						</div>
					</form>
				{/if}
			</div>
		</section>

		<!-- Alternative Contact Methods -->
		<section class="mb-16">
			<h2 class="text-3xl font-bold mb-8 text-center">Other Ways to Reach Us</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="bg-base-100 rounded-2xl p-8 border border-base-300 text-center">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Mail class="w-6 h-6 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">Email</h3>
					<p class="text-base-content/70 mb-4">
						Send us an email and we'll respond as soon as possible.
					</p>
					<a href="mailto:contact@timeutcnow.com" class="text-primary hover:underline">
						contact@timeutcnow.com
					</a>
				</div>

				<div class="bg-base-100 rounded-2xl p-8 border border-base-300 text-center">
					<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
						<Github class="w-6 h-6 text-primary" />
					</div>
					<h3 class="text-xl font-bold mb-2">GitHub</h3>
					<p class="text-base-content/70 mb-4">
						Found a bug or have a feature request? Open an issue on GitHub.
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
				<h2 class="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
				<div class="space-y-6">
					<div>
						<h3 class="text-xl font-semibold mb-2">How quickly will I receive a response?</h3>
						<p class="text-primary-content/90">
							We typically respond to inquiries within 24-48 hours during business days. 
							For urgent matters, please indicate this in your message.
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-2">Can I report a bug or suggest a feature?</h3>
						<p class="text-primary-content/90">
							Absolutely! We welcome all feedback, bug reports, and feature suggestions. 
							You can use the contact form above or open an issue on our GitHub repository.
						</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-2">Is TimeUTCNow free to use?</h3>
						<p class="text-primary-content/90">
							Yes, TimeUTCNow is completely free to use. There are no hidden fees, 
							subscriptions, or premium tiers.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Support Section -->
		<section class="text-center">
			<div class="bg-primary rounded-3xl p-12 text-primary-content shadow-xl">
				<h2 class="text-3xl font-bold mb-4">Need Help?</h2>
				<p class="text-lg text-primary-content/90 mb-8 max-w-2xl mx-auto">
					Check out our FAQ section for answers to common questions.
				</p>
				<a href="/{page.params.locale}" class="btn btn-lg btn-primary-content text-primary">
					View FAQ
				</a>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-t border-base-300 py-12 bg-base-200 mt-20">
		<div class="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
			<div class="col-span-2">
				<div class="flex items-center gap-2 mb-4">
					<div class="w-6 h-6 bg-primary rounded flex items-center justify-center">
						<Clock class="text-primary-content w-4 h-4" />
					</div>
					<span class="font-bold text-lg">{m.site_name()}</span>
				</div>
				<p class="text-base-content/60 text-sm max-w-xs mb-6">
					{m.footer_tagline()}
				</p>
			</div>
			<div>
				<h4 class="font-bold mb-4">Tools</h4>
				<ul class="space-y-2 text-sm text-base-content/60">
					<li><a href="/{page.params.locale}" class="hover:text-primary">{m.utc_clock()}</a></li>
					<li><a href="/{page.params.locale}/unix-timestamp" class="hover:text-primary">{m.unix_converter()}</a></li>
					<li><a href="/{page.params.locale}/timezone-map" class="hover:text-primary">{m.timezone_map()}</a></li>
					<li><a href="/{page.params.locale}/date-calculator" class="hover:text-primary">{m.date_calculator()}</a></li>
				</ul>
			</div>
			<div>
				<h4 class="font-bold mb-4">Support</h4>
				<ul class="space-y-2 text-sm text-base-content/60">
					<li><a href="/{page.params.locale}/about" class="hover:text-primary">{m.about_us()}</a></li>
					<li><a href="/{page.params.locale}/privacy" class="hover:text-primary">{m.privacy_policy()}</a></li>
					<li><a href="/{page.params.locale}/contact" class="hover:text-primary">{m.contact()}</a></li>
				</ul>
			</div>
		</div>
		<div class="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-base-300 text-center text-xs text-base-content/40">
			© {new Date().getFullYear()} {m.site_name()}. {m.footer_copyright()}
		</div>
	</footer>
</div>