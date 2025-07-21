<script lang="ts">
  import { updateBlockProps, selectedBlockId } from '$lib/stores';
  import { derived } from 'svelte/store';

  export let id: string;
  export let links: { text: string; url: string }[] = [];

  // Variável para controlar qual link está em modo de edição.
  let editingIndex: number | null = null;

  // Store derivada para saber se este bloco está selecionado.
  const isSelected = derived(selectedBlockId, ($selectedBlockId) => $selectedBlockId === id);

  // Funções para manipular os links
  function addLink() {
    const newLinks = [...links, { text: 'Novo Link', url: '#' }];
    updateBlockProps(id, { links: newLinks });
    // Entra em modo de edição no link recém-criado
    editingIndex = newLinks.length - 1;
  }

  function removeLink(indexToRemove: number) {
    const newLinks = links.filter((_, i) => i !== indexToRemove);
    updateBlockProps(id, { links: newLinks });
  }

  function handleUpdate(indexToUpdate: number, field: 'text' | 'url', value: string) {
    const newLinks = links.map((link, i) => {
      if (i === indexToUpdate) {
        return { ...link, [field]: value };
      }
      return link;
    });
    updateBlockProps(id, { links: newLinks });
  }
</script>

{#if links.length > 0 || $isSelected}
  <div class="links-container">
    {#each links as link, i (i)}
      <div class="link-wrapper" on:dblclick={() => editingIndex = i}>
        {#if editingIndex === i}
          <div class="link-editor">
            <input 
              type="text" 
              value={link.text} 
              on:input={(e) => handleUpdate(i, 'text', e.currentTarget.value)}
              placeholder="Texto do botão"
              class="editor-input"
            />
            <input 
              type="text" 
              value={link.url} 
              on:input={(e) => handleUpdate(i, 'url', e.currentTarget.value)}
              placeholder="https://exemplo.com"
              class="editor-input url-input"
            />
            <button class="done-button" on:click={() => editingIndex = null}>✓</button>
          </div>
        {:else}
          <div class="link-button">
            {link.text || '[Link sem texto]'}
            <button class="remove-button" title="Remover Link" on:click={() => removeLink(i)}>×</button>
          </div>
        {/if}
      </div>
    {/each}

    {#if $isSelected}
      <button class="add-button" on:click={addLink}>
        + Adicionar Link
      </button>
    {/if}
  </div>
{/if}

<style>
  .links-container {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .link-wrapper {
    position: relative;
  }

  .link-button {
    display: block;
    background-color: #3730a3;
    color: #ffffff;
    text-decoration: none;
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.2s, transform 0.2s;
    cursor: text; /* Indica que pode ser editado */
  }

  .link-button:hover {
    background-color: #312e81;
    transform: translateY(-2px);
  }

  /* Botão de remover que aparece no hover do botão principal */
  .remove-button {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.2s ease-out;
  }

  .link-wrapper:hover .remove-button {
    opacity: 1;
    transform: scale(1);
  }

  /* Estilos para o modo de edição */
  .link-editor {
    display: flex;
    gap: 0.5rem;
    background-color: #eef2ff;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #c7d2fe;
  }
  .editor-input {
    flex-grow: 1;
    border: 1px solid #a5b4fc;
    border-radius: 0.25rem;
    padding: 0.5rem;
  }
  .url-input {
    flex-grow: 2;
  }
  .done-button {
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 0.25rem;
    font-weight: bold;
    cursor: pointer;
  }

  /* Botão de adicionar contextual */
  .add-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #e0e7ff;
    color: #4338ca;
    border: 2px dashed #a5b4fc;
    border-radius: 0.5rem;
    font-weight: bold;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
  }
  .add-button:hover {
    background-color: #c7d2fe;
    border-color: #818cf8;
  }
</style>