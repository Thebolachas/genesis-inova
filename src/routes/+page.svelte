<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { activeTemplate, resetBlocks, blocks, addBlock, selectedBlockId } from '$lib/stores';
  import LegoBrick from '$lib/components/visualizador/LegoBrick.svelte';
  import LegoMinifigure from '$lib/components/visualizador/LegoMinifigure.svelte';
  import LegoHead from '$lib/components/visualizador/LegoHead.svelte';
  import { derived, writable } from 'svelte/store';
  import { onMount, tick } from 'svelte'; // Importar 'tick' para um loop de animação
  import { fade, fly } from 'svelte/transition';

  type Step = 'scrolling' | 'selection' | 'tesseract';
  let step: Step = 'scrolling';

  const scrollProgress = writable(0);

  // Variável para controlar o tempo para animações contínuas
  let currentTime = 0;

  // Função para atualizar o tempo em cada frame
  let animationFrameId: number;
  const animate = () => {
    currentTime += 0.01; // Velocidade da animação
    // Você pode adicionar mais lógica aqui se precisar de algo complexo
    animationFrameId = requestAnimationFrame(animate);
  };

  onMount(() => {
    const unsubscribe = activeTemplate.subscribe(value => {
      if (value !== null) {
        step = 'tesseract';
      }
    });

    const handleScroll = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress.set(isNaN(progress) ? 0 : progress);

      if (progress > 0.75) {
        if (step === 'scrolling') step = 'selection';
      } else if (progress < 0.6) {
        if (step === 'selection') step = 'scrolling';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Iniciar a animação contínua
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
      cancelAnimationFrame(animationFrameId); // Parar a animação ao desmontar
    };
  });

  function selectTemplate(template: 'card' | 'landing') { 
    resetBlocks(); 
    activeTemplate.set(template); 
  }

  function backToSelection() { 
    step = 'selection'; 
    activeTemplate.set(null);
  }

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
    <div style="height: 200vh;"></div>

    <div class="scroll-canvas-wrapper" style="opacity: {Math.max(0, 1 - $scrollProgress * 1.5)};">
      <Canvas>
        <T.PerspectiveCamera makeDefault position={[0, 0, 15]} fov={30} />
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[10, 10, 5]} intensity={2} />

        <T.Group 
          position.x={-2 + Math.sin(currentTime * 0.5) * 0.5} 
          rotation.y={$scrollProgress * 4 + currentTime * 0.2} 
          position.y={2 - $scrollProgress * 10 + Math.cos(currentTime * 0.7) * 0.3}
        >
          <LegoBrick geometry={{width: 4, depth: 2, height: 'brick'}} color="#DA291C" scale={1.2} id="s1" />
        </T.Group>
        <T.Group 
          position.x={3 + Math.cos(currentTime * 0.4) * 0.6} 
          position.y={-2 + $scrollProgress * 10 + Math.sin(currentTime * 0.6) * 0.4} 
          rotation.y={$scrollProgress * -3 + currentTime * 0.3}
        >
          <LegoBrick geometry={{width: 3, depth: 2, height: 'brick'}} color="#0055BF" scale={1} id="s2" />
        </T.Group>
        <T.Group 
          position.y={-8 + $scrollProgress * 12 + Math.cos(currentTime * 0.8) * 0.5} 
          position.x={$scrollProgress * -5 + Math.sin(currentTime * 0.3) * 0.7} 
          rotation.x={$scrollProgress * 2 + currentTime * 0.15}
        >
          <LegoHead color="#FFD700" />
        </T.Group>
        <T.Group 
          position.z={-10 + $scrollProgress * 20 + Math.sin(currentTime * 0.5) * 0.8} 
          position.x={-5 + Math.cos(currentTime * 0.7) * 0.4} 
          rotation.z={$scrollProgress * 5 + currentTime * 0.25}
        >
          <LegoBrick geometry={{width: 3, depth: 2, height: 'brick'}} color="#f5c105" scale={0.8} id="s3" />
        </T.Group>
        <T.Group 
          position.y={5 - $scrollProgress * 15 + Math.sin(currentTime * 0.6) * 0.6} 
          position.x={5 + Math.cos(currentTime * 0.8) * 0.5} 
          rotation.x={$scrollProgress * -4 + currentTime * 0.2}
        >
          <LegoBrick geometry={{width: 2, depth: 2, height: 'plate'}} color="#FFD700" scale={1.1} id="s4" />
        </T.Group>
        <T.Group 
          position.y={-5 + $scrollProgress * 8 + Math.cos(currentTime * 0.4) * 0.7} 
          position.x={-6 + $scrollProgress * 12 + Math.sin(currentTime * 0.9) * 0.5} 
          rotation.y={$scrollProgress * 6 + currentTime * 0.35}
        >
          <LegoHead color="#FFD700" scale={0.7} />
        </T.Group>
        <T.Group 
          position.x={8 + Math.sin(currentTime * 0.7) * 0.4} 
          position.y={4 - $scrollProgress * 14 + Math.cos(currentTime * 0.5) * 0.6} 
          rotation.y={$scrollProgress * 2 + currentTime * 0.18} 
          rotation.z={$scrollProgress * -3 + currentTime * 0.22}
        >
          <LegoBrick geometry={{width: 6, depth: 2, height: 'plate'}} color="#0055BF" scale={0.9} id="s5" />
        </T.Group>
        <T.Group 
          position.z={5 - $scrollProgress * 15 + Math.cos(currentTime * 0.6) * 0.5} 
          position.x={1 + Math.sin(currentTime * 0.8) * 0.7} 
          rotation.x={$scrollProgress * 3 + currentTime * 0.28}
        >
          <LegoBrick geometry={{width: 2, depth: 2, height: 'brick'}} color="#DA291C" scale={0.6} id="s6" />
        </T.Group>

        {#if $scrollProgress > 0.5}
          <T.Group 
            position.y={-3 + $scrollProgress * 12 + Math.sin(currentTime * 0.9) * 0.2} 
            position.x={0 + Math.cos(currentTime * 0.7) * 0.2} 
            rotation.y={$scrollProgress * 6 + currentTime * 0.4}
          >
            <LegoMinifigure />
          </T.Group>
        {/if}
      </Canvas>
    </div>

    <div class="intro-text" style="opacity: {1 - $scrollProgress * 3}; transform: translateX(-50%) translateY({$scrollProgress * 20}px);">
      <h1>Genesis Builder</h1>
      <p>Role para iniciar a construção</p>
    </div>

    {#if step === 'selection'}
      <div class="template-selection" in:fly={{y: 50, duration: 800}}>
        <div class="selection-header" in:fly={{y: 30, duration: 600, delay: 200}}>
          <h2 class="selection-title">Escolha seu Projeto</h2>
          <p class="selection-subtitle">Selecione o tipo de construção que deseja criar</p>
        </div>
        
        <div class="template-cards">
          <button class="card card-business" in:fly={{x: -50, duration: 600, delay: 400}} on:click={() => selectTemplate('card')}>
            <div class="card-icon">👤</div>
            <h2>Cartão de Visitas</h2>
            <p>Crie um cartão profissional</p>
            <div class="card-glow"></div>
          </button>
          
          <button class="card card-landing" in:fly={{x: 50, duration: 600, delay: 500}} on:click={() => selectTemplate('landing')}>
            <div class="card-icon">🚀</div>
            <h2>Landing Page</h2>
            <p>Construa uma página completa</p>
            <div class="card-glow"></div>
          </button>
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
  :global(body) { 
    font-family: system-ui, sans-serif; 
    margin: 0; 
    background: #f1f1f1; 
  }

  .intro-container { 
    position: relative; 
    width: 100%; 
  }

  .scroll-canvas-wrapper { 
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100vh; 
    z-index: -1; 
    transition: opacity 0.5s; 
  }

  .intro-text { 
    position: fixed; 
    top: 40vh; 
    left: 45%; 
    transform: translateX(-50%); /* Base transform */
    text-align: center; 
    color: #0c0c0c; 
    z-index: 10; 
    pointer-events: none; 
    transition: opacity 0.3s; 
  }

  .intro-text h1 {
    font-size: 3.5rem;
    font-weight: bold;
    margin: 0 0 1rem 0;
  }

  .intro-text p {
    font-size: 1.2rem;
    margin: 0;
  }

  /* Seleção de templates melhorada */
  .template-selection { 
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100vh; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    z-index: 20; 
    background: linear-gradient(135deg, 
      rgba(102, 126, 234, 0.05) 0%,
      rgba(245, 87, 108, 0.05) 50%,
      rgba(79, 172, 254, 0.05) 100%
    );
    backdrop-filter: blur(5px);
  }

  .falling-lego {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .lego-piece {
    position: absolute;
    font-size: 3rem;
    animation: lego-fall 4s linear infinite;
  }

  .lego-1 {
    left: 20%;
    animation-delay: 0s;
    color: #DA291C;
    filter: drop-shadow(0 0 10px rgba(218, 41, 28, 0.5));
  }

  .lego-2 {
    left: 80%;
    animation-delay: -2s;
    color: #0055BF;
    filter: drop-shadow(0 0 10px rgba(0, 85, 191, 0.5));
  }

  .selection-header {
    text-align: center;
    margin-bottom: 3rem;
    animation: header-glow 3s ease-in-out infinite;
  }

  .selection-title {
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f5576c 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 1rem 0;
    text-shadow: 0 0 30px rgba(102, 126, 234, 0.3);
  }

  .selection-subtitle {
    font-size: 1.2rem;
    color: #4a5568;
    margin: 0;
    font-weight: 500;
  }

  .template-cards { 
    display: flex; 
    gap: 3rem; 
    perspective: 1000px;
  }

  .card { 
    position: relative;
    background: linear-gradient(145deg, 
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.7) 100%
    );
    padding: 3rem 2rem; 
    border: 2px solid transparent;
    border-radius: 2rem; 
    cursor: pointer; 
    width: 320px;
    height: 280px;
    text-align: center; 
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(20px);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
    transform-style: preserve-3d;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(102, 126, 234, 0.1) 0%,
      rgba(245, 87, 108, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 2rem;
  }

  .card:hover::before {
    opacity: 1;
  }

  .card:hover { 
    transform: translateY(-20px) rotateX(5deg) rotateY(5deg) scale(1.05);
    border-color: rgba(102, 126, 234, 0.3);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      0 0 40px rgba(102, 126, 234, 0.3);
  }

  .card-business:hover {
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.2),
      0 0 40px rgba(245, 87, 108, 0.4);
  }

  .card-landing:hover {
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.2),
      0 0 40px rgba(79, 172, 254, 0.4);
  }

  .card-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: icon-bounce 2s ease-in-out infinite;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  .card h2 { 
    margin: 0 0 1rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #2d3748;
    position: relative;
    z-index: 2;
  }

  .card p {
    margin: 0;
    color: #718096;
    font-size: 1.1rem;
    font-weight: 500;
    position: relative;
    z-index: 2;
  }

  .card-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
    animation: glow-pulse 3s ease-in-out infinite;
  }

  .card:hover .card-glow {
    opacity: 1;
  }

  .card-business .card-glow {
    background: radial-gradient(circle, rgba(245, 87, 108, 0.2) 0%, transparent 70%);
  }

  .card-landing .card-glow {
    background: radial-gradient(circle, rgba(79, 172, 254, 0.2) 0%, transparent 70%);
  }

  /* Estilos originais mantidos */
  .tesseract-container { 
    position: relative; 
    height: 100vh; 
    width: 100vw; 
  }

  .palette { 
    position: absolute; 
    top: 1.5rem; 
    left: 1.5rem; 
    z-index: 10; 
    background-color: rgba(31, 41, 55, 0.9); 
    color: #f9fafb; 
    padding: 1.5rem; 
    border-radius: 0.75rem; 
    backdrop-filter: blur(10px); 
    border: 1px solid rgba(255, 255, 255, 0.1); 
    box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
  }

  .back-button { 
    background: none; 
    border: none; 
    color: #9ca3af; 
    font-size: 0.9rem; 
    cursor: pointer; 
    padding: 0 0 1rem 0; 
    width: 100%; 
    text-align: left; 
    border-bottom: 1px solid #4b5563; 
    margin-bottom: 1rem; 
  }

  .palette-title { 
    margin: 0 0 1rem 0; 
    padding-bottom: 1rem; 
    border-bottom: 1px solid #4b5563; 
  }

  .palette-buttons { 
    display: flex; 
    flex-direction: column; 
    gap: 1rem; 
  }

  .palette-buttons button { 
    background-color: #4b5563; 
    color: #f9fafb; 
    border: none; 
    padding: 0.75rem 1rem; 
    border-radius: 0.375rem; 
    text-align: left; 
    font-size: 1rem; 
    cursor: pointer; 
    transition: background-color 0.2s; 
  }

  .palette-buttons button:hover:not(:disabled) { 
    background-color: #6b7280; 
  }

  .palette-buttons button:disabled { 
    background-color: #374151; 
    color: #9ca3af; 
    cursor: not-allowed; 
  }

  .wormhole-button { 
    margin-top: 1.5rem; 
    border-top: 1px solid #4b5563; 
    padding-top: 1rem; 
    background: linear-gradient(to right, #4f46e5, #7c3aed); 
    color: white; 
    text-decoration: none; 
    text-align: center; 
    font-weight: bold; 
    display: block; 
    padding: 0.75rem 1rem; 
    border-radius: 0.375rem; 
    transition: all 0.2s ease-in-out; 
  }

  /* Animações */
  @keyframes header-glow {
    0%, 100% {
      filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.3));
    }
    50% {
      filter: drop-shadow(0 0 20px rgba(245, 87, 108, 0.4));
    }
  }

  @keyframes icon-bounce {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes glow-pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  /* Responsividade */
  @media (max-width: 768px) {
    .intro-text h1 {
      font-size: 2.5rem;
    }
    
    .intro-text p {
      font-size: 1.1rem;
    }

    .selection-title {
      font-size: 2rem;
    }

    .template-cards {
      flex-direction: column;
      gap: 2rem;
    }

    .card {
      width: 280px;
      height: 240px;
      padding: 2rem 1.5rem;
    }

    .card-icon {
      font-size: 3rem;
    }

    .card h2 {
      font-size: 1.5rem;
    }

    .selection-header {
      margin-bottom: 2rem;
    }
  }
</style>