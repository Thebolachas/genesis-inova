<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import PropertiesPanel from '$lib/components/PropertiesPanel.svelte';
  import ActionBar from '$lib/components/ActionBar.svelte';
  import TimeMaestro from '$lib/components/TimeMaestro.svelte';
  import TextEditorPopover from '$lib/components/TextEditorPopover.svelte';
  import TimeTravelEffects from '$lib/components/TimeTravelEffects.svelte';
  
  import { blocks, history, historyIndex, getHistoryDiff } from '$lib/stores';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Estado para controlar os efeitos visuais
  let showTimeTravelEffects = false;
  let timeTravelChanges = { added: [], removed: [], modified: [] };
  let timeTravelDirection: 'forward' | 'backward' = 'forward';

  // Função para detectar e mostrar mudanças durante viagem no tempo
  function handleTimeTravel(direction: 'forward' | 'backward') {
    const currentIndex = $historyIndex;
    const h = $history;
    
    let currentState: any[] = [];
    let targetState: any[] = [];
    
    if (direction === 'backward' && currentIndex > 0) {
      currentState = h[currentIndex] || [];
      targetState = h[currentIndex - 1] || [];
    } else if (direction === 'forward' && currentIndex < h.length - 1) {
      currentState = h[currentIndex] || [];
      targetState = h[currentIndex + 1] || [];
    } else {
      return; // Não há mudança possível
    }
    
    // Calcular diferenças
    const diff = getHistoryDiff(currentState, targetState);
    
    // Configurar efeitos visuais
    timeTravelChanges = {
      added: diff.addedBlocks,
      removed: diff.removedBlocks,  
      modified: diff.modifiedBlocks
    };
    
    timeTravelDirection = direction;
    
    // Mostrar efeitos se houver mudanças
    const totalChanges = diff.addedBlocks.length + diff.removedBlocks.length + diff.modifiedBlocks.length;
    if (totalChanges > 0) {
      showTimeTravelEffects = true;
    }
  }

  // Configurar atalhos de teclado
  onMount(() => {
    function handleKeydown(e: KeyboardEvent) {
      // Ctrl+Z ou Cmd+Z para undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if ($historyIndex > 0) {
          handleTimeTravel('backward');
          // O undo será chamado pelo TimeMaestro
        }
      } 
      // Ctrl+Y ou Cmd+Shift+Z para redo
      else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if ($historyIndex < $history.length - 1) {
          handleTimeTravel('forward');
          // O redo será chamado pelo TimeMaestro
        }
      }
    }

    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  // Atualizar título da página baseado no estado atual (apenas no browser)
  $: if (browser && $historyIndex >= 0 && $history.length > 0) {
    const currentState = $history[$historyIndex] || [];
    const totalBlocks = currentState.length;
    
    if (totalBlocks > 0) {
      document.title = `Genesis Inova - ${totalBlocks} bloco${totalBlocks !== 1 ? 's' : ''} (${$historyIndex + 1}/${$history.length})`;
    } else {
      document.title = 'Genesis Inova - Editor Vazio';
    }
  }
  
  // Sistema de notificações toast
  function showToast(message: string, type: 'success' | 'info' | 'warning' = 'info') {
    console.log(`🔔 ${type.toUpperCase()}: ${message}`);
    // Implementar sistema de toast se desejar
  }

  // Detectar performance e otimizar se necessário
  $: if ($history.length > 50) {
    console.warn('⚠️ Histórico muito grande, considere otimizar');
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Montserrat:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
  <meta name="description" content="Editor visual de páginas web com sistema de undo/redo avançado e blocos LEGO animados">
  <meta name="keywords" content="editor, web, visual, construtor de páginas, undo, redo, LEGO">
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

  <!-- Maestro do Tempo com blocos de LEGO animados -->
  <TimeMaestro {handleTimeTravel} />

  <!-- Efeitos visuais cinematográficos de viagem no tempo -->
  <TimeTravelEffects 
    bind:visible={showTimeTravelEffects}
    changes={timeTravelChanges}
    direction={timeTravelDirection}
  />
</div>

<!-- Indicador de performance para desenvolvimento -->
{#if $history.length > 40}
  <div class="performance-indicator" class:critical={$history.length > 60}>
    <div class="indicator-content">
      <div class="indicator-icon">
        {$history.length > 60 ? '🔴' : '🟡'}
      </div>
      <div class="indicator-text">
        <div class="indicator-title">
          {$history.length > 60 ? 'Performance Crítica' : 'Performance Degradada'}
        </div>
        <div class="indicator-subtitle">
          {$history.length} estados no histórico
        </div>
      </div>
      <button 
        class="optimize-btn"
        on:click={() => {
          // Manter apenas os últimos 20 estados
          history.update(h => h.slice(-20));
          historyIndex.update(i => Math.min(i, 19));
          showToast('Histórico otimizado!', 'success');
        }}
        title="Otimizar histórico"
      >
        ⚡ Otimizar
      </button>
    </div>
  </div>
{/if}

<!-- Keyboard shortcuts help (opcional) -->
<div class="keyboard-shortcuts" class:visible={false}>
  <div class="shortcuts-content">
    <h3>Atalhos do Teclado</h3>
    <div class="shortcuts-list">
      <div class="shortcut-item">
        <kbd>Ctrl</kbd> + <kbd>Z</kbd>
        <span>Desfazer</span>
      </div>
      <div class="shortcut-item">
        <kbd>Ctrl</kbd> + <kbd>Y</kbd>
        <span>Refazer</span>
      </div>
      <div class="shortcut-item">
        <span>Drag nos blocos LEGO</span>
        <span>Viajar no tempo</span>
      </div>
    </div>
  </div>
</div>

<style>
  .page-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    box-sizing: border-box;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .refinement-layout {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 350px;
    flex-grow: 1;
    overflow: hidden;
    height: calc(100% - 60px);
    gap: 1px;
    background-color: #e5e7eb;
  }

  .canvas-area, .properties-panel {
    overflow-y: auto;
    height: 100%;
    padding-bottom: 80px; /* Espaço extra para o TimeMaestro */
    box-sizing: border-box;
    background-color: white;
  }

  .canvas-area {
    background: linear-gradient(45deg, #f8fafc 25%, transparent 25%),
                linear-gradient(-45deg, #f8fafc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #f8fafc 75%),
                linear-gradient(-45deg, transparent 75%, #f8fafc 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }

  .properties-panel {
    border-left: 1px solid #e5e7eb;
    background-color: #fafafa;
  }

  .performance-indicator {
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    z-index: 50;
    animation: slideInRight 0.3s ease-out;
  }

  .performance-indicator.critical {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .indicator-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .indicator-icon {
    font-size: 1.2rem;
  }

  .indicator-text {
    flex: 1;
  }

  .indicator-title {
    font-weight: 600;
    margin-bottom: 0.125rem;
  }

  .indicator-subtitle {
    opacity: 0.9;
    font-size: 0.75rem;
  }

  .optimize-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .optimize-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .keyboard-shortcuts {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 100;
  }

  .keyboard-shortcuts.visible {
    opacity: 1;
    visibility: visible;
  }

  .shortcuts-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    font-size: 0.8rem;
  }

  .shortcut-item kbd {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-size: 0.7rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  /* Responsividade */
  @media (max-width: 1024px) {
    .refinement-layout {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
    }
    
    .properties-panel {
      max-height: 300px;
      border-left: none;
      border-top: 1px solid #e5e7eb;
    }
  }

  @media (max-width: 768px) {
    .page-wrapper {
      height: 100svh; /* Use svh for better mobile support */
    }
    
    .canvas-area, .properties-panel {
      padding-bottom: 70px;
    }
    
    .performance-indicator {
      right: 10px;
      left: 10px;
      top: 70px;
    }

    .keyboard-shortcuts {
      left: 10px;
      right: 10px;
      bottom: 10px;
    }
  }

  /* Scrollbar personalizado */
  .canvas-area::-webkit-scrollbar,
  .properties-panel::-webkit-scrollbar {
    width: 6px;
  }

  .canvas-area::-webkit-scrollbar-track,
  .properties-panel::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .canvas-area::-webkit-scrollbar-thumb,
  .properties-panel::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .canvas-area::-webkit-scrollbar-thumb:hover,
  .properties-panel::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
</style>