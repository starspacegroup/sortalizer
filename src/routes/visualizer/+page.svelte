<script lang="ts">
	import SortingVisualizer from '$lib/components/SortingVisualizer.svelte';
</script>

<svelte:head>
	<title>Sorting Algorithm Visualizer | Sortalizer</title>
	<meta
		name="description"
		content="Interactive sorting algorithm visualizer with sound. Watch bubble sort, merge sort, quick sort and more in action."
	/>
</svelte:head>

<main class="page">
	<SortingVisualizer />
</main>

<style>
	.page {
		min-height: 100vh;
		padding: var(--spacing-xl) 0;
		background: linear-gradient(
			180deg,
			var(--color-background) 0%,
			var(--color-surface) 50%,
			var(--color-background) 100%
		);
	}
</style>
