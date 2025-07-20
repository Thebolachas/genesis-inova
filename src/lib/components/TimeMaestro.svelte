<script lang="ts">
    import { history, historyIndex, undo, redo } from '$lib/stores';
    import { derived } from 'svelte/store';

    // Deriva estados para saber se podemos desfazer ou refazer
    const canUndo = derived(historyIndex, $index => $index > 0);
    const canRedo = derived([history, historyIndex], ([$history, $index]) => $index < $history.length - 1);
</script>

<div class="maestro-container">
    <button class="maestro-button" on:click={undo} disabled={!$canUndo} title="Desfazer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5,8C9.85,8,7.45,9,5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22,10.54,10.5,12.5,10.5C16.04,10.5,19.05,12.81,20.1,16L22.47,15.22C21.08,11.03,17.15,8,12.5,8Z" /></svg>
    </button>
    
    <div class="timeline">
        {#each $history as _, i}
            <div class="anchor" class:active={i === $historyIndex} />
        {/each}
    </div>

    <button class="maestro-button" on:click={redo} disabled={!$canRedo} title="Refazer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.4,10.6C16.55,9,14.15,8,11.5,8C6.85,8,2.92,11.03,1.54,15.22L3.9,16C4.95,12.81,7.95,10.5,11.5,10.5C13.45,10.5,15.23,11.22,16.62,12.38L13,16H22V7L18.4,10.6Z" /></svg>
    </button>
</div>

<style>
    .maestro-container {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        background-color: rgba(17, 24, 39, 0.8);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 0 2rem;
        box-sizing: border-box;
    }
    .maestro-button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.5rem;
        transition: all 0.2s;
    }
    .maestro-button:disabled {
        color: #4b5563;
        cursor: not-allowed;
    }
    .maestro-button:not(:disabled):hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
    }
    .maestro-button svg {
        width: 28px;
        height: 28px;
    }
    .timeline {
        flex-grow: 1;
        height: 4px;
        background-color: #4b5563;
        border-radius: 2px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 0.5rem;
    }
    .anchor {
        width: 10px;
        height: 10px;
        background-color: #9ca3af;
        border-radius: 50%;
        transition: all 0.2s;
    }
    .anchor.active {
        background-color: #a78bfa;
        transform: scale(1.5);
    }
</style>