<script lang="ts">
  import { blocks, selectedBlockId, removeBlock, updateBlockProps } from '$lib/stores';
  import { derived } from 'svelte/store';

  const selectedBlock = derived(
    [blocks, selectedBlockId],
    ([$blocks, $selectedBlockId]) => $blocks.find(b => b.id === $selectedBlockId)
  );
  const selectedBlockIndex = derived(
    [blocks, selectedBlockId],
    ([$blocks, $selectedBlockId]) => $blocks.findIndex(b => b.id === $selectedBlockId)
  );
</script>

<div class="panel-container">
  {#if $selectedBlock && $selectedBlockIndex !== -1}
    <div class="panel-header">
      <h3>Editando: {$selectedBlock.type}</h3>
      <button class="close-button" on:click={() => selectedBlockId.set(null)} title="Fechar painel">×</button>
    </div>
    <div class="controls-wrapper">

      {#if $selectedBlock.type === 'Header'}
        <p class="info-panel">Clique no título ou no fundo do bloco no canvas para editar.</p>
      {/if}

      {#if $selectedBlock.type === 'ProfileCard'}
        <p class="info-panel">Clique nos textos no canvas para editar o conteúdo e o estilo.</p>
        <div class="controle-grupo">
          <h4>Layout</h4>
          <div class="controle">
            <label>Estilo do Cartão</label>
            <div class="variant-selector">
              <button 
                class:active={$blocks[$selectedBlockIndex].props.styleVariant === 'top'} 
                on:click={() => updateBlockProps($selectedBlock!.id, { styleVariant: 'top' })}
              >Topo</button>
              <button 
                class:active={$blocks[$selectedBlockIndex].props.styleVariant === 'left'} 
                on:click={() => updateBlockProps($selectedBlock!.id, { styleVariant: 'left' })}
              >Esquerda</button>
            </div>
          </div>
        </div>
      {/if}

      {#if $selectedBlock.type === 'LinkList'}
        <div class="info-panel">
          <p>Dê um duplo-clique em um link no canvas para editar o texto e a URL.</p>
          <p>Use o botão "+" que aparece no canvas para adicionar novos links.</p>
        </div>
      {/if}

      <div class="danger-zone">
        <button class="remove-block-button" on:click={() => removeBlock($selectedBlock!.id)}>
          Remover Bloco
        </button>
      </div>
    </div>
  {:else}
    <div class="no-selection">
      <p>← Clique em um bloco no canvas para editar suas propriedades.</p>
    </div>
  {/if}
</div>

<style>
  .info-panel { background-color: #f3f4f6; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.9rem; color: #4b5563; text-align: center; }
  .controle-grupo { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; }
  .controle-grupo:last-of-type { border-bottom: none; }
  .controle-grupo h4 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1rem; color: #374151; }
  
  .panel-container { background-color: #ffffff; height: 100%; border-left: 1px solid #e5e7eb; display: flex; flex-direction: column; }
  .panel-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
  .close-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; }
  .controls-wrapper { padding: 1.5rem; overflow-y: auto; flex-grow: 1; }
  .no-selection { text-align: center; padding: 2rem; color: #6b7280; display: flex; flex-direction: column; justify-content: center; align-items: center; margin: auto; }
  
  .controle { margin-bottom: 1rem; width: 100%; text-align: left; }
  .controle label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
  .controle input, .controle textarea, .controle select { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box; }
  
  .variant-selector { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #d1d5db; border-radius: 0.375rem; overflow: hidden; }
  .variant-selector button { padding: 0.5rem; background-color: #ffffff; border: none; cursor: pointer; color: #4b5563; transition: background-color 0.2s; }
  .variant-selector button:first-child { border-right: 1px solid #d1d5db; }
  
  .variant-selector button.active { 
    background-color: #e0e7ff; 
    color: #4338ca; 
    font-weight: bold; 
  }

  .danger-zone { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
  .remove-block-button { width: 100%; padding: 0.75rem; background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 0.375rem; font-weight: bold; cursor: pointer; transition: all 0.2s; }
  .remove-block-button:hover { background-color: #fca5a5; color: #7f1d1d; }
</style>