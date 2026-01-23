<script lang="ts">
	import { Clock } from 'lucide-svelte';
	
	interface Props {
		class?: string;
		showIcon?: boolean;
		iconSize?: number;
		textSize?: string;
		containerSize?: string;
	}
	
	let {
		class: className = '',
		showIcon = true,
		iconSize = 5,
		textSize = 'text-xl',
		containerSize = 'w-8 h-8'
	}: Props = $props();
</script>

<div class="flex items-center gap-2 {className}">
	{#if showIcon}
		<div class="{containerSize} bg-primary rounded-lg flex items-center justify-center">
			<Clock class="text-primary-content" style="width: {iconSize * 0.25}rem; height: {iconSize * 0.25}rem;" />
		</div>
	{/if}
	<span class="font-bold {textSize} tracking-tight">
		Time<span class="text-primary">UTC</span>Now
	</span>
</div>
