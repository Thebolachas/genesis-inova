<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { T } from '@threlte/core';
  import LegoBrick from '$lib/components/visualizador/LegoBrick.svelte';
  import { Grid, OrbitControls } from '@threlte/extras';
  import { blocks, addBlock } from '$lib/stores';

  const colorMap = {
    Header: 'crimson',
    ProfileCard: 'royalblue',
    LinkList: 'mediumseagreen'
  };
</script>

<div class="tesseract-container">
  <aside class="palette">
    <h2 class="palette-title">Paleta de Blocos</h2>
    <div class="palette-buttons">
      <button on:click={() => addBlock('Header')}>Adicionar Cabeçalho</button>
      <button on:click={() => addBlock('ProfileCard')}>Adicionar Cartão de Perfil</button>
      <button on:click={() => addBlock('LinkList')}>Adicionar Lista de Links</button>
    </div>
    <a href="/refinar" class="wormhole-button">Explorar Criação </a>
  </aside>

  <Canvas>
    <T.AmbientLight intensity={0.5} />
    <T.DirectionalLight position={[10, 10, 5]} intensity={1} castShadow />
    <T.PerspectiveCamera makeDefault position={[5, 5, 8]}>
      <OrbitControls />
    </T.PerspectiveCamera>
    {#each $blocks as block, i (block.id)}
      <LegoBrick color={colorMap[block.type]} positionY={i * 0.6 + 0.25} />
    {/each}
    <Grid infiniteGrid />
  </Canvas>
</div>

<style>
  .tesseract-container { position: relative; height: 100vh; width: 100vw; background-color: #111827; }
  .palette { position: absolute; top: 0; left: 0; z-index: 10; background-color: rgba(31, 41, 55, 0.9); color: #f9fafb; padding: 1.5rem; margin: 1rem; border-radius: 0.75rem; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
  .palette-title { margin: 0 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 1px solid #4b5563; }
  .palette-buttons { display: flex; flex-direction: column; gap: 1rem; }
  .palette-buttons button { background-color: #4b5563; color: #f9fafb; border: none; padding: 0.75rem 1rem; border-radius: 0.375rem; text-align: left; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
  .palette-buttons button:hover { background-color: #6b7280; }
  .wormhole-button { margin-top: 2rem; border-top: 1px solid #4b5563; padding-top: 1rem; background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; text-decoration: none; text-align: center; font-weight: bold; display: block; padding: 0.75rem 1rem; border-radius: 0.375rem; transition: all 0.2s ease-in-out; }
  .wormhole-button:hover { opacity: 0.9; box-shadow: 0 0 15px rgba(124, 58, 237, 0.6); }
</style>