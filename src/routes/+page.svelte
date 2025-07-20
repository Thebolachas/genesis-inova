<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';

  // --- ALTERAÇÃO: 'removeBlock' foi removido da importação ---
  import { activeTemplate, resetBlocks, blocks, addBlock, selectedBlockId } from '$lib/stores';
  import LegoBrick from '$lib/components/visualizador/LegoBrick.svelte';
  import LegoMinifigure from '$lib/components/visualizador/LegoMinifigure.svelte';
  import LegoHead from '$lib/components/visualizador/LegoHead.svelte';
  import { derived, writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  // --- ESTADO DA JORNADA DO USUÁRIO ---
  type Step = 'scrolling' | 'selection' | 'tesseract';
  let step: Step = 'scrolling';

  // --- NOSSO MOTOR DE SCROLL MANUAL E ROBUSTO ---
  const scrollProgress = writable(0);

  onMount(() => {
    const handleScroll = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress.set(isNaN(progress) ? 0 : progress); // Previne NaN se a altura for 0

      // LÓGICA DE TRANSIÇÃO DE IDA E VOLTA
      if (progress > 0.98) {
        if (step === 'scrolling') step = 'selection';
      } else {
        if (step === 'selection') step = 'scrolling';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  // --- LÓGICA DE TRANSIÇÃO E DADOS (O restante que já conhecemos) ---
  activeTemplate.subscribe(value => {
    if (value !== null) step = 'tesseract';
  });

  function selectTemplate(template: 'card' | 'landing') { resetBlocks(); activeTemplate.set(template); }
  function backToSelection() { step = 'selection'; activeTemplate.set(null); }

  const selectedBlock = derived([blocks, selectedBlockId], ([$blocks, $selectedBlockId]) => $blocks.find(b => b.id === $selectedBlockId));
  $: showHead = $blocks.some(b => b.type === 'Header');
  $: showTorso = $blocks.some(b => b.type === 'ProfileCard');
  $: showLegs = $blocks.some(b => b.type === 'LinkList');

  const colorMap = { Header: 'royalblue', ProfileCard: 'crimson', LinkList: 'mediumseagreen', RichText: 'darkorange', ImageBlock: 'slateblue' };
  $: processedBlocks = (() => {
    if ($activeTemplate !== 'landing') return [];
    let cumulativeHeight = 0;
    return $blocks.map((block, i) => {
      const isBrick = block.props.geometry.height === 'brick';
      const blockHeight = isBrick ? 1.2 : 0.4;
      const brickColor = i === 0 ? '#FFD700' : colorMap[block.type];
      const scale = 1.2 - (i * 0.1);
      const scaledBlockHeight = blockHeight * scale;
      const yPos = cumulativeHeight + scaledBlockHeight / 2;
      cumulativeHeight += scaledBlockHeight;
      return { ...block, yPos, scale, color: brickColor, id: block.id };
    });
  })();
  $: allBlocksAdded = $blocks.length >= 3;
</script>

{#if step === 'scrolling' || step === 'selection'}
  <div class="intro-container">
    <div style="height: 200vh;" />

    <div class="scroll-canvas-wrapper" style="opacity: {step === 'scrolling' ? 1 : 0};">
      <Canvas>
        <T.PerspectiveCamera makeDefault position={[0, 0, 15]} fov={30} />
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[10, 10, 5]} intensity={2} />

        <T.Group position.x={-2} rotation.y={$scrollProgress * 4} position.y={2 - $scrollProgress * 10}>
          <LegoBrick geometry={{width: 4, depth: 2, height: 'brick'}} color="#DA291C" scale={1.2} id="s1" />
        </T.Group>
        <T.Group position.x={3} position.y={-2 + $scrollProgress * 10} rotation.y={$scrollProgress * -3}>
          <LegoBrick geometry={{width: 3, depth: 2, height: 'brick'}} color="#0055BF" scale={1} id="s2" />
        </T.Group>

        <T.Group position.y={-8 + $scrollProgress * 12} position.x={$scrollProgress * -5} rotation.x={$scrollProgress * 2}>
          <LegoHead color="#FFD700" />
        </T.Group>

        <T.Group position.z={-10 + $scrollProgress * 20} position.x={-5} rotation.z={$scrollProgress * 5}>
          <LegoBrick geometry={{width: 3, depth: 2, height: 'brick'}} color="#f5c105" scale={0.8} id="s3" />
        </T.Group>
        <T.Group position.y={5 - $scrollProgress * 15} position.x={5} rotation.x={$scrollProgress * -4}>
          <LegoBrick geometry={{width: 2, depth: 2, height: 'plate'}} color="#FFD700" scale={1.1} id="s4" />
        </T.Group>

        <T.Group position.y={-5 + $scrollProgress * 8} position.x={-6 + $scrollProgress * 12} rotation.y={$scrollProgress * 6}>
          <LegoHead color="#FFD700" scale={0.7} />
        </T.Group>

        <T.Group position.x={8} position.y={4 - $scrollProgress * 14} rotation.y={$scrollProgress * 2} rotation.z={$scrollProgress * -3}>
          <LegoBrick geometry={{width: 6, depth: 2, height: 'plate'}} color="#0055BF" scale={0.9} id="s5" />
        </T.Group>

        <T.Group position.z={5 - $scrollProgress * 15} position.x={1} rotation.x={$scrollProgress * 3}>
          <LegoBrick geometry={{width: 2, depth: 2, height: 'brick'}} color="#DA291C" scale={0.6} id="s6" />
        </T.Group>

        {#if $scrollProgress > 0.5}
          <T.Group position.y={-3 + $scrollProgress * 12} position.x={0} rotation.y={$scrollProgress * 6}>
            <LegoMinifigure />
          </T.Group>
        {/if}

      </Canvas>
    </div>

    <div class="intro-text" style="opacity: {1 - $scrollProgress * 3}">
      <h1>Genesis Builder</h1>
      <p>Role para iniciar a construção</p>
    </div>

    {#if step === 'selection'}
      <div class="template-selection" in:fly={{y: 50, duration: 500}}>
        <div class="template-cards">
          <button class="card" on:click={() => selectTemplate('card')}><h2>Cartão de Visitas</h2></button>
          <button class="card" on:click={() => selectTemplate('landing')}><h2>Landing Page</h2></button>
        </div>
      </div>
    {/if}
  </div>

{:else if step === 'tesseract'}
  <div class="tesseract-container" in:fade>
    <aside class="palette">
      <button class="back-button" on:click={backToSelection}>← Mudar Projeto</button>
      
      <h2 class="palette-title">Paleta de Blocos</h2>
      <div class="palette-buttons">
        {#if $activeTemplate === 'card'}
          <button on:click={() => addBlock('Header')} disabled={$blocks.some(b => b.type === 'Header')}>Adicionar Cabeça</button>
          <button on:click={() => addBlock('ProfileCard')} disabled={$blocks.some(b => b.type === 'ProfileCard')}>Adicionar Tronco</button>
          <button on:click={() => addBlock('LinkList')} disabled={$blocks.some(b => b.type === 'LinkList')}>Adicionar Pernas</button>
        {:else if $activeTemplate === 'landing'}
          <button on:click={() => addBlock('Header')}>Adicionar Cabeçalho</button>
          <button on:click={() => addBlock('ImageBlock')}>Adicionar Imagem</button>
          <button on:click={() => addBlock('RichText')}>Adicionar Texto</button>
          <button on:click={() => addBlock('LinkList')}>Adicionar Links</button>
        {/if}
      </div>

      {#if ($activeTemplate === 'card' && allBlocksAdded) || ($activeTemplate === 'landing' && $blocks.length > 0)}
        <a href="/refinar" class="wormhole-button">Explorar Criação</a>
      {/if}
    </aside>

    <Canvas>
      <T.Color attach="background" args={['#f0f0f0']} />
      <T.AmbientLight intensity={0.6} />
      <T.DirectionalLight position={[10, 10, 5]} intensity={2} />
      
      {#if $activeTemplate === 'card'}
        <T.PerspectiveCamera makeDefault position={[0, 4, 8]}><OrbitControls /></T.PerspectiveCamera>
        <LegoMinifigure {showHead} {showTorso} {showLegs} />
      {:else if $activeTemplate === 'landing'}
        <T.PerspectiveCamera makeDefault position={[10, 12, 12]}><OrbitControls /></T.PerspectiveCamera>
        {#each processedBlocks as pBlock (pBlock.id)}
          <T.Group on:pointerdown={(e) => { e.stopPropagation(); selectedBlockId.set(pBlock.id); }}>
            <LegoBrick id={pBlock.id} geometry={pBlock.props.geometry} positionY={pBlock.yPos} color={pBlock.color} scale={pBlock.scale} />
          </T.Group>
        {/each}
      {/if}
    </Canvas>
  </div>
{/if}

<style>
  :global(body) { font-family: system-ui, sans-serif; margin: 0; background: #f1f1f1; }
  .intro-container { position: relative; width: 100%; }
  .scroll-canvas-wrapper { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: -1; transition: opacity 0.5s; }
  .intro-text { position: fixed; top: 40vh; left: 45%; transform: translateX(-50%); text-align: center; color: #0c0c0c; z-index: 10; pointer-events: none; transition: opacity 0.3s; }
  .template-selection { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 20; }
  .template-cards { display: flex; gap: 2rem; }
  .card { background: white; padding: 2.5rem; border: 1px solid #e5e7eb; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); cursor: pointer; width: 280px; text-align: center; transition: all 0.2s ease-in-out; }
  .card:hover { transform: translateY(-10px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
  .card h2 { margin: 0 0 0.5rem 0; }
  .card span { color: #8ca2ce; }
  .tesseract-container { position: relative; height: 100vh; width: 100vw; }
  .palette { position: absolute; top: 1.5rem; left: 1.5rem; z-index: 10; background-color: rgba(31, 41, 55, 0.9); color: #f9fafb; padding: 1.5rem; border-radius: 0.75rem; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
  .back-button { background: none; border: none; color: #9ca3af; font-size: 0.9rem; cursor: pointer; padding: 0 0 1rem 0; width: 100%; text-align: left; border-bottom: 1px solid #4b5563; margin-bottom: 1rem; }
  .selection-controls { background-color: rgba(255,255,255,0.1); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; text-align: center; }
  .remove-button { background-color: #ef4444; width: 100%; color: white; border: none; padding: 0.75rem; border-radius: 0.375rem; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
  .palette-title { margin: 0 0 1rem 0; padding-bottom: 1rem; border-bottom: 1px solid #4b5563; }
  .palette-buttons { display: flex; flex-direction: column; gap: 1rem; }
  .palette-buttons button { background-color: #4b5563; color: #f9fafb; border: none; padding: 0.75rem 1rem; border-radius: 0.375rem; text-align: left; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
  .palette-buttons button:hover:not(:disabled) { background-color: #6b7280; }
  .palette-buttons button:disabled { background-color: #374151; color: #9ca3af; cursor: not-allowed; }
  .wormhole-button { margin-top: 1.5rem; border-top: 1px solid #4b5563; padding-top: 1rem; background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; text-decoration: none; text-align: center; font-weight: bold; display: block; padding: 0.75rem 1rem; border-radius: 0.375rem; transition: all 0.2s ease-in-out; }
</style>
