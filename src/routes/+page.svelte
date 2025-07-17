<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import PropertiesPanel from '$lib/components/PropertiesPanel.svelte'; // 1. Importe o novo painel
  import { addBlock } from '$lib/stores';
</script>

<div class="playground-layout">
  <aside class="palette">
    <h2 class="palette-title">Paleta de Blocos</h2>
    <div class="palette-buttons">
      <button on:click={() => addBlock('Header')}>Adicionar Cabeçalho</button>
      <button on:click={() => addBlock('ProfileCard')}>Adicionar Cartão de Perfil</button>
      <button on:click={() => addBlock('LinkList')}>Adicionar Lista de Links</button>
    </div>
  </aside>

  <main class="canvas-area">
    <Canvas />
  </main>

  <aside class="properties-panel">
    <PropertiesPanel />
  </aside>
</div>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; }

  /* Layout de 3 colunas */
  .playground-layout {
    display: grid;
    grid-template-columns: 280px 1fr 350px; /* Paleta | Canvas | Propriedades */
    height: 100vh;
    width: 100vw;
    overflow: hidden; /* Evita scroll na página inteira */
  }

  .palette {
    background-color: #1f2937; color: #f9fafb; padding: 1.5rem;
    /* ... outros estilos da paleta ... */
  }
  .palette-title { margin: 0 0 2rem 0; border-bottom: 1px solid #4b5563; padding-bottom: 1rem; }
  .palette-buttons { display: flex; flex-direction: column; gap: 1rem; }
  .palette-buttons button { background-color: #374151; color: #f9fafb; border: none; padding: 0.75rem 1rem; border-radius: 0.375rem; text-align: left; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
  .palette-buttons button:hover { background-color: #4b5563; }

  .canvas-area { overflow-y: auto; }
  .properties-panel { overflow-y: auto; }
</style>