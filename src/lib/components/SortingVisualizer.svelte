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
	let speed = 100; // Speed percentage (100 = fastest)
	let comparisons = 0;
	let swaps = 0;

	// Convert speed percentage to delay in ms (100% = 1ms, 0% = 500ms)
	$: delay = Math.max(1, Math.round(500 - (speed / 100) * 499));

	// Restart animation when delay changes during playback
	$: if (delay && isPlaying) {
		playAnimation();
	}

	// Sound generator
	let soundGenerator: SoundGenerator;
	let volume = 0.3;
	let muted = false;

	// Animation state
	let comparingIndices: number[] = [];
	let swappingIndices: number[] = [];
	let sortedIndices: number[] = [];
	let pivotIndex: number | undefined;

	// Timer
	let intervalId: number | null = null;

	onMount(() => {
		soundGenerator = new SoundGenerator();
		soundGenerator.setVolume(volume);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
		if (soundGenerator) soundGenerator.dispose();
	});

	// Get max value for sound mapping
	$: maxValue = Math.max(...array);

	// Algorithm functions map
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
			// Generate steps
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

			// Update visual state
			comparingIndices = [];
			swappingIndices = [];
			pivotIndex = undefined;

			if (step.indices) {
				if (step.type === 'compare') {
					comparingIndices = step.indices;
					comparisons++;

					// Play comparison sound
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

					// Play swap sound
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

	function handleArraySizeChange() {
		generateNewArray();
	}

	function handleAlgorithmChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedAlgorithm = target.value;
		stop();
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
		if (sortedIndices.includes(index)) {
			return 'var(--color-success)';
		}
		if (pivotIndex === index) {
			return 'var(--color-warning)';
		}
		if (swappingIndices.includes(index)) {
			return 'var(--color-error)';
		}
		if (comparingIndices.includes(index)) {
			return 'var(--color-secondary)';
		}
		return 'var(--color-primary)';
	}

	function getBarHeight(value: number): number {
		return (value / maxValue) * 100;
	}

	// Keyboard shortcuts
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

<svelte:window on:keydown={handleKeydown} />

<div class="visualizer">
	<!-- Header -->
	<div class="header">
		<h1>Sorting Algorithm Visualizer</h1>
		<p class="subtitle">
			Watch algorithms come to life with real-time visualization and sound
		</p>
	</div>

	<!-- Controls -->
	<div class="controls">
		<!-- Algorithm Selection -->
		<div class="control-group">
			<label for="algorithm">Algorithm</label>
			<select id="algorithm" value={selectedAlgorithm} on:change={handleAlgorithmChange}>
				{#each Object.entries(algorithms) as [key, info]}
					<option value={key}>{info.name}</option>
				{/each}
			</select>
		</div>

		<!-- Array Size -->
		<div class="control-group">
			<label for="size">
				Array Size: <span class="value">{arraySize}</span>
			</label>
			<input
				id="size"
				type="range"
				min="10"
				max="200"
				autocomplete="off"
				bind:value={arraySize}
				on:change={handleArraySizeChange}
				disabled={isPlaying}
			/>
		</div>

		<!-- Speed -->
		<div class="control-group">
			<label for="speed">
				Speed: <span class="value">{speed}%</span>
			</label>
			<input
				id="speed"
				type="range"
				min="1"
				max="100"
				autocomplete="off"
				bind:value={speed}
			/>
		</div>

		<!-- Sound Controls -->
		<div class="control-group sound-controls">
			<label for="volume">Volume</label>
			<div class="sound-row">
				<button class="icon-btn" on:click={toggleMute} aria-label="Toggle mute">
					{#if muted}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M11 5L6 9H2v6h4l5 4V5z" />
							<line x1="23" y1="9" x2="17" y2="15" />
							<line x1="17" y1="9" x2="23" y2="15" />
						</svg>
					{:else}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M11 5L6 9H2v6h4l5 4V5z" />
							<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
							<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
						</svg>
					{/if}
				</button>
				<input
					id="volume"
					type="range"
					min="0"
					max="1"
					step="0.1"
					value={volume}
					on:input={handleVolumeChange}
					disabled={muted}
				/>
			</div>
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="actions">
		<button class="btn btn-primary" on:click={isPlaying ? pause : start} disabled={isSorted}>
			{#if isPlaying}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<rect x="6" y="4" width="4" height="16" />
					<rect x="14" y="4" width="4" height="16" />
				</svg>
				Pause
			{:else}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M8 5v14l11-7z" />
				</svg>
				Play
			{/if}
		</button>

		<button class="btn btn-secondary" on:click={stop} disabled={!isPlaying && currentStep === 0}>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
				<rect x="6" y="6" width="12" height="12" />
			</svg>
			Reset
		</button>

		<button class="btn btn-secondary" on:click={shuffle} disabled={isPlaying}>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
			</svg>
			Shuffle
		</button>
	</div>

	<!-- Visualization Area -->
	<div class="visualization">
		<div class="bars-container">
			{#each array as value, index}
				<div
					class="bar"
					style="
						height: {getBarHeight(value)}%;
						background-color: {getBarColor(index)};
						width: {Math.max(1, 100 / array.length - 0.5)}%;
					"
					class:comparing={comparingIndices.includes(index)}
					class:swapping={swappingIndices.includes(index)}
					class:sorted={sortedIndices.includes(index)}
					class:pivot={pivotIndex === index}
				></div>
			{/each}
		</div>
	</div>

	<!-- Stats and Info -->
	<div class="info">
		<div class="stats">
			<div class="stat">
				<span class="stat-label">Comparisons</span>
				<span class="stat-value">{comparisons}</span>
			</div>
			<div class="stat">
				<span class="stat-label">Swaps</span>
				<span class="stat-value">{swaps}</span>
			</div>
			<div class="stat">
				<span class="stat-label">Progress</span>
				<span class="stat-value"
					>{currentStep} / {steps.length || 0}</span
				>
			</div>
		</div>

		<div class="algorithm-info">
			<h3>{algorithms[selectedAlgorithm].name}</h3>
			<p class="description">{algorithms[selectedAlgorithm].description}</p>
			<div class="complexity">
				<div class="complexity-item">
					<strong>Time:</strong>
					<span>Best: {algorithms[selectedAlgorithm].timeComplexity.best}</span>
					<span>Average: {algorithms[selectedAlgorithm].timeComplexity.average}</span>
					<span>Worst: {algorithms[selectedAlgorithm].timeComplexity.worst}</span>
				</div>
				<div class="complexity-item">
					<strong>Space:</strong>
					<span>{algorithms[selectedAlgorithm].spaceComplexity}</span>
				</div>
			</div>
		</div>

		<div class="legend">
			<div class="legend-item">
				<div class="legend-color" style="background-color: var(--color-primary);"></div>
				<span>Unsorted</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: var(--color-secondary);"></div>
				<span>Comparing</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: var(--color-error);"></div>
				<span>Swapping</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: var(--color-warning);"></div>
				<span>Pivot</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: var(--color-success);"></div>
				<span>Sorted</span>
			</div>
		</div>

		<div class="keyboard-shortcuts">
			<p><strong>Keyboard Shortcuts:</strong></p>
			<p><kbd>Space</kbd> Play/Pause</p>
			<p><kbd>R</kbd> Reset</p>
			<p><kbd>M</kbd> Mute/Unmute</p>
		</div>
	</div>
</div>

<style>
	.visualizer {
		width: 100%;
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--spacing-lg);
	}

	.header {
		text-align: center;
		margin-bottom: var(--spacing-2xl);
	}

	.header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: var(--spacing-sm);
		background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.subtitle {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
	}

	/* Controls */
	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.control-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.value {
		color: var(--color-primary);
		font-weight: 700;
	}

	select,
	input[type='range'] {
		width: 100%;
	}

	select {
		padding: var(--spacing-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-background);
		color: var(--color-text);
		font-size: 0.938rem;
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	select:hover {
		border-color: var(--color-primary);
	}

	select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 10%, transparent);
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
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
		transition: all var(--transition-fast);
	}

	input[type='range']::-webkit-slider-thumb:hover {
		background: var(--color-primary-hover);
		transform: scale(1.1);
	}

	input[type='range']::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
		transition: all var(--transition-fast);
	}

	input[type='range']::-moz-range-thumb:hover {
		background: var(--color-primary-hover);
		transform: scale(1.1);
	}

	input[type='range']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.sound-controls {
		grid-column: span 1;
	}

	.sound-row {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.icon-btn {
		padding: var(--spacing-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.icon-btn:hover {
		background: var(--color-primary);
		color: var(--color-background);
		border-color: var(--color-primary);
	}

	/* Actions */
	.actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		margin-bottom: var(--spacing-2xl);
		flex-wrap: wrap;
	}

	.btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-xl);
		border: none;
		border-radius: var(--radius-md);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		box-shadow: var(--shadow-sm);
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.btn:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--color-primary);
		color: var(--color-background);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.btn-secondary {
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-surface-hover);
		border-color: var(--color-primary);
	}

	/* Visualization */
	.visualization {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-2xl);
		min-height: 400px;
		display: flex;
		align-items: flex-end;
	}

	.bars-container {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 1px;
		width: 100%;
		height: 400px;
	}

	.bar {
		flex: 1;
		min-width: 2px;
		border-radius: 2px 2px 0 0;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 -2px 4px color-mix(in srgb, var(--color-background) 10%, transparent);
	}

	.bar.comparing {
		transform: scaleY(1.05);
		box-shadow: 0 -4px 8px color-mix(in srgb, var(--color-secondary) 40%, transparent);
	}

	.bar.swapping {
		transform: scaleY(1.1);
		box-shadow: 0 -4px 12px color-mix(in srgb, var(--color-error) 50%, transparent);
		animation: pulse 0.3s ease-in-out;
	}

	.bar.sorted {
		box-shadow: 0 -2px 8px color-mix(in srgb, var(--color-success) 40%, transparent);
	}

	.bar.pivot {
		box-shadow: 0 -4px 12px color-mix(in srgb, var(--color-warning) 50%, transparent);
		animation: glow 0.8s ease-in-out infinite alternate;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scaleY(1.1);
		}
		50% {
			transform: scaleY(1.2);
		}
	}

	@keyframes glow {
		from {
			box-shadow: 0 -4px 12px color-mix(in srgb, var(--color-warning) 50%, transparent);
		}
		to {
			box-shadow: 0 -4px 20px color-mix(in srgb, var(--color-warning) 80%, transparent);
		}
	}

	/* Info Section */
	.info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--spacing-xl);
	}

	.stats {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm) 0;
		border-bottom: 1px solid var(--color-border);
	}

	.stat:last-child {
		border-bottom: none;
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.algorithm-info {
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.algorithm-info h3 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: var(--spacing-sm);
	}

	.description {
		font-size: 0.938rem;
		color: var(--color-text-secondary);
		line-height: 1.6;
		margin-bottom: var(--spacing-md);
	}

	.complexity {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		font-size: 0.875rem;
	}

	.complexity-item {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
	}

	.complexity-item strong {
		color: var(--color-text);
		min-width: 60px;
	}

	.complexity-item span {
		color: var(--color-text-secondary);
	}

	.legend {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.legend-color {
		width: 24px;
		height: 16px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.keyboard-shortcuts {
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		font-size: 0.875rem;
		line-height: 1.8;
	}

	.keyboard-shortcuts strong {
		color: var(--color-text);
	}

	.keyboard-shortcuts p {
		color: var(--color-text-secondary);
		margin: var(--spacing-xs) 0;
	}

	kbd {
		display: inline-block;
		padding: 2px 8px;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.813rem;
		font-weight: 600;
		color: var(--color-text);
		box-shadow: 0 1px 2px color-mix(in srgb, var(--color-background) 10%, transparent);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.visualizer {
			padding: var(--spacing-md);
		}

		.header h1 {
			font-size: 1.75rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.controls {
			grid-template-columns: 1fr;
			padding: var(--spacing-md);
		}

		.actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}

		.bars-container {
			height: 300px;
		}

		.info {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.header h1 {
			font-size: 1.5rem;
		}

		.subtitle {
			font-size: 0.938rem;
		}

		.bars-container {
			height: 250px;
		}
	}
</style>
