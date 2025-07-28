<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  // ✅ NOVO: Importar a store 'hasDownloaded' que criamos
  import { activeTemplate, resetBlocks, blocks, addBlock, selectedBlockId, hasDownloaded } from '$lib/stores';
  import LegoBrick from '$lib/components/visualizador/LegoBrick.svelte';
  import LegoMinifigure from '$lib/components/visualizador/LegoMinifigure.svelte';
  import LegoHead from '$lib/components/visualizador/LegoHead.svelte';
  import { derived, writable } from 'svelte/store';
  import { onMount, tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  type Step = 'scrolling' | 'selection' | 'tesseract';
  let step: Step = 'scrolling';

  const scrollProgress = writable(0);
  let currentTime = 0;
  let animationFrameId: number;
  
  const animate = () => {
    currentTime += 0.01;
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
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
      cancelAnimationFrame(animationFrameId);
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

    <div 
      class="scroll-canvas-wrapper" 
      class:selection-mode={step === 'selection'}
      style="opacity: {step === 'selection' ? 0.3 : Math.max(0, 1 - $scrollProgress * 1.5)};"
    >
      <Canvas>
        <T.PerspectiveCamera makeDefault position={[0, 0, 15]} fov={30} />
        <T.AmbientLight intensity={0.5} />
        <T.DirectionalLight position={[10, 10, 5]} intensity={2} />

        <T.Group 
          position.x={-2 + Math.sin(currentTime * 0.5) * 0.8} 
          rotation.y={$scrollProgress * 6 + currentTime * 0.3} 
          position.y={2 - $scrollProgress * 12 + Math.cos(currentTime * 0.7) * 0.5}
          position.z={Math.sin($scrollProgress * 8 + currentTime * 0.4) * 3}
        >
          <LegoBrick geometry={{width: 4, depth: 2, height: 'brick'}} color="#DA291C" scale={1.2} id="s1" />
        </T.Group>

       <T.Group 
          position.x={3 + Math.cos(currentTime * 0.4) * 0.8} 
          position.y={-2 + $scrollProgress * 15 + Math.sin(currentTime * 0.6) * 0.6} 
          rotation.y={$scrollProgress * -4 + currentTime * 0.4}
          rotation.z={Math.sin($scrollProgress * 5 + currentTime * 0.3) * 0.5}
        >
          <LegoBrick geometry={{width: 3, depth: 2, height: 'brick'}} color="#0055BF" scale={1} id="s2" />
        </T.Group>

        <T.Group 
          position.y={-8 + $scrollProgress * 16 + Math.cos(currentTime * 0.8) * 0.7} 
          position.x={$scrollProgress * -6 + Math.sin(currentTime * 0.3) * 1.0} 
          rotation.x={$scrollProgress * 3 + currentTime * 0.2}
           position.z={Math.cos($scrollProgress * 4 + currentTime * 0.5) * 4}
        >
          <LegoHead color="#FFD700" />
        </T.Group>

        <T.Group 
          position.z={-15 + $scrollProgress * 25 + Math.sin(currentTime * 0.5) * 1.2} 
          position.x={-5 + Math.cos(currentTime * 0.7) * 0.6} 
          rotation.z={$scrollProgress * 7 + currentTime * 0.35}
          position.y={Math.sin($scrollProgress * 3 + currentTime * 0.6) * 2}
        >
          <LegoBrick geometry={{width: 3, depth: 2, height: 'brick'}} color="#f5c105" scale={0.8} id="s3" />
        </T.Group>

        <T.Group 
           position.y={5 - $scrollProgress * 18 + Math.sin(currentTime * 0.6) * 0.8} 
          position.x={5 + Math.cos(currentTime * 0.8) * 0.7} 
          rotation.x={$scrollProgress * -5 + currentTime * 0.25}
          rotation.y={Math.cos($scrollProgress * 6 + currentTime * 0.4) * 1.2}
        >
          <LegoBrick geometry={{width: 2, depth: 2, height: 'plate'}} color="#FFD700" scale={1.1} id="s4" />
         </T.Group>

        <T.Group 
          position.y={-5 + $scrollProgress * 10 + Math.cos(currentTime * 0.4) * 0.9} 
          position.x={-6 + $scrollProgress * 15 + Math.sin(currentTime * 0.9) * 0.7} 
          rotation.y={$scrollProgress * 8 + currentTime * 0.45}
          position.z={Math.sin($scrollProgress * 7 + currentTime * 0.6) * 2}
        >
          <LegoHead color="#FFD700" scale={0.7} />
        </T.Group>

        <T.Group 
          position.x={8 + Math.sin(currentTime * 0.7) * 0.6} 
          position.y={4 - $scrollProgress * 20 + Math.cos(currentTime * 0.5) * 0.8} 
           rotation.y={$scrollProgress * 3 + currentTime * 0.2} 
          rotation.z={$scrollProgress * -4 + currentTime * 0.3}
          position.z={Math.cos($scrollProgress * 5 + currentTime * 0.7) * 3}
        >
          <LegoBrick geometry={{width: 6, depth: 2, height: 'plate'}} color="#0055BF" scale={0.9} id="s5" />
        </T.Group>

        <T.Group 
          position.z={5 - $scrollProgress * 18 + Math.cos(currentTime * 0.6) * 0.7} 
          position.x={1 + Math.sin(currentTime * 0.8) * 0.9} 
          rotation.x={$scrollProgress * 4 + currentTime * 0.35}
          rotation.y={$scrollProgress * -3 + currentTime * 0.25}
          position.y={Math.cos($scrollProgress * 4 + currentTime * 0.8) * 2}
         >
          <LegoBrick geometry={{width: 2, depth: 2, height: 'brick'}} color="#DA291C" scale={0.6} id="s6" />
        </T.Group>

        {#if step === 'selection'}
          <T.Group 
            position.x={-8 + Math.sin(currentTime * 0.3) * 1.2} 
             position.y={6 + Math.cos(currentTime * 0.5) * 0.8} 
            rotation.y={currentTime * 0.4}
            position.z={Math.sin(currentTime * 0.6) * 4}
          >
            <LegoBrick geometry={{width: 2, depth: 4, height: 'brick'}} color="#10B981" scale={0.7} id="s7" />
          </T.Group>

          <T.Group 
           position.x={10 + Math.cos(currentTime * 0.4) * 0.9} 
            position.y={-7 + Math.sin(currentTime * 0.6) * 1.0} 
            rotation.z={currentTime * 0.3}
            position.z={Math.cos(currentTime * 0.8) * 3}
          >
            <LegoBrick geometry={{width: 4, depth: 1, height: 'plate'}} color="#8B5CF6" scale={0.8} id="s8" />
           </T.Group>

          <T.Group 
            position.x={Math.sin(currentTime * 0.7) * 6} 
            position.y={8 + Math.cos(currentTime * 0.4) * 0.6} 
            rotation.x={currentTime * 0.5}
            position.z={-8 + Math.sin(currentTime * 0.9) * 2}
          >
           <LegoHead color="#F59E0B" scale={0.6} />
          </T.Group>

          <T.Group 
            position.x={-12 + Math.cos(currentTime * 0.6) * 1.5} 
            position.y={Math.sin(currentTime * 0.8) * 4} 
            rotation.y={currentTime * 0.6}
             position.z={Math.cos(currentTime * 0.4) * 5}
          >
            <LegoBrick geometry={{width: 1, depth: 2, height: 'brick'}} color="#EC4899" scale={0.5} id="s9" />
          </T.Group>

          <T.Group 
            position.x={12 + Math.sin(currentTime * 0.5) * 1.0} 
            position.y={-10 + Math.cos(currentTime * 0.7) * 1.2} 
            rotation.z={currentTime * 0.4}
            position.z={Math.sin(currentTime * 0.5) * 3}
          >
            <LegoBrick geometry={{width: 3, depth: 1, height: 'plate'}} color="#06B6D4" scale={0.6} id="s10" />
          </T.Group>

          <T.Group 
            position.x={Math.cos(currentTime * 0.9) * 8} 
            position.y={-4 + Math.sin(currentTime * 0.3) * 0.8} 
            rotation.x={currentTime * 0.7}
            position.z={-6 + Math.cos(currentTime * 0.6) * 2}
          >
            <LegoHead color="#EF4444" scale={0.4} />
          </T.Group>
        {/if}

        {#if $scrollProgress > 0.3}
          <T.Group 
            position.y={-3 + $scrollProgress * 16 + Math.sin(currentTime * 0.9) * 0.4} 
            position.x={Math.cos(currentTime * 0.7) * 0.6} 
            rotation.y={$scrollProgress * 8 + currentTime * 0.5}
             position.z={Math.sin($scrollProgress * 6 + currentTime * 0.8) * 2}
          >
            <LegoMinifigure />
          </T.Group>
        {/if}
      </Canvas>
    </div>

    <div class="intro-text" style="opacity: {1 - $scrollProgress * 3}; transform: translateX(-50%) translateY({$scrollProgress * 20}px);">
      <h1 class="genesis-title">Genesis Builder</h1>
      <p class="scroll-instruction">Role para iniciar a construção</p>
    </div>

    {#if step === 'selection'}
      <div class="template-selection" in:fly={{y: 50, duration: 800}}>
        <div class="selection-content">
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

          {#if $hasDownloaded}
            <div class="continue-project" in:fade={{ delay: 600, duration: 500 }}>
              <a href="/continuar">Ou continue um projeto existente</a>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

{:else if step === 'tesseract'}
  <div class="tesseract-container" in:fade>
    <aside class="modern-palette">
      <div class="palette-header">
        <button class="back-button" on:click={backToSelection}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646Z"/>
          </svg>
          Mudar Projeto
        </button>
        
        <div class="palette-title">
          <h2>Paleta de Blocos</h2>
          <p class="template-type">{$activeTemplate === 'card' ? 'Cartão de Visitas' : 'Landing Page'}</p>
        </div>
      </div>

      <div class="blocks-section">
        {#if $activeTemplate === 'card'}
          <button 
            class="block-button" 
            class:disabled={$blocks.some(b => b.type === 'Header')}
            on:click={() => addBlock('Header')} 
            disabled={$blocks.some(b => b.type === 'Header')}
          >
            <div class="block-icon">
              <svg width="32" height="20" viewBox="0 0 32 20" class="lego-header">
                <rect x="2" y="6" width="28" height="12" rx="2" fill="#4F46E5"/>
                <circle cx="8" cy="4" r="2" fill="#6366F1"/>
                <circle cx="16" cy="4" r="2" fill="#6366F1"/>
                <circle cx="24" cy="4" r="2" fill="#6366F1"/>
                <rect x="2" y="6" width="28" height="2" fill="#3730A3"/>
              </svg>
            </div>
            <span>Adicionar Cabeça</span>
            <small>Título principal</small>
          </button>

          <button 
            class="block-button" 
             class:disabled={$blocks.some(b => b.type === 'ProfileCard')}
            on:click={() => addBlock('ProfileCard')} 
            disabled={$blocks.some(b => b.type === 'ProfileCard')}
          >
            <div class="block-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" class="lego-minifig">
                 <circle cx="16" cy="8" r="6" fill="#FCD34D"/>
                <rect x="10" y="14" width="12" height="12" rx="2" fill="#DC2626"/>
                <rect x="12" y="26" width="3" height="4" fill="#1F2937"/>
                <rect x="17" y="26" width="3" height="4" fill="#1F2937"/>
                <circle cx="13" cy="6" r="1" fill="#1F2937"/>
                <circle cx="19" cy="6" r="1" fill="#1F2937"/>
                <path d="M13 10 Q16 12 19 10" stroke="#1F2937" stroke-width="1" fill="none"/>
              </svg>
            </div>
            <span>Adicionar Tronco</span>
            <small>Perfil pessoal</small>
          </button>

          <button 
            class="block-button" 
            class:disabled={$blocks.some(b => b.type === 'LinkList')}
            on:click={() => addBlock('LinkList')} 
            disabled={$blocks.some(b => b.type === 'LinkList')}
          >
           <div class="block-icon">
              <svg width="32" height="20" viewBox="0 0 32 20" class="lego-links">
                <rect x="2" y="2" width="12" height="16" rx="2" fill="#059669"/>
                <rect x="18" y="2" width="12" height="16" rx="2" fill="#059669"/>
                 <circle cx="5" cy="0" r="1.5" fill="#10B981"/>
                <circle cx="11" cy="0" r="1.5" fill="#10B981"/>
                <circle cx="21" cy="0" r="1.5" fill="#10B981"/>
                <circle cx="27" cy="0" r="1.5" fill="#10B981"/>
              </svg>
            </div>
             <span>Adicionar Pernas</span>
            <small>Links sociais</small>
          </button>

        {:else if $activeTemplate === 'landing'}
          <button 
            class="block-button" 
            on:click={() => addBlock('Header')}
           >
            <div class="block-icon">
              <svg width="32" height="20" viewBox="0 0 32 20" class="lego-header">
                <rect x="2" y="6" width="28" height="12" rx="2" fill="#4F46E5"/>
                <circle cx="8" cy="4" r="2" fill="#6366F1"/>
                 <circle cx="16" cy="4" r="2" fill="#6366F1"/>
                <circle cx="24" cy="4" r="2" fill="#6366F1"/>
                <rect x="2" y="6" width="28" height="2" fill="#3730A3"/>
              </svg>
            </div>
            <span>Adicionar Cabeçalho</span>
            <small>Título da página</small>
           </button>

          <button 
            class="block-button" 
            on:click={() => addBlock('ImageBlock')}
          >
            <div class="block-icon">
              <svg width="32" height="20" viewBox="0 0 32 20" class="lego-image">
                 <rect x="2" y="4" width="28" height="14" rx="2" fill="#8B5CF6"/>
                <circle cx="8" cy="2" r="1.5" fill="#A78BFA"/>
                <circle cx="16" cy="2" r="1.5" fill="#A78BFA"/>
                <circle cx="24" cy="2" r="1.5" fill="#A78BFA"/>
                <rect x="6" y="8" width="20" height="6" rx="1" fill="#C4B5FD"/>
                 <circle cx="10" cy="10" r="1" fill="#8B5CF6"/>
                <path d="M14 12 L18 8 L22 12" fill="#8B5CF6"/>
              </svg>
            </div>
            <span>Adicionar Imagem</span>
            <small>Foto ou ilustração</small>
           </button>

          <button 
            class="block-button" 
            on:click={() => addBlock('RichText')}
          >
            <div class="block-icon">
              <svg width="32" height="20" viewBox="0 0 32 20" class="lego-text">
                <rect x="2" y="4" width="28" height="14" rx="2" fill="#F59E0B"/>
                <circle cx="8" cy="2" r="1.5" fill="#FCD34D"/>
                <circle cx="16" cy="2" r="1.5" fill="#FCD34D"/>
                <circle cx="24" cy="2" r="1.5" fill="#FCD34D"/>
                <rect x="6" y="8" width="16" height="1.5" fill="#FCD34D"/>
                 <rect x="6" y="11" width="20" height="1.5" fill="#FCD34D"/>
                <rect x="6" y="14" width="12" height="1.5" fill="#FCD34D"/>
              </svg>
            </div>
            <span>Adicionar Texto</span>
            <small>Conteúdo rico</small>
          </button>

          <button 
            class="block-button" 
            on:click={() => addBlock('LinkList')}
          >
            <div class="block-icon">
              <svg width="32" height="20" viewBox="0 0 32 20" class="lego-links">
                <rect x="2" y="2" width="12" height="16" rx="2" fill="#059669"/>
                 <rect x="18" y="2" width="12" height="16" rx="2" fill="#059669"/>
                <circle cx="5" cy="0" r="1.5" fill="#10B981"/>
                <circle cx="11" cy="0" r="1.5" fill="#10B981"/>
                <circle cx="21" cy="0" r="1.5" fill="#10B981"/>
                <circle cx="27" cy="0" r="1.5" fill="#10B981"/>
               </svg>
            </div>
            <span>Adicionar Links</span>
            <small>Botões de ação</small>
          </button>
        {/if}
      </div>

      {#if ($activeTemplate === 'card' && allBlocksAdded) || ($activeTemplate === 'landing' && $blocks.length > 0)}
        <div class="explore-section">
          <a href="/refinar" class="explore-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5Z"/>
             </svg>
            Explorar Criação
          </a>
        </div>
      {/if}

      <div class="block-counter">
        <div class="counter-info">
          <span class="counter-number">{$blocks.length}</span>
          <span class="counter-text">bloco{$blocks.length !== 1 ? 's' : ''} adicionado{$blocks.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
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
    transition: opacity 0.5s ease, filter 0.5s ease;
    filter: blur(0px);
  }
  .scroll-canvas-wrapper.selection-mode {
    filter: blur(0.5px);
    animation: lego-drift 25s linear infinite;
  }
  .intro-text { 
    position: fixed; 
    top: 40vh; 
    left: 45%;
    transform: translateX(-50%);
    text-align: center; 
    z-index: 10; 
    pointer-events: none; 
    transition: opacity 0.3s;
  }
  .genesis-title {
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0 0 1rem 0;
    color: #1a1a1a;
    text-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.1),
      0 0 20px rgba(0, 0, 0, 0.05);
    animation: subtle-shimmer 4s ease-in-out infinite;
    background: linear-gradient(
      135deg,
      #1a1a1a 0%,
      #333333 25%,
      #1a1a1a 50%,
      #333333 75%,
      #1a1a1a 100%
    );
    background-size: 300% 300%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
  }
  .scroll-instruction {
    font-size: 1.2rem;
    margin: 0;
    color: #8B5CF6;
    font-weight: 500;
    text-shadow: 0 1px 3px rgba(139, 92, 246, 0.2);
    animation: gentle-pulse 3s ease-in-out infinite;
  }
  .template-selection { 
    position: fixed; 
    top: 0;
    left: 0; 
    width: 100%; 
    height: 100vh; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    z-index: 15; 
    background: rgba(248, 250, 252, 0.95);
    backdrop-filter: blur(10px);
  }
  .selection-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 1000px;
    padding: 2rem;
  }
  .selection-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  .selection-title {
    font-size: 2.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f5576c 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 1rem 0;
    animation: title-glow 4s ease-in-out infinite;
  }
  .selection-subtitle {
    font-size: 1.2rem;
    margin: 0;
    font-weight: 500;
    color: #059669;
    text-shadow: 0 1px 3px rgba(5, 150, 105, 0.15);
    animation: subtitle-glow 3s ease-in-out infinite;
  }
  .template-cards { 
    display: flex; 
    gap: 2.5rem; 
    perspective: 1000px;
  }
  .card { 
    position: relative;
    background: linear-gradient(145deg, 
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.85) 100%
    );
    padding: 2.5rem 2rem; 
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 1.5rem; 
    cursor: pointer; 
    width: 300px;
    height: 260px;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(20px);
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.08),
      0 1px 3px rgba(0, 0, 0, 0.05);
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
      rgba(102, 126, 234, 0.05) 0%,
      rgba(245, 87, 108, 0.05) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 1.5rem;
  }
  .card:hover::before {
    opacity: 1;
  }
  .card:hover { 
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(102, 126, 234, 0.2);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.12),
      0 4px 12px rgba(0, 0, 0, 0.08);
  }
  .card-business:hover {
    box-shadow: 
      0 12px 40px rgba(245, 87, 108, 0.15),
      0 4px 12px rgba(245, 87, 108, 0.1);
  }
  .card-landing:hover {
    box-shadow: 
      0 12px 40px rgba(79, 172, 254, 0.15),
      0 4px 12px rgba(79, 172, 254, 0.1);
  }
  .card-icon {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    animation: icon-float 3s ease-in-out infinite;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  .card h2 { 
    margin: 0 0 0.75rem 0;
    font-size: 1.6rem;
    font-weight: 700;
    color: #2d3748;
    position: relative;
    z-index: 2;
  }
  .card p {
    margin: 0;
    color: #718096;
    font-size: 1rem;
    font-weight: 400;
    position: relative;
    z-index: 2;
  }
  .card-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
    animation: glow-rotate 6s linear infinite;
  }
  .card:hover .card-glow {
    opacity: 1;
  }
  .card-business .card-glow {
    background: radial-gradient(circle, rgba(245, 87, 108, 0.1) 0%, transparent 70%);
  }
  .card-landing .card-glow {
    background: radial-gradient(circle, rgba(79, 172, 254, 0.1) 0%, transparent 70%);
  }
  .tesseract-container { 
    position: relative; 
    height: 100vh;
    width: 100vw; 
  }
  .modern-palette {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    z-index: 10;
    width: 320px;
    background: linear-gradient(145deg, 
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.9) 100%
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 1.5rem;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 8px 16px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  .palette-header {
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(107, 114, 128, 0.1);
    border: 1px solid rgba(107, 114, 128, 0.2);
    color: #6b7280;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s ease;
    margin-bottom: 1rem;
  }
  .back-button:hover {
    background: rgba(107, 114, 128, 0.15);
    border-color: rgba(107, 114, 128, 0.3);
    color: #4b5563;
  }
  .palette-title h2 {
    margin: 0 0 0.25rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
  }
  .template-type {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }
  .blocks-section {
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .block-button {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 1rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
    position: relative;
    overflow: hidden;
  }
  .block-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(99, 102, 241, 0.05) 0%,
      rgba(168, 85, 247, 0.05) 100%
    );
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .block-button:hover::before {
    opacity: 1;
  }
  .block-button:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.2);
    box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.08),
      0 4px 8px rgba(0, 0, 0, 0.04);
  }
  .block-button.disabled {
    background: rgba(107, 114, 128, 0.1);
    border-color: rgba(107, 114, 128, 0.15);
    cursor: not-allowed;
    opacity: 0.6;
  }
  .block-button.disabled:hover {
    transform: none;
    box-shadow: none;
  }
  .block-icon {
    flex-shrink: 0;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 0.75rem;
    border: 1px solid rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 1;
  }
  .block-button span {
    font-weight: 600;
    color: #1f2937;
    font-size: 0.875rem;
    position: relative;
    z-index: 1;
  }
  .block-button small {
    display: block;
    color: #6b7280;
    font-size: 0.75rem;
    margin-top: 0.125rem;
    position: relative;
    z-index: 1;
  }
  .explore-section {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  .explore-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-decoration: none;
    padding: 1rem 1.5rem;
    border-radius: 1rem;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    width: 100%;
  }
  .explore-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
  .block-counter {
    padding: 1rem 1.5rem 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  .counter-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
  }
  .counter-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
  }
  .counter-text {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }
  .lego-header {
    animation: lego-pulse 2s ease-in-out infinite;
  }
  .lego-minifig {
    animation: minifig-wave 3s ease-in-out infinite;
  }
  .lego-links {
    animation: links-bounce 2.5s ease-in-out infinite;
  }
  .lego-image {
    animation: image-glow 3s ease-in-out infinite;
  }
  .lego-text {
    animation: text-write 2s ease-in-out infinite;
  }
  @keyframes subtle-shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes gentle-pulse {
    0%, 100% { opacity: 0.9; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.01); }
  }
  @keyframes title-glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.1); }
  }
  @keyframes subtitle-glow {
    0%, 100% { opacity: 0.9; }
    50% { opacity: 1; }
  }
  @keyframes icon-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes glow-rotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes lego-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
  }
  @keyframes minifig-wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }
  @keyframes links-bounce {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }
  @keyframes image-glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.1); }
  }
  @keyframes text-write {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  @keyframes lego-drift {
    0% { transform: translateX(0px) translateY(0px); }
    25% { transform: translateX(5px) translateY(-3px); }
    50% { transform: translateX(-3px) translateY(5px); }
    75% { transform: translateX(-5px) translateY(-3px); }
    100% { transform: translateX(0px) translateY(0px); }
  }
  @media (max-width: 768px) {
    .genesis-title { font-size: 2.5rem; }
    .scroll-instruction { font-size: 1.1rem; }
    .selection-title { font-size: 2.2rem; }
    .template-cards { flex-direction: column; gap: 2rem; }
    .card { width: 280px; height: 220px; padding: 2rem 1.5rem; }
    .card-icon { font-size: 3rem; }
    .card h2 { font-size: 1.4rem; }
    .selection-header { margin-bottom: 2rem; }
    .selection-content { padding: 1rem; }
    .modern-palette { left: 1rem; right: 1rem; width: auto; }
  }

  /* ✅ NOVO: Estilos para o link de continuar projeto */
  .continue-project {
      margin-top: 2.5rem;
      text-align: center;
  }
  .continue-project a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 500;
      font-size: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: background-color 0.2s ease;
  }
  .continue-project a:hover {
      background-color: rgba(79, 70, 229, 0.1);
      text-decoration: underline;
  }
</style>