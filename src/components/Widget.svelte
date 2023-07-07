<script>
	import Icon from "./Icon.svelte";

	export let icon = null
	export let title = ''
	export let rotate = null
	export let unit = null
</script>

<div class="wWidget">
	{#if icon}
		<div class="wWidget-icon bi-masked" style="{rotate ? `--rotate: ${rotate}deg` : null}">
			<Icon name='{icon}' />
		</div>
	{/if}
	<div class="wWidget-text">
		<div class="wWidget-title">{ title }</div>
		<div class="wWidget-value fz1">
			<slot></slot>
			{#if unit}
				<span class="wWidget-value-units">{ unit }</span>
			{/if}
		</div>
	</div>
</div>