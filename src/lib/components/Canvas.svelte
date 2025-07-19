<script lang="ts">
  import { blocks, selectedBlockId } from '$lib/stores';
  import type { Block } from '$lib/stores';
  import { dndzone } from 'svelte-dnd-action';

  // Importamos TODOS os blocos, incluindo os novos
  import Header from '$lib/components/blocos/Header.svelte';
  import ProfileCard from '$lib/components/blocos/ProfileCard.svelte';
  import LinkList from '$lib/components/blocos/LinkList.svelte';
  import RichText from '$lib/components/blocos/RichText.svelte';
  import ImageBlock from '$lib/components/blocos/ImageBlock.svelte';

  // Adicionamos os novos blocos ao mapa de componentes
  const componentMap = { Header, ProfileCard, LinkList, RichText, ImageBlock };

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
  .canvas-container { padding: 2rem; min-height: 100%; box-sizing: border-box; }
  .block-wrapper { margin-bottom: 1.5rem; cursor: grab; border-radius: 4px; transition: all 0.2s ease-in-out; outline: 3px solid transparent; }
  .block-wrapper.selected { outline-color: #4f46e5; box-shadow: 0 0 25px rgba(79, 70, 229, 0.4); }
  .dnd-wrapper { padding-bottom: 20vh; } /* Adiciona espaço no final para o drop */
  .empty-canvas-message { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 80vh; border: 2px dashed #9ca3af; border-radius: 1rem; color: #6b7280; text-align: center; }
</style>