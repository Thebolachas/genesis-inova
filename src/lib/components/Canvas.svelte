<script lang="ts">
  import { blocks, selectedBlockId } from '$lib/stores';
  import type { Block } from '$lib/stores';
  import { dndzone } from 'svelte-dnd-action';
  import Header from '$lib/components/blocos/Header.svelte';
  import ProfileCard from '$lib/components/blocos/ProfileCard.svelte';
  import LinkList from '$lib/components/blocos/LinkList.svelte';

  const componentMap = { Header, ProfileCard, LinkList };

  function handleDndUpdate(event: CustomEvent<{ items: Block[], info: any }>) {
    blocks.set(event.detail.items);
  }
</script>
<div class="canvas-container">
  {#if $blocks.length > 0}
    <div class="dnd-wrapper" use:dndzone={{ items: $blocks, flipDurationMs: 200 }} on:consider={handleDndUpdate} on:finalize={handleDndUpdate}>
      {#each $blocks as block (block.id)}
        <div class="block-wrapper" id={block.id} class:selected={$selectedBlockId === block.id} on:click|stopPropagation={() => selectedBlockId.set(block.id)}>
          <svelte:component this={componentMap[block.type]} {...block.props} />
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-canvas-message">
      <p>Ocorreu um erro ao carregar os blocos.</p>
      <p>Volte e tente novamente.</p>
    </div>
  {/if}
</div>
<style>
  .canvas-container { padding: 2rem; background-color: #e5e7eb; min-height: 100%; }
  .block-wrapper { margin-bottom: 1.5rem; cursor: grab; border-radius: 4px; transition: all 0.2s ease-in-out; outline: 3px solid transparent; }
  .block-wrapper.selected { outline-color: #4f46e5; box-shadow: 0 0 25px rgba(79, 70, 229, 0.4); }
  .block-wrapper:global(.dnd-ghost) { cursor: grabbing; background-color: rgba(255, 255, 255, 0.5); outline: 2px dashed #4f46e5; }
  .block-wrapper:global(.dnd-dropzone-occupied) { background-color: rgba(139, 92, 246, 0.2); }
  .empty-canvas-message { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 80vh; border: 2px dashed #9ca3af; border-radius: 1rem; color: #6b7280; text-align: center; }
</style>