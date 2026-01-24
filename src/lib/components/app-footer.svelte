<script lang="ts">
	import { page } from '$app/state';
	import { localizeHref } from '$lib/paraglide/runtime';
	import SiteLogo from '$lib/components/site-logo.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<footer class="border-t border-base-300 py-12 bg-base-200 mt-20">
	<div class="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
		<div class="col-span-2">
			<div class="mb-4">
				<SiteLogo iconSize={4} textSize="text-lg" containerSize="w-6 h-6" />
			</div>
			<p class="text-base-content/60 text-sm max-w-xs mb-6">
				{m.footer_tagline()}
			</p>
		</div>
		<div>
			<h4 class="font-bold mb-4">{m.footer_tools()}</h4>
			<ul class="space-y-2 text-sm text-base-content/60">
				<li><a href={localizeHref("/")} class="hover:text-primary">{m.utc_clock()}</a></li>
				<li><a href={localizeHref("/time-zone-converter")} class="hover:text-primary">{m.time_zone_converter()}</a></li>
			</ul>
		</div>
		<div>
			<h4 class="font-bold mb-4">{m.footer_support()}</h4>
			<ul class="space-y-2 text-sm text-base-content/60">
				<li><a href={localizeHref("/about")} class="hover:text-primary">{m.about_us()}</a></li>
				<li><a href={localizeHref("/privacy")} class="hover:text-primary">{m.privacy_policy()}</a></li>
				<li><a href={localizeHref("/contact")} class="hover:text-primary">{m.contact()}</a></li>
			</ul>
		</div>
	</div>
	<div class="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-base-300 text-center text-xs text-base-content/40">
		© {new Date().getFullYear()} {m.site_name()}. {m.footer_copyright()}
	</div>
</footer>
