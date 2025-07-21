<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import PropertiesPanel from '$lib/components/PropertiesPanel.svelte';
  import ActionBar from '$lib/components/ActionBar.svelte';
  import TimeMaestro from '$lib/components/TimeMaestro.svelte';
  import TextEditorPopover from '$lib/components/TextEditorPopover.svelte';
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Montserrat:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="page-wrapper">
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
    
    <TextEditorPopover />
  </div>

  <TimeMaestro />
</div>

<style>
.page-wrapper { display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; box-sizing: border-box; }
.refinement-layout { position: relative; display: grid; grid-template-columns: 1fr 350px; flex-grow: 1; overflow: hidden; height: calc(100% - 60px); }
.canvas-area, .properties-panel { overflow-y: auto; height: 100%; padding-bottom: 70px; box-sizing: border-box; }
</style>