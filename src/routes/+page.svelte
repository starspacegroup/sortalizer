<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		bubbleSort,
		mergeSort,
		quickSort,
		insertionSort,
		selectionSort,
		heapSort,
		generateRandomArray,
		shuffleArray,
		algorithms,
		type SortStep
	} from '$lib/services/sortingAlgorithms';
	import { SoundGenerator } from '$lib/services/soundGenerator';

	// State
	let array: number[] = generateRandomArray(23);
	let steps: SortStep[] = [];
	let currentStep = 0;
	let isPlaying = false;
	let isSorted = false;
	let selectedAlgorithm = 'bubble';
	let arraySize = 23;
	let speed = 100; // 0-100 scale: 0 = slowest (500ms), 100 = fastest (1ms)
	let comparisons = 0;
	let swaps = 0;

	// Sound generator
	let soundGenerator: SoundGenerator;
	let volume = 0.05;
	let muted = false;

	// Animation state
	let comparingIndices: number[] = [];
	let swappingIndices: number[] = [];
	let sortedIndices: number[] = [];
	let pivotIndex: number | undefined;

	// Timer
	let intervalId: number | null = null;
	
	// UI state
	let mounted = false;
	let showControls = true;

	onMount(() => {
		mounted = true;
		soundGenerator = new SoundGenerator();
		soundGenerator.setVolume(volume);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
		if (soundGenerator) soundGenerator.dispose();
	});

	$: maxValue = Math.max(...array);
	$: progress = steps.length > 0 ? (currentStep / steps.length) * 100 : 0;
	
	// Convert speed (0-100) to delay: 0 = 500ms, 100 = 1ms
	$: delay = Math.round(500 - (speed * 4.99));

	const algorithmFunctions: Record<string, (arr: number[]) => SortStep[]> = {
		bubble: bubbleSort,
		insertion: insertionSort,
		selection: selectionSort,
		merge: mergeSort,
		quick: quickSort,
		heap: heapSort
	};

	function generateNewArray() {
		stop();
		array = generateRandomArray(arraySize);
		resetState();
	}

	function shuffle() {
		stop();
		array = shuffleArray(array);
		resetState();
	}

	function resetState() {
		steps = [];
		currentStep = 0;
		isPlaying = false;
		isSorted = false;
		comparisons = 0;
		swaps = 0;
		comparingIndices = [];
		swappingIndices = [];
		sortedIndices = [];
		pivotIndex = undefined;
	}

	function start() {
		if (steps.length === 0) {
			const sortFunction = algorithmFunctions[selectedAlgorithm];
			steps = sortFunction([...array]);
			currentStep = 0;
			comparisons = 0;
			swaps = 0;
		}

		if (currentStep >= steps.length) {
			currentStep = 0;
		}

		isPlaying = true;
		playAnimation();
	}

	function pause() {
		isPlaying = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function stop() {
		pause();
		resetState();
	}

	function playAnimation() {
		if (intervalId) clearInterval(intervalId);

		intervalId = setInterval(() => {
			if (!isPlaying || currentStep >= steps.length) {
				pause();
				if (currentStep >= steps.length) {
					isSorted = true;
					sortedIndices = array.map((_, i) => i);
				}
				return;
			}

			const step = steps[currentStep];
			array = [...step.array];

			comparingIndices = [];
			swappingIndices = [];
			pivotIndex = undefined;

			if (step.indices) {
				if (step.type === 'compare') {
					comparingIndices = step.indices;
					comparisons++;
					if (step.indices.length >= 2 && !muted) {
						soundGenerator.playComparison(
							step.array[step.indices[0]],
							step.array[step.indices[1]],
							maxValue
						);
					}
				} else if (step.type === 'swap') {
					swappingIndices = step.indices;
					swaps++;
					if (step.indices.length >= 2 && !muted) {
						soundGenerator.playSwap(
							step.array[step.indices[0]],
							step.array[step.indices[1]],
							maxValue
						);
					}
				}
			}

			if (step.pivot !== undefined) {
				pivotIndex = step.pivot;
			}

			if (step.sorted) {
				isSorted = true;
				sortedIndices = array.map((_, i) => i);
			}

			currentStep++;
		}, delay);
	}

	function handleSpeedChange(e: Event) {
		const target = e.target as HTMLInputElement;
		speed = parseInt(target.value);
		if (isPlaying) {
			pause();
			start();
		}
	}

	function handleArraySizeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		arraySize = parseInt(target.value);
		generateNewArray();
	}

	function handleVolumeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		volume = parseFloat(target.value);
		soundGenerator.setVolume(volume);
	}

	function toggleMute() {
		muted = !muted;
		soundGenerator.setMuted(muted);
	}

	function getBarColor(index: number): string {
		if (sortedIndices.includes(index)) return 'var(--color-success)';
		if (pivotIndex === index) return 'var(--color-warning)';
		if (swappingIndices.includes(index)) return 'var(--color-error)';
		if (comparingIndices.includes(index)) return 'var(--color-secondary)';
		return 'var(--color-primary)';
	}

	function getBarHeight(value: number): number {
		return (value / maxValue) * 100;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.code === 'Space') {
			e.preventDefault();
			if (isPlaying) pause();
			else start();
		} else if (e.code === 'KeyR') {
			e.preventDefault();
			stop();
		} else if (e.code === 'KeyM') {
			e.preventDefault();
			toggleMute();
		}
	}
</script>

<svelte:head>
	<title>Sortalizer - Interactive Sorting Algorithm Visualizer</title>
	<meta
		name="description"
		content="Watch sorting algorithms come to life with real-time visualization and sound. Explore bubble sort, merge sort, quick sort and more."
	/>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="app" class:mounted>
	<!-- Animated background -->
	<div class="bg-effects">
		<div class="gradient-orb orb-1"></div>
		<div class="gradient-orb orb-2"></div>
		<div class="gradient-orb orb-3"></div>
	</div>

	<!-- Hero Section -->
	<header class="hero">
		<div class="hero-content">
			<h1 class="title">
				<span class="title-icon">📊</span>
				Sortalizer
			</h1>
			<p class="tagline">Watch algorithms think, one swap at a time</p>
		</div>

		<!-- Algorithm Pills -->
		<div class="algorithm-pills">
			{#each Object.entries(algorithms) as [key, info]}
				<button
					class="pill"
					class:active={selectedAlgorithm === key}
					on:click={() => {
						if (selectedAlgorithm !== key) {
							selectedAlgorithm = key;
							generateNewArray();
						}
					}}
					disabled={isPlaying}
				>
					{info.name}
				</button>
			{/each}
		</div>
	</header>

	<!-- Main Visualization -->
	<main class="visualizer-section">
		<!-- Progress Bar -->
		<div class="progress-container">
			<div class="progress-bar" style="width: {progress}%"></div>
		</div>

		<!-- Bars -->
		<div class="bars-wrapper">
			<div class="bars-container">
				{#each array as value, index}
					<div
						class="bar"
						style="
							height: {getBarHeight(value)}%;
							background: {getBarColor(index)};
						"
						class:comparing={comparingIndices.includes(index)}
						class:swapping={swappingIndices.includes(index)}
						class:sorted={sortedIndices.includes(index)}
						class:pivot={pivotIndex === index}
					></div>
				{/each}
			</div>

			<!-- Floating Stats -->
			<div class="floating-stats">
				<div class="stat">
					<span class="stat-value">{comparisons}</span>
					<span class="stat-label">comparisons</span>
				</div>
				<div class="stat">
					<span class="stat-value">{swaps}</span>
					<span class="stat-label">swaps</span>
				</div>
			</div>
		</div>

		<!-- Control Bar -->
		<div class="control-bar">
			<!-- Left: Array controls -->
			<div class="control-group">
				<button class="btn btn-icon" on:click={shuffle} disabled={isPlaying} title="Shuffle">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
					</svg>
				</button>
			</div>

			<!-- Center: Playback -->
			<div class="control-group playback">
				<button class="btn btn-icon" on:click={stop} disabled={!isPlaying && currentStep === 0} title="Reset (R)">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<rect x="6" y="6" width="12" height="12" rx="1" />
					</svg>
				</button>
				<button class="btn btn-play" on:click={isPlaying ? pause : start} disabled={isSorted}>
					{#if isPlaying}
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="4" width="4" height="16" rx="1" />
							<rect x="14" y="4" width="4" height="16" rx="1" />
						</svg>
					{:else}
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					{/if}
				</button>
				<button class="btn btn-icon" on:click={toggleMute} title="Toggle Sound (M)">
					{#if muted}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M11 5L6 9H2v6h4l5 4V5z" />
							<line x1="23" y1="9" x2="17" y2="15" />
							<line x1="17" y1="9" x2="23" y2="15" />
						</svg>
					{:else}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M11 5L6 9H2v6h4l5 4V5z" />
							<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
							<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
						</svg>
					{/if}
				</button>
			</div>

			<!-- Right: Settings toggle -->
			<div class="control-group">
				<button
					class="btn btn-icon"
					class:active={showControls}
					on:click={() => (showControls = !showControls)}
					title="Settings"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="3" />
						<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Expandable Settings Panel -->
		{#if showControls}
			<div class="settings-panel">
				<div class="setting">
					<label for="size">
						<span class="setting-label">Array Size</span>
						<span class="setting-value">{arraySize}</span>
					</label>
					<input
						id="size"
						type="range"
						min="10"
						max="200"
						value={arraySize}
						on:input={handleArraySizeChange}
						disabled={isPlaying}
					/>
				</div>

				<div class="setting">
					<label for="speed">
						<span class="setting-label">Speed</span>
						<span class="setting-value">{speed}% ({delay}ms)</span>
					</label>
					<input
						id="speed"
						type="range"
						min="0"
						max="100"
						value={speed}
						on:input={handleSpeedChange}
					/>
				</div>

				<div class="setting">
					<label for="volume">
						<span class="setting-label">Volume</span>
						<span class="setting-value">{Math.round(volume * 100)}%</span>
					</label>
					<input
						id="volume"
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						on:input={handleVolumeChange}
						disabled={muted}
					/>
				</div>
			</div>
		{/if}
	</main>

	<!-- Info Footer -->
	<footer class="info-footer">
		<div class="algorithm-card">
			<div class="card-header">
				<h2>{algorithms[selectedAlgorithm].name}</h2>
				<div class="complexity-badge">
					{algorithms[selectedAlgorithm].timeComplexity.average}
				</div>
			</div>
			<p class="algorithm-description">{algorithms[selectedAlgorithm].description}</p>
			<div class="complexity-details">
				<div class="complexity-item">
					<span class="complexity-label">Best</span>
					<span class="complexity-value">{algorithms[selectedAlgorithm].timeComplexity.best}</span>
				</div>
				<div class="complexity-item">
					<span class="complexity-label">Worst</span>
					<span class="complexity-value">{algorithms[selectedAlgorithm].timeComplexity.worst}</span>
				</div>
				<div class="complexity-item">
					<span class="complexity-label">Space</span>
					<span class="complexity-value">{algorithms[selectedAlgorithm].spaceComplexity}</span>
				</div>
			</div>
		</div>

		<div class="legend-card">
			<div class="legend-item">
				<div class="legend-dot" style="background: var(--color-primary);"></div>
				<span>Unsorted</span>
			</div>
			<div class="legend-item">
				<div class="legend-dot" style="background: var(--color-secondary);"></div>
				<span>Comparing</span>
			</div>
			<div class="legend-item">
				<div class="legend-dot" style="background: var(--color-error);"></div>
				<span>Swapping</span>
			</div>
			<div class="legend-item">
				<div class="legend-dot" style="background: var(--color-warning);"></div>
				<span>Pivot</span>
			</div>
			<div class="legend-item">
				<div class="legend-dot" style="background: var(--color-success);"></div>
				<span>Sorted</span>
			</div>
		</div>

		<div class="shortcuts-card">
			<span class="shortcuts-title">Keyboard</span>
			<div class="shortcut"><kbd>Space</kbd> Play/Pause</div>
			<div class="shortcut"><kbd>R</kbd> Reset</div>
			<div class="shortcut"><kbd>M</kbd> Mute</div>
		</div>
	</footer>
</div>

<style>
	/* Base Layout */
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-background);
		position: relative;
		overflow-x: hidden;
		opacity: 0;
		transform: translateY(10px);
		transition: opacity 0.5s ease, transform 0.5s ease;
	}

	.app.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	/* Background Effects */
	.bg-effects {
		position: fixed;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.gradient-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
		opacity: 0.4;
		animation: float 20s ease-in-out infinite;
	}

	.orb-1 {
		width: 600px;
		height: 600px;
		background: var(--color-primary);
		top: -200px;
		left: -100px;
		animation-delay: 0s;
	}

	.orb-2 {
		width: 500px;
		height: 500px;
		background: var(--color-secondary);
		bottom: -150px;
		right: -100px;
		animation-delay: -7s;
	}

	.orb-3 {
		width: 400px;
		height: 400px;
		background: var(--color-primary);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation-delay: -14s;
		opacity: 0.2;
	}

	@keyframes float {
		0%, 100% { transform: translate(0, 0) scale(1); }
		25% { transform: translate(30px, -30px) scale(1.05); }
		50% { transform: translate(-20px, 20px) scale(0.95); }
		75% { transform: translate(20px, 10px) scale(1.02); }
	}

	/* Hero Section */
	.hero {
		position: relative;
		z-index: 1;
		padding: var(--spacing-xl) var(--spacing-lg);
		text-align: center;
	}

	.hero-content {
		margin-bottom: var(--spacing-xl);
	}

	.title {
		font-size: clamp(2rem, 6vw, 3.5rem);
		font-weight: 800;
		color: var(--color-text);
		margin: 0 0 var(--spacing-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
	}

	.title-icon {
		font-size: 0.8em;
	}

	.tagline {
		font-size: clamp(1rem, 2.5vw, 1.25rem);
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Algorithm Pills */
	.algorithm-pills {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--spacing-sm);
		max-width: 800px;
		margin: 0 auto;
	}

	.pill {
		padding: var(--spacing-sm) var(--spacing-lg);
		border: 1px solid var(--color-border);
		border-radius: 9999px;
		background: var(--color-surface);
		color: var(--color-text);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.pill:hover:not(:disabled) {
		border-color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 10%, transparent);
	}

	.pill.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-background);
	}

	.pill:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Visualizer Section */
	.visualizer-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 var(--spacing-lg);
		position: relative;
		z-index: 1;
	}

	/* Progress Bar */
	.progress-container {
		height: 3px;
		background: var(--color-border);
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: var(--spacing-md);
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
		border-radius: 2px;
		transition: width 0.1s linear;
	}

	/* Bars */
	.bars-wrapper {
		flex: 1;
		min-height: 300px;
		max-height: 500px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--spacing-lg);
		position: relative;
		overflow: hidden;
	}

	.bars-container {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 1px;
		position: absolute;
		left: var(--spacing-lg);
		right: var(--spacing-lg);
		bottom: var(--spacing-lg);
		top: var(--spacing-lg);
	}

	.bar {
		flex: 1;
		min-width: 2px;
		max-width: 20px;
		border-radius: 3px 3px 0 0;
		transition: height 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease-out;
		position: relative;
	}

	.bar::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(to top, transparent 0%, rgba(255,255,255,0.1) 100%);
	}

	.bar.comparing {
		transform: scaleY(1.02);
		background: var(--color-secondary) !important;
		box-shadow: 0 0 30px var(--color-secondary), 0 0 60px color-mix(in srgb, var(--color-secondary) 50%, transparent);
	}

	.bar.swapping {
		transform: scaleY(1.08);
		background: var(--color-error) !important;
		box-shadow: 0 0 30px var(--color-error), 0 0 60px color-mix(in srgb, var(--color-error) 50%, transparent);
		animation: swap-pulse 0.15s ease-in-out;
	}

	.bar.sorted {
		background: var(--color-success) !important;
		box-shadow: 0 0 15px color-mix(in srgb, var(--color-success) 50%, transparent);
	}

	.bar.pivot {
		background: var(--color-warning) !important;
		box-shadow: 0 0 25px var(--color-warning), 0 0 50px color-mix(in srgb, var(--color-warning) 50%, transparent);
		animation: pulse-pivot 0.8s ease-in-out infinite;
	}

	@keyframes swap-pulse {
		0%, 100% { transform: scaleY(1.08); }
		50% { transform: scaleY(1.15); }
	}

	@keyframes pulse-pivot {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.8; }
	}

	/* Floating Stats */
	.floating-stats {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		display: flex;
		gap: var(--spacing-lg);
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Control Bar */
	.control-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-lg) 0;
		gap: var(--spacing-md);
	}

	.control-group {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.playback {
		display: flex;
		gap: var(--spacing-md);
		align-items: center;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-icon {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.btn-icon:hover:not(:disabled) {
		background: var(--color-surface-hover);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.btn-icon.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-background);
	}

	.btn-play {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		color: var(--color-background);
		box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 40%, transparent);
	}

	.btn-play:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 6px 30px color-mix(in srgb, var(--color-primary) 50%, transparent);
	}

	.btn-play:active:not(:disabled) {
		transform: scale(0.98);
	}

	/* Settings Panel */
	.settings-panel {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-lg);
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin-bottom: var(--spacing-lg);
	}

	.setting {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.setting label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
	}

	.setting-label {
		color: var(--color-text);
		font-weight: 500;
	}

	.setting-value {
		color: var(--color-primary);
		font-weight: 600;
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: var(--color-border);
		outline: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		transition: transform 0.15s ease;
	}

	input[type='range']::-webkit-slider-thumb:hover {
		transform: scale(1.15);
	}

	input[type='range']::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
	}

	input[type='range']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Info Footer */
	.info-footer {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
		padding: var(--spacing-lg);
		margin-top: auto;
	}

	.algorithm-card {
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-sm);
	}

	.card-header h2 {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	.complexity-badge {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: color-mix(in srgb, var(--color-primary) 15%, transparent);
		color: var(--color-primary);
		border-radius: var(--radius-md);
		font-size: 0.75rem;
		font-weight: 600;
		font-family: var(--font-mono, monospace);
	}

	.algorithm-description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 0 0 var(--spacing-md);
	}

	.complexity-details {
		display: flex;
		gap: var(--spacing-lg);
		flex-wrap: wrap;
	}

	.complexity-item {
		display: flex;
		flex-direction: column;
	}

	.complexity-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.complexity-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
		font-family: var(--font-mono, monospace);
	}

	/* Legend Card */
	.legend-card {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		align-content: flex-start;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.legend-dot {
		width: 12px;
		height: 12px;
		border-radius: 3px;
	}

	/* Shortcuts Card */
	.shortcuts-card {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm) var(--spacing-lg);
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		align-content: flex-start;
	}

	.shortcuts-title {
		width: 100%;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: var(--spacing-xs);
	}

	.shortcut {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	kbd {
		display: inline-block;
		padding: 2px 6px;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono, monospace);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text);
		margin-right: var(--spacing-xs);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero {
			padding: var(--spacing-lg) var(--spacing-md);
		}

		.bars-wrapper {
			min-height: 250px;
		}

		.floating-stats {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.stat-value {
			font-size: 1.25rem;
		}

		.control-bar {
			flex-wrap: wrap;
			justify-content: center;
		}

		.playback {
			order: -1;
			width: 100%;
			justify-content: center;
			margin-bottom: var(--spacing-sm);
		}

		.info-footer {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.title {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.bars-wrapper {
			min-height: 200px;
			padding: var(--spacing-md);
		}

		.bars-container {
			left: var(--spacing-md);
			right: var(--spacing-md);
			bottom: var(--spacing-md);
			top: var(--spacing-md);
		}

		.btn-play {
			width: 56px;
			height: 56px;
		}

		.settings-panel {
			grid-template-columns: 1fr;
		}
	}
</style>
