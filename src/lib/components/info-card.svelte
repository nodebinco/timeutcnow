<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Copy, Check, Info } from 'lucide-svelte';

	interface Props {
		title: string;
		value: string;
		subtitle?: string;
		badge?: string;
		badgeVariant?: 'primary' | 'secondary';
		showCopy?: boolean;
		showInfo?: boolean;
		copied?: boolean;
		onCopy?: () => void;
		class?: string;
	}

	let {
		title,
		value,
		subtitle,
		badge,
		badgeVariant = 'secondary',
		showCopy = false,
		showInfo = false,
		copied = false,
		onCopy,
		class: className = ''
	}: Props = $props();
</script>

<div class="card bg-base-100 border border-base-300 shadow-sm {className}">
	<div class="card-body">
		<div class="flex items-center justify-between mb-4">
			<span class="text-base-content/60 text-sm font-semibold uppercase tracking-wider">{title}</span>
			<div class="flex items-center gap-2">
				{#if badge}
					<span class="badge badge-{badgeVariant === 'primary' ? 'primary' : 'secondary'} badge-sm">{badge}</span>
				{/if}
				{#if showInfo}
					<Info class="w-4 h-4 text-base-content/40" />
				{/if}
				{#if showCopy && onCopy}
					<button
						type="button"
						class="btn btn-ghost btn-xs btn-circle"
						onclick={onCopy}
						aria-label="Copy to clipboard"
					>
						{#if copied}
							<Check class="w-4 h-4 text-success" />
						{:else}
							<Copy class="w-4 h-4 text-base-content/40" />
						{/if}
					</button>
				{/if}
			</div>
		</div>
		<div class="text-3xl font-bold tabular-nums mb-1">{value}</div>
		{#if subtitle}
			<div class="text-base-content/60 text-sm">{subtitle}</div>
		{/if}
	</div>
</div>
