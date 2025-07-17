<script lang="ts">
  import { blocks, selectedBlockId } from '$lib/stores';
  import { derived } from 'svelte/store';

  const selectedBlock = derived(
    [blocks, selectedBlockId],
    ([$blocks, $selectedBlockId]) => $blocks.find(b => b.id === $selectedBlockId)
  );
</script>
<div class="panel-container">
  {#if $selectedBlock}
    <div class="panel-header">
      <h3>Editando: {$selectedBlock.type}</h3>
      <button class="close-button" on:click={() => selectedBlockId.set(null)}>×</button>
    </div>
    <div class="controls-wrapper">
      {#if $selectedBlock.type === 'Header'}
        <div class="controle"><label>Texto do Título</label><input type="text" bind:value={$selectedBlock.props.titulo}></div>
        <div class="controle"><label>Cor de Fundo</label><input type="color" bind:value={$selectedBlock.props.corDeFundo}></div>
        <div class="controle"><label>Cor do Texto</label><input type="color" bind:value={$selectedBlock.props.corDoTexto}></div>
        <div class="controle"><label>Tamanho da Fonte</label><input type="range" min="1" max="6" step="0.1" bind:value={$selectedBlock.props.tamanhoDaFonte}></div>
      {/if}
      {#if $selectedBlock.type === 'ProfileCard'}
        <div class="controle"><label>Nome</label><input type="text" bind:value={$selectedBlock.props.nome}></div>
        <div class="controle"><label>Biografia</label><textarea rows="4" bind:value={$selectedBlock.props.bio}></textarea></div>
        <div class="controle"><label>URL da Imagem</label><input type="text" bind:value={$selectedBlock.props.imageUrl}></div>
      {/if}
      {#if $selectedBlock.type === 'LinkList'}
        {#each $selectedBlock.props.links as link, i}
          <div class="link-editor">
            <h4>Link {i + 1}</h4>
            <div class="controle"><label>Texto do Botão</label><input type="text" bind:value={link.text}></div>
            <div class="controle"><label>URL</label><input type="text" bind:value={link.url}></div>
          </div>
        {/each}
      {/if}
    </div>
  {:else}
    <div class="no-selection"><p>Clique em um bloco no canvas para editar suas propriedades.</p></div>
  {/if}
</div>
<style>
  .panel-container { background-color: #ffffff; height: 100%; border-left: 1px solid #e5e7eb; display: flex; flex-direction: column; }
  .panel-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
  .panel-header h3 { margin: 0; font-size: 1.2rem; }
  .close-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; }
  .controls-wrapper { padding: 1.5rem; overflow-y: auto; flex-grow: 1; }
  .no-selection { text-align: center; padding: 2rem; color: #6b7280; align-self: center; margin: auto; }
  .controle { margin-bottom: 1.5rem; }
  .controle label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
  .controle input, .controle textarea { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box; }
  .link-editor { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; }
  .link-editor h4 { margin: 0 0 1rem 0; font-size: 0.9rem; }
</style>