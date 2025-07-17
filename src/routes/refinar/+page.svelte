<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import PropertiesPanel from '$lib/components/PropertiesPanel.svelte';
</script>

<div class="refinement-layout">
  <main class="canvas-area">
    <Canvas />
  </main>
  <aside class="properties-panel">
    <PropertiesPanel />
  </aside>
</div>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; }
  .refinement-layout { display: grid; grid-template-columns: 1fr 350px; height: 100vh; width: 100vw; overflow: hidden; }
  .canvas-area { overflow-y: auto; background-color: #e5e7eb; }
  .properties-panel { overflow-y: auto; }
</style>