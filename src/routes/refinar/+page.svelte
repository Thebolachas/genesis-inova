<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import PropertiesPanel from '$lib/components/PropertiesPanel.svelte';
  import ActionBar from '$lib/components/ActionBar.svelte';
  // 1. IMPORTAMOS O NOSSO NOVO COMPONENTE
  import TimeMaestro from '$lib/components/TimeMaestro.svelte'; 
  import { globalStyles } from '$lib/stores';

  const fontFamilies = {
    Roboto: "'Roboto', sans-serif",
    Montserrat: "'Montserrat', sans-serif",
    Lora: "'Lora', serif",
  }

  // A lógica onMount para carregar do sessionStorage já não é necessária aqui,
  // pois a nossa store persistente já trata disso automaticamente.
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

  <TimeMaestro />
</div>

<style>
  .page-wrapper { 
    display: flex;
    flex-direction: column; 
    /* 3. AJUSTAMOS A ALTURA PARA DEIXAR ESPAÇO PARA O MAESTRO */
    height: 100vh; 
    width: 100vw; 
    overflow: hidden; 
    box-sizing: border-box;
    transition: font-family 0.3s ease;
  }
  .refinement-layout { 
    display: grid; 
    grid-template-columns: 1fr 350px; 
    flex-grow: 1; 
    overflow: hidden;
    /* A altura é calculada para preencher o espaço restante */
    height: calc(100% - 60px); /* 60px é a altura da ActionBar */
  }
  .canvas-area, .properties-panel { 
    overflow-y: auto;
    height: 100%;
    /* Adiciona padding na parte inferior para garantir que o Maestro não cubra o conteúdo */
    padding-bottom: 70px; /* Um pouco mais que a altura do Maestro */
    box-sizing: border-box;
  }
</style>