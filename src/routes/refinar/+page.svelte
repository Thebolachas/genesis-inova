<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import PropertiesPanel from '$lib/components/PropertiesPanel.svelte';
  import ActionBar from '$lib/components/ActionBar.svelte';
  import { blocks, globalStyles } from '$lib/stores'; // 1. Importamos a store de estilos globais
  import { onMount } from 'svelte';

  // 2. Criamos um mapa para os nomes CSS das fontes
  const fontFamilies = {
    Roboto: "'Roboto', sans-serif",
    Montserrat: "'Montserrat', sans-serif",
    Lora: "'Lora', serif",
  }

  onMount(() => {
    const savedBlocks = sessionStorage.getItem('blocks');
    if (savedBlocks) {
      blocks.set(JSON.parse(savedBlocks));
    }
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=Montserrat:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="page-wrapper" style="font-family: {fontFamilies[$globalStyles.fontFamily]};">
  <header>
    <ActionBar />
  </header>

  <div class="refinement-layout">
    <main class="canvas-area">
      <Canvas />
    </main>

    <aside class="properties-panel">
      <PropertiesPanel />
    </aside>
  </div>
</div>

<style>
  .page-wrapper { 
    display: flex; 
    flex-direction: column; 
    height: 100vh; 
    width: 100vw; 
    overflow: hidden; 
    /* Adicionamos uma transição suave para a mudança de fonte */
    transition: font-family 0.3s ease;
  }
  .refinement-layout { 
    display: grid; 
    grid-template-columns: 1fr 350px; 
    flex-grow: 1; 
    overflow: hidden; 
  }
  .canvas-area, .properties-panel { 
    overflow-y: auto; 
  }
</style>