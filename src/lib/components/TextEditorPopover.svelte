<script lang="ts">
  import { popoverState, hidePopover } from '$lib/popoverStore';
  import { updateBlockProps, blocks } from '$lib/stores';
  import { derived } from 'svelte/store';
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';
  import { onDestroy } from 'svelte'; // Importar onDestroy

  let popoverElement: HTMLDivElement;
  let top = 0;
  let left = 0;
  let isEditing = false;
  let currentTargetElement: HTMLElement | null = null; // Para manter referência do elemento atual

  const activeBlock = derived(
    [blocks, popoverState],
    ([$blocks, $popoverState]) =>
      $blocks.find(b => b.id === $popoverState.blockId)
  );

  // Função para adicionar os event listeners
  function addEventListeners(element: HTMLElement) {
    if (element) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
    }
  }

  // Função para remover os event listeners
  function removeEventListeners(element: HTMLElement | null) {
    if (element) {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    }
  }

  // Efeito reativo para gerenciar o targetElement e seus listeners
  $: {
    // Quando o popoverState.targetElement muda
    if ($popoverState.targetElement !== currentTargetElement) {
      // Remove listeners do elemento anterior, se houver
      removeEventListeners(currentTargetElement);
      // Atualiza o elemento atual
      currentTargetElement = $popoverState.targetElement;
      // Adiciona listeners ao novo elemento
      if (currentTargetElement) {
        addEventListeners(currentTargetElement);
        // Se o novo target já estiver focado, define isEditing como true
        if (document.activeElement === currentTargetElement) {
            isEditing = true;
        } else {
            isEditing = false; // Garante que isEditing esteja false ao mudar de target, se não estiver focado
        }
      } else {
        isEditing = false; // Se não há targetElement, não está editando
      }
    }

    // Lógica de posicionamento (já estava boa, só garantindo que esteja aqui)
    if ($popoverState.visible && currentTargetElement && browser) {
      const rect = currentTargetElement.getBoundingClientRect();
      top = rect.top + window.scrollY - 90; // Ajustado de 70 para 90 (você pode ajustar este valor)
      left = rect.left + window.scrollX + rect.width / 2;
    } else {
      isEditing = false; // Se o popover não está visível, não estamos editando
    }
  }

  function handleFocus() {
    isEditing = true;
  }

  function handleBlur() {
    // Pequeno delay para permitir cliques nos botões do popover antes de esconder
    // Verifica se o foco saiu do elemento editável E não foi para o próprio popover
    setTimeout(() => {
      if (currentTargetElement && !currentTargetElement.contains(document.activeElement) && !popoverElement.contains(document.activeElement)) {
        isEditing = false;
      }
    }, 50);
  }

  // Garante que os listeners sejam removidos quando o componente é destruído
  onDestroy(() => {
    removeEventListeners(currentTargetElement);
  });

  $: stylePropName = $popoverState.stylePropName;
  $: isTextEditMode = stylePropName && (stylePropName.endsWith('Style') && stylePropName !== 'corDeFundoStyle');
  $: isBgEditMode = stylePropName === 'corDeFundoStyle';

  $: currentStyle = $activeBlock && isTextEditMode ? ($activeBlock.props[stylePropName] || {}) : {};
  $: currentBgColor = $activeBlock ? $activeBlock.props.corDeFundo : '#000000';

  function updateStyle(newStyle: Partial<typeof currentStyle>) {
    if ($activeBlock && stylePropName) {
      const updatedStyle = { ...currentStyle, ...newStyle };
      updateBlockProps($activeBlock.id, { [stylePropName]: updatedStyle });
    }
  }

  function updateBgColor(newColor: string) {
    if ($activeBlock) {
      updateBlockProps($activeBlock.id, { corDeFundo: newColor });
    }
  }

  function insertEmoji(emoji: string) {
    if (currentTargetElement) { // Usar currentTargetElement
      const el = currentTargetElement;
      el.focus();
      document.execCommand('insertText', false, emoji);
      el.dispatchEvent(new Event('input', { bubbles: true })); // Simula um evento de input
    }
  }

  const emojis = ['😊', '🚀', '💡', '❤️', '✅','😀','😃','😄','😁',
  '😆','🤣','😅','😂','🫠','🥰','😍','😡','😭','👍','👎','❤️'];
  const fontOptions = ['Default', 'Roboto', 'Montserrat', 'Lora', 'Playfair Display', 'Poppins'];
</script>

{#if $popoverState.visible && $activeBlock}
  <div
    bind:this={popoverElement}
    class="popover"
    class:editing={isEditing}
    style="top: {top}px; left: {left}px;"
    transition:fade={{ duration: 150 }}
    on:click|stopPropagation
    on:mousedown|stopPropagation
  >
    {#if isTextEditMode}
      <input type="color" title="Cor da Fonte" value={currentStyle.color || '#000000'} on:input={(e) => updateStyle({ color: e.currentTarget.value })} />
      <select class="font-select" title="Fonte" on:change={(e) => updateStyle({ fontFamily: e.currentTarget.value })}>
        {#each fontOptions as font}
          <option value={font} selected={currentStyle.fontFamily === font}>{font}</option>
        {/each}
      </select>
      <div class="size-control">
        <input type="number" min="0.5" max="10" step="0.1" value={currentStyle.fontSize || 1} on:input={(e) => updateStyle({ fontSize: parseFloat(e.currentTarget.value) })} />
        <span>rem</span>
      </div>
      <button class="style-btn" class:active={currentStyle.bold} on:click={() => updateStyle({ bold: !currentStyle.bold })} title="Negrito"><b>B</b></button>
      <button class="style-btn" class:active={currentStyle.italic} on:click={() => updateStyle({ italic: !currentStyle.italic })} title="Itálico"><i>I</i></button>
      <div class="emoji-dropdown">
        <button class="emoji-btn">😀</button>
        <div class="emoji-content">
          {#each emojis as emoji}
            <button on:click={() => insertEmoji(emoji)}>{emoji}</button>
          {/each}
        </div>
      </div>

    {:else if isBgEditMode}
      <label for="bg-color">Cor de Fundo</label>
      <input id="bg-color" type="color" title="Cor de Fundo" value={currentBgColor} on:input={(e) => updateBgColor(e.currentTarget.value)} />
    {/if}

    <button class="close-btn" on:click={hidePopover}>×</button>
  </div>
{/if}

<style>
.popover {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: #262626;
  color: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 200;
  transition: opacity 0.2s ease-in-out;
  opacity: 1;
}

.popover.editing {
  opacity: 0.5;
}

/* Restante do seu CSS para o popover */
.font-select { background: #3f3f3f; color: white; border: 1px solid #525252; border-radius: 4px; padding: 4px 8px; }
.size-control { display: flex; align-items: center; background: #3f3f3f; border: 1px solid #525252; border-radius: 4px; }
.size-control input { width: 40px; background: transparent; color: white; border: none; padding: 4px; -moz-appearance: textfield; }
.size-control span { padding-right: 6px; font-size: 12px; opacity: 0.7; }
.style-btn { background: #3f3f3f; color: white; border: 1px solid #525252; border-radius: 4px; width: 30px; height: 30px; cursor: pointer; }
.style-btn.active { background: #60a5fa; border-color: #60a5fa; }
.emoji-dropdown { position: relative; }
.emoji-btn { background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; }
.emoji-content { display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #262626; border-radius: 8px; padding: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.emoji-dropdown:hover .emoji-content { display: flex; }
.emoji-content button { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 4px; }
input[type="color"] { width: 28px; height: 28px; border: none; border-radius: 50%; overflow: hidden; }
input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
input[type="color"]::-webkit-color-swatch { border: 2px solid #525252; border-radius: 50%; }
label { font-size: 12px; opacity: 0.8; }
.close-btn { background: #525252; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; line-height: 20px; text-align: center; cursor: pointer; margin-left: 8px; }
</style>