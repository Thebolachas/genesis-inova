<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { elasticOut, quintOut } from 'svelte/easing';
  import type { Block } from '$lib/stores';

  export let changes: {
    added: Block[];
    removed: Block[];
    modified: Block[];
  } = { added: [], removed: [], modified: [] };
  
  export let direction: 'forward' | 'backward' = 'forward';
  export let visible = false;

  // Cores para diferentes tipos de mudança
  const changeColors = {
    added: '#10b981',    // Verde
    removed: '#ef4444',  // Vermelho
    modified: '#f59e0b'  // Amarelo
  };

  // Ícones para tipos de bloco
  const blockIcons = {
    'Header': '🏷️',
    'ProfileCard': '👤',
    'LinkList': '🔗',
    'RichText': '📝',
    'ImageBlock': '🖼️'
  };

  function getChangeDescription(type: 'added' | 'removed' | 'modified', blocks: Block[]) {
    if (blocks.length === 0) return '';
    
    const blockTypes = blocks.map(b => b.type);
    const uniqueTypes = [...new Set(blockTypes)];
    
    const actionText = {
      added: direction === 'forward' ? 'Adicionado' : 'Removendo',
      removed: direction === 'forward' ? 'Removido' : 'Restaurando',
      modified: direction === 'forward' ? 'Modificado' : 'Revertendo'
    };
    
    const typeIcons = uniqueTypes.map(t => blockIcons[t] || '📦').join(' ');
    return `${actionText[type]}: ${typeIcons} (${blocks.length})`;
  }

  // Auto-hide após 3 segundos
  let autoHideTimer: number | null = null;
  
  $: if (visible) {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }
    autoHideTimer = setTimeout(() => {
      visible = false;
      autoHideTimer = null;
    }, 3000);
  } else {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
  }

  // Calcular total de mudanças
  $: totalChanges = changes.added.length + changes.removed.length + changes.modified.length;
</script>

{#if visible && totalChanges > 0}
  <div 
    class="time-travel-overlay"
    transition:fade={{ duration: 300 }}
    on:click={() => visible = false}
  >
    <div 
      class="changes-panel" 
      class:forward={direction === 'forward'}
      class:backward={direction === 'backward'}
      transition:fly={{ 
        y: direction === 'forward' ? 50 : -50, 
        duration: 500, 
        easing: elasticOut 
      }}
      on:click|stopPropagation
    >
      <!-- Header da viagem no tempo -->
      <div class="panel-header">
        <div class="time-indicator">
          <div class="time-icon">
            {#if direction === 'forward'}
              <div class="forward-icon">⏭️</div>
            {:else}
              <div class="backward-icon">⏮️</div>
            {/if}
          </div>
          <div class="time-text">
            <div class="main-text">{direction === 'forward' ? 'Avançando' : 'Voltando'}</div>
            <div class="sub-text">no tempo</div>
          </div>
        </div>
        <button class="close-btn" on:click={() => visible = false} title="Fechar">
          ✕
        </button>
      </div>

      <!-- Lista de mudanças -->
      <div class="changes-list">
        {#if changes.added.length > 0}
          <div 
            class="change-item added"
            transition:scale={{ duration: 400, easing: quintOut, delay: 100 }}
          >
            <div class="change-icon" style="background-color: {changeColors.added}">
              <span class="icon-symbol">+</span>
            </div>
            <div class="change-content">
              <div class="change-text">
                {getChangeDescription('added', changes.added)}
              </div>
              <div class="block-preview">
                {#each changes.added as block}
                  <div 
                    class="mini-block added-block" 
                    style="background-color: {changeColors.added}"
                    title="{block.type}"
                  >
                    {blockIcons[block.type] || '📦'}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        {#if changes.removed.length > 0}
          <div 
            class="change-item removed"
            transition:scale={{ duration: 400, easing: quintOut, delay: 200 }}
          >
            <div class="change-icon" style="background-color: {changeColors.removed}">
              <span class="icon-symbol">−</span>
            </div>
            <div class="change-content">
              <div class="change-text">
                {getChangeDescription('removed', changes.removed)}
              </div>
              <div class="block-preview">
                {#each changes.removed as block}
                  <div 
                    class="mini-block removed-block" 
                    style="background-color: {changeColors.removed}"
                    title="{block.type}"
                  >
                    {blockIcons[block.type] || '📦'}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        {#if changes.modified.length > 0}
          <div 
            class="change-item modified"
            transition:scale={{ duration: 400, easing: quintOut, delay: 300 }}
          >
            <div class="change-icon" style="background-color: {changeColors.modified}">
              <span class="icon-symbol">~</span>
            </div>
            <div class="change-content">
              <div class="change-text">
                {getChangeDescription('modified', changes.modified)}
              </div>
              <div class="block-preview">
                {#each changes.modified as block}
                  <div 
                    class="mini-block modified-block" 
                    style="background-color: {changeColors.modified}"
                    title="{block.type}"
                  >
                    {blockIcons[block.type] || '📦'}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Indicador de direção animado -->
      <div class="direction-footer">
        <div class="direction-arrow {direction}">
          {#if direction === 'forward'}
            <div class="arrow-animation">→→→</div>
          {:else}
            <div class="arrow-animation">←←←</div>
          {/if}
        </div>
        <div class="change-summary">
          {totalChanges} mudança{totalChanges !== 1 ? 's' : ''} detectada{totalChanges !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .time-travel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      rgba(0, 0, 0, 0.7) 0%,
      rgba(17, 24, 39, 0.8) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .changes-panel {
    background: linear-gradient(135deg, 
      rgba(17, 24, 39, 0.95) 0%,
      rgba(31, 41, 55, 0.95) 50%,
      rgba(55, 65, 81, 0.95) 100%
    );
    border-radius: 20px;
    padding: 2rem;
    max-width: 450px;
    min-width: 350px;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    cursor: default;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(20px);
  }

  .changes-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .changes-panel.forward {
    border-left: 4px solid #10b981;
  }

  .changes-panel.backward {
    border-left: 4px solid #ef4444;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    color: white;
  }

  .time-indicator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .time-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .forward-icon {
    animation: forwardPulse 1.5s infinite;
  }

  .backward-icon {
    animation: backwardPulse 1.5s infinite;
  }

  @keyframes forwardPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1) translateX(2px); }
  }

  @keyframes backwardPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1) translateX(-2px); }
  }

  .time-text {
    display: flex;
    flex-direction: column;
  }

  .main-text {
    font-weight: 700;
    font-size: 1.1rem;
    line-height: 1.2;
  }

  .sub-text {
    font-size: 0.85rem;
    opacity: 0.8;
    font-weight: 400;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .changes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .change-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  .change-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .change-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .icon-symbol {
    font-size: 18px;
    font-weight: 900;
  }

  .change-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .change-text {
    color: #e5e7eb;
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.4;
  }

  .block-preview {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .mini-block {
    width: 28px;
    height: 22px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
  }

  .mini-block:hover {
    transform: scale(1.1);
  }

  .added-block {
    animation: addedPulse 2s infinite;
  }

  .removed-block {
    animation: removedPulse 2s infinite;
  }

  .modified-block {
    animation: modifiedPulse 2s infinite;
  }

  @keyframes addedPulse {
    0%, 100% { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.5); }
  }

  @keyframes removedPulse {
    0%, 100% { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.5); }
  }

  @keyframes modifiedPulse {
    0%, 100% { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.5); }
  }

  .direction-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .direction-arrow {
    font-size: 24px;
    color: #9ca3af;
    font-weight: bold;
  }

  .arrow-animation {
    animation: slideArrow 1.5s infinite;
  }

  .direction-arrow.forward .arrow-animation {
    animation-name: slideRight;
  }

  .direction-arrow.backward .arrow-animation {
    animation-name: slideLeft;
  }

  @keyframes slideRight {
    0% { transform: translateX(-10px); opacity: 0.5; }
    50% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(10px); opacity: 0.5; }
  }

  @keyframes slideLeft {
    0% { transform: translateX(10px); opacity: 0.5; }
    50% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(-10px); opacity: 0.5; }
  }

  .change-summary {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    text-align: center;
  }

  /* Responsividade */
  @media (max-width: 480px) {
    .changes-panel {
      margin: 1rem;
      min-width: auto;
      max-width: none;
      padding: 1.5rem;
    }
    
    .time-text .main-text {
      font-size: 1rem;
    }
    
    .change-text {
      font-size: 0.85rem;
    }
    
    .mini-block {
      width: 24px;
      height: 18px;
      font-size: 10px;
    }

    .block-preview {
      gap: 0.25rem;
    }
  }
</style>