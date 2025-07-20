<script lang="ts">
  import { blocks, selectedBlockId, globalStyles, removeBlock, addImageFile, updateBlockProps } from '$lib/stores';
  import { derived } from 'svelte/store';

  const selectedBlock = derived(
    [blocks, selectedBlockId],
    ([$blocks, $selectedBlockId]) => $blocks.find(b => b.id === $selectedBlockId)
  );

  const selectedBlockIndex = derived(
    [blocks, selectedBlockId],
    ([$blocks, $selectedBlockId]) => $blocks.findIndex(b => b.id === $selectedBlockId)
  );

  function addLink() {
    if (!$selectedBlock) return;
    const newLinks = [...$selectedBlock.props.links, { text: 'Novo Link', url: '#' }];
    updateBlockProps($selectedBlock.id, { links: newLinks });
  }

  function removeLink(index: number) {
    if (!$selectedBlock) return;
    const newLinks = [...$selectedBlock.props.links];
    newLinks.splice(index, 1);
    updateBlockProps($selectedBlock.id, { links: newLinks });
  }

  /**
   * SUGESTÃO 2: NOVA FUNÇÃO PARA UPLOAD DE IMAGEM
   * - Não usa mais Base64.
   * - Adiciona o ficheiro à 'imageFiles' store.
   * - Cria uma URL temporária para a pré-visualização.
   * - Atualiza a prop 'imageUrl' do bloco com essa URL temporária.
   */
  function handleImageUpload(event: Event, blockId: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      addImageFile(blockId, file);
      const tempUrl = URL.createObjectURL(file);
      updateBlockProps(blockId, { imageUrl: tempUrl });
    }
  }
</script>

<div class="panel-container">
  {#if $selectedBlock && $selectedBlockIndex !== -1}
    <div class="panel-header">
      <h3>Editando: {$selectedBlock.type}</h3>
      <button class="close-button" on:click={() => selectedBlockId.set(null)} title="Fechar painel">×</button>
    </div>
    <div class="controls-wrapper">
      {#if $selectedBlock.type === 'Header'}
        <div class="controle"><label>Texto do Título</label><input type="text" bind:value={$blocks[$selectedBlockIndex].props.titulo}></div>
        <div class="controle"><label>Cor de Fundo</label><input type="color" bind:value={$blocks[$selectedBlockIndex].props.corDeFundo}></div>
        <div class="controle"><label>Cor do Texto</label><input type="color" bind:value={$blocks[$selectedBlockIndex].props.corDoTexto}></div>
        <div class="controle"><label>Tamanho da Fonte ({$selectedBlock.props.tamanhoDaFonte.toFixed(1)}rem)</label><input type="range" min="1" max="6" step="0.1" bind:value={$blocks[$selectedBlockIndex].props.tamanhoDaFonte}></div>
      {/if}

      {#if $selectedBlock.type === 'ProfileCard'}
        <div class="controle">
          <label for="card-imagem">Imagem de Perfil</label>
          <input id="card-imagem" type="file" accept="image/*" on:change={(e) => handleImageUpload(e, $selectedBlock!.id)}>
        </div>
        <div class="controle"><label>Nome</label><input type="text" bind:value={$blocks[$selectedBlockIndex].props.nome}></div>
        <div class="controle"><label>Biografia</label><textarea rows="4" bind:value={$blocks[$selectedBlockIndex].props.bio}></textarea></div>
        <div class="controle">
          <label>Estilo do Cartão</label>
          <div class="variant-selector">
            <button class:active={$blocks[$selectedBlockIndex].props.styleVariant === 'top'} on:click={() => ($blocks[$selectedBlockIndex].props.styleVariant = 'top')}>Topo</button>
            <button class:active={$blocks[$selectedBlockIndex].props.styleVariant === 'left'} on:click={() => ($blocks[$selectedBlockIndex].props.styleVariant = 'left')}>Esquerda</button>
          </div>
        </div>
      {/if}

      {#if $selectedBlock.type === 'LinkList'}
        {#each $blocks[$selectedBlockIndex].props.links as link, i (i)}
          <div class="link-editor">
            <div class="link-editor-header"><h4>Link {i + 1}</h4><button class="remove-link-button" on:click={() => removeLink(i)}>×</button></div>
            <div class="controle"><label>Texto do Botão</label><input type="text" bind:value={link.text}></div>
            <div class="controle"><label>URL</label><input type="text" bind:value={link.url}></div>
          </div>
        {/each}
        <button class="add-link-button" on:click={addLink}>+ Adicionar Novo Link</button>
      {/if}

      {#if $selectedBlock.type === 'RichText'}
        <div class="controle"><label>Título da Seção</label><input type="text" bind:value={$blocks[$selectedBlockIndex].props.titulo}></div>
        <div class="controle"><label>Parágrafo</label><textarea rows="8" bind:value={$blocks[$selectedBlockIndex].props.texto}></textarea></div>
      {/if}

      {#if $selectedBlock.type === 'ImageBlock'}
        <div class="controle">
          <label for="image-block-imagem">Imagem de Destaque</label>
          <input id="image-block-imagem" type="file" accept="image/*" on:change={(e) => handleImageUpload(e, $selectedBlock!.id)}>
        </div>
        <div class="controle"><label>Legenda</label><input type="text" bind:value={$blocks[$selectedBlockIndex].props.legenda}></div>
      {/if}

      <div class="danger-zone">
        <button class="remove-block-button" on:click={() => removeBlock($selectedBlock!.id)}>
          Remover Bloco
        </button>
      </div>
    </div>
  {:else}
    <div class="no-selection">
       <div class="global-styles">
        <h3>Estilos Globais</h3>
        <div class="controle">
          <label for="font-select">Fonte Principal</label>
          <select id="font-select" bind:value={$globalStyles.fontFamily}>
            <option value="Roboto">Roboto (Moderno)</option>
            <option value="Montserrat">Montserrat (Elegante)</option>
            <option value="Lora">Lora (Clássico)</option>
          </select>
        </div>
      </div>
      <hr>
      <p>← Clique em um bloco no canvas para editar suas propriedades.</p>
    </div>
  {/if}
</div>
<style>
  /* Todos os estilos anteriores... */
  .panel-container { background-color: #ffffff; height: 100%; border-left: 1px solid #e5e7eb; display: flex; flex-direction: column; }
  .panel-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
  .close-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; }
  .controls-wrapper { padding: 1.5rem; overflow-y: auto; flex-grow: 1; }
  .no-selection { text-align: center; padding: 2rem; color: #6b7280; display: flex; flex-direction: column; justify-content: center; align-items: center; margin: auto; }
  .controle { margin-bottom: 1rem; width: 100%; text-align: left; }
  .controle label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
  .controle input, .controle textarea, .controle select { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box; }
  .link-editor { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; }
  .link-editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .link-editor-header h4 { margin: 0; font-size: 0.9rem; }
  .remove-link-button { background: #fee2e2; color: #ef4444; border: none; border-radius: 50%; width: 24px; height: 24px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .add-link-button { width: 100%; padding: 0.75rem; background-color: #e0e7ff; color: #4338ca; border: 1px dashed #a5b4fc; border-radius: 0.375rem; font-weight: bold; cursor: pointer; text-align: center; }
  .global-styles { width: 100%; text-align: left; padding: 0 1rem; }
  .global-styles h3 { margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; }
  hr { width: 100%; border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
  .variant-selector { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #d1d5db; border-radius: 0.375rem; overflow: hidden; }
  .variant-selector button { padding: 0.5rem; background-color: #ffffff; border: none; cursor: pointer; color: #4b5563; transition: background-color 0.2s; }
  .variant-selector button:first-child { border-right: 1px solid #d1d5db; }
  .variant-selector button.active { background-color: #e0e7ff; color: #4338ca; font-weight: bold; }
  input[type="file"] { border: 1px solid #d1d5db; padding: 0.4rem; }
  
  /* --- NOVO ESTILO PARA O BOTÃO DE REMOVER BLOCO --- */
  .danger-zone {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
  .remove-block-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    border-radius: 0.375rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }
  .remove-block-button:hover {
    background-color: #fca5a5;
    color: #7f1d1d;
  }
</style>