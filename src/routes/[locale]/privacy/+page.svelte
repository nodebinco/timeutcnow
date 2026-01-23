<script lang="ts">
	import { page } from '$app/state';
	import { Clock, Shield, Lock, Eye, Database, Cookie } from 'lucide-svelte';
	import SiteLogo from '$lib/components/site-logo.svelte';
	import AppFooter from '$lib/components/app-footer.svelte';
	import * as m from '$lib/paraglide/messages';
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
				<Shield class="w-4 h-4" />
				{m.privacy_policy()}
			</div>
			<h1 class="text-5xl font-bold mb-6">Privacy Policy</h1>
			<p class="text-xl text-base-content/70 max-w-2xl mx-auto">
				Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
			</p>
		</section>

		<!-- Introduction -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-3xl p-8 md:p-12 border border-base-300">
				<p class="text-lg text-base-content/70 leading-relaxed">
					At TimeUTCNow, we take your privacy seriously. This Privacy Policy explains how we collect, 
					use, and protect your information when you use our service. We are committed to transparency 
					and ensuring your data remains private and secure.
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
						<h2 class="text-3xl font-bold mb-4">Information We Collect</h2>
						<div class="space-y-4 text-base-content/70">
							<div>
								<h3 class="text-xl font-semibold mb-2">Local Storage Data</h3>
								<p>
									TimeUTCNow uses IndexedDB (a browser storage technology) to store your preferences locally on your device. 
									This includes:
								</p>
								<ul class="list-disc list-inside mt-2 space-y-1 ml-4">
									<li>Selected cities for your UTC clock</li>
									<li>Time format preferences (12-hour or 24-hour)</li>
									<li>City display order</li>
									<li>Widget configurations</li>
								</ul>
								<p class="mt-3">
									<strong>Important:</strong> This data is stored entirely on your device and is never transmitted to our servers. 
									We have no access to this information.
								</p>
							</div>
							<div>
								<h3 class="text-xl font-semibold mb-2">No Personal Information</h3>
								<p>
									We do not collect, store, or transmit any personal information such as names, email addresses, 
									phone numbers, or any other identifying information. TimeUTCNow does not require registration 
									or account creation.
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
						<h2 class="text-3xl font-bold mb-4">How We Use Information</h2>
						<div class="space-y-3 text-base-content/70">
							<p>
								Since all preference data is stored locally on your device, we do not use your information 
								for any purpose. The data stored in IndexedDB is used solely to:
							</p>
							<ul class="list-disc list-inside space-y-1 ml-4">
								<li>Remember your selected cities and preferences</li>
								<li>Maintain your preferred time format</li>
								<li>Preserve your widget configurations</li>
								<li>Enhance your user experience on return visits</li>
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
						<h2 class="text-3xl font-bold mb-4">Cookies and Tracking</h2>
						<div class="space-y-3 text-base-content/70">
							<p>
								TimeUTCNow does not use cookies for tracking purposes. We do not employ any third-party 
								analytics services, advertising networks, or tracking technologies.
							</p>
							<p>
								The only data stored is in your browser's IndexedDB, which is used exclusively for 
								storing your preferences locally.
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
						<h2 class="text-3xl font-bold mb-4">Data Security</h2>
						<div class="space-y-3 text-base-content/70">
							<p>
								Since all your preference data is stored locally on your device using IndexedDB, 
								it is protected by your browser's security mechanisms. We do not have access to 
								this data, and it cannot be accessed by third parties through our service.
							</p>
							<p>
								TimeUTCNow is served over HTTPS, ensuring that all communication between your 
								browser and our servers is encrypted and secure.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Third-Party Services -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300">
				<h2 class="text-3xl font-bold mb-4">Third-Party Services</h2>
				<div class="space-y-3 text-base-content/70">
					<p>
						TimeUTCNow does not integrate with any third-party services that collect or process 
						user data. We do not use:
					</p>
					<ul class="list-disc list-inside space-y-1 ml-4">
						<li>Analytics services (Google Analytics, etc.)</li>
						<li>Advertising networks</li>
						<li>Social media tracking pixels</li>
						<li>User behavior tracking tools</li>
						<li>Third-party data processors</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Your Rights -->
		<section class="mb-12">
			<div class="bg-primary rounded-3xl p-8 md:p-12 text-primary-content">
				<h2 class="text-3xl font-bold mb-6">Your Rights</h2>
				<div class="space-y-4 text-primary-content/90">
					<div>
						<h3 class="text-xl font-semibold mb-2">Data Control</h3>
						<p>
							You have complete control over your data. Since all preferences are stored locally 
							on your device, you can:
						</p>
						<ul class="list-disc list-inside mt-2 space-y-1 ml-4">
							<li>Clear your browser's IndexedDB to remove all stored preferences</li>
							<li>Modify your preferences at any time through the application</li>
							<li>Use the application in incognito/private browsing mode to prevent data storage</li>
						</ul>
					</div>
					<div>
						<h3 class="text-xl font-semibold mb-2">No Data Collection</h3>
						<p>
							Since we do not collect any personal information, there is no data to request, 
							modify, or delete from our servers. Your privacy is protected by design.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Changes to Privacy Policy -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300">
				<h2 class="text-3xl font-bold mb-4">Changes to This Privacy Policy</h2>
				<p class="text-base-content/70">
					We may update this Privacy Policy from time to time. Any changes will be posted on this page 
					with an updated "Last updated" date. We encourage you to review this Privacy Policy periodically 
					to stay informed about how we protect your information.
				</p>
			</div>
		</section>

		<!-- Contact -->
		<section class="mb-12">
			<div class="bg-base-100 rounded-2xl p-8 border border-base-300 text-center">
				<h2 class="text-3xl font-bold mb-4">Questions About Privacy?</h2>
				<p class="text-base-content/70 mb-6">
					If you have any questions or concerns about this Privacy Policy or our data practices, 
					please contact us.
				</p>
				<a href="/{page.params.locale}/contact" class="btn btn-primary">
					{m.contact()}
				</a>
			</div>
		</section>
	</main>

	<AppFooter />
</div>