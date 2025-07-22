<script lang="ts">
    import { history, historyIndex, undo, redo, blocks, getHistoryDiff } from '$lib/stores';
    import { derived } from 'svelte/store';
    import { spring, tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    // Props para callback de efeitos
    export let handleTimeTravel: ((direction: 'forward' | 'backward') => void) | undefined = undefined;

    // Deriva estados para saber se podemos desfazer ou refazer
    const canUndo = derived(historyIndex, $index => $index > 0);
    const canRedo = derived([history, historyIndex], ([$history, $index]) => $index < $history.length - 1);

    // Estados para drag e animações
    let isDragging = false;
    let dragStartX = 0;
    let currentX = 0;
    let timelineRef: HTMLElement;
    let animatedBlocks: any[] = [];
    
    // Springs para animações suaves
    const dragSpring = spring({ x: 0, scale: 1, rotation: 0 }, {
        stiffness: 0.3,
        damping: 0.6
    });

    // Estados reactivos
    $: dragOffset = isDragging ? currentX - dragStartX : 0;
    $: dragProgress = Math.max(-1, Math.min(1, dragOffset / 100));

    // Cores dos blocos por tipo de conteúdo
    const blockTypeColors = {
        'Header': '#ef4444',      // Vermelho
        'ProfileCard': '#3b82f6', // Azul  
        'LinkList': '#10b981',    // Verde
        'RichText': '#f59e0b',    // Amarelo
        'ImageBlock': '#8b5cf6'   // Roxo
    };

    // Função para obter cor do bloco baseada no conteúdo
    function getBlockColor(index: number): string {
        const historyState = $history[index] || [];
        
        if (historyState.length === 0) return '#6b7280'; // Cinza para vazio
        
        // Se tem apenas um tipo, usar sua cor
        const types = [...new Set(historyState.map(block => block.type))];
        if (types.length === 1) {
            return blockTypeColors[types[0]] || '#9ca3af';
        }
        
        // Mix de tipos - usar gradiente ou cor neutra mais vibrante
        return '#a855f7'; // Roxo para mix
    }

    // Função para calcular tamanho do bloco baseado no conteúdo
    function getBlockSize(index: number): { width: number; height: number } {
        const historyState = $history[index] || [];
        const blockCount = historyState.length;
        
        if (blockCount === 0) return { width: 28, height: 20 }; // Pequeno para vazio
        if (blockCount <= 2) return { width: 32, height: 24 }; // Médio
        if (blockCount <= 4) return { width: 36, height: 28 }; // Grande
        return { width: 40, height: 32 }; // Extra grande
    }

    // Função para iniciar drag
    function handleDragStart(event: MouseEvent, index: number) {
        if (index !== $historyIndex) return;
        
        event.preventDefault();
        isDragging = true;
        dragStartX = event.clientX;
        currentX = event.clientX;
        
        dragSpring.set({ x: 0, scale: 1.2, rotation: 0 });
        
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    }

    // Função para movimento durante drag
    function handleDragMove(event: MouseEvent) {
        if (!isDragging) return;
        currentX = event.clientX;
        
        const clampedOffset = Math.max(-150, Math.min(150, dragOffset));
        const scale = 1.2 + Math.abs(clampedOffset) / 300;
        const rotation = clampedOffset / 10;
        
        dragSpring.set({ 
            x: clampedOffset, 
            scale: Math.min(scale, 1.5),
            rotation: Math.max(-15, Math.min(15, rotation))
        });
    }

    // Função para finalizar drag
    function handleDragEnd() {
        if (!isDragging) return;
        
        const finalOffset = currentX - dragStartX;
        const threshold = 70;
        
        let actionPerformed = false;
        
        if (Math.abs(finalOffset) > threshold) {
            if (finalOffset < -threshold && $canUndo) {
                // Undo com efeito
                triggerTimeTravel('backward');
                undo();
                actionPerformed = true;
            } else if (finalOffset > threshold && $canRedo) {
                // Redo com efeito  
                triggerTimeTravel('forward');
                redo();
                actionPerformed = true;
            }
        }
        
        // Reset spring suavemente
        dragSpring.set({ x: 0, scale: 1, rotation: 0 });
        
        // Cleanup
        isDragging = false;
        currentX = 0;
        dragStartX = 0;
        
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }

    // Função para criar efeito de viagem no tempo
    function triggerTimeTravel(direction: 'forward' | 'backward') {
        const currentBlocks = $blocks;
        
        // Criar blocos voadores
        currentBlocks.forEach((block, index) => {
            setTimeout(() => {
                createFlyingBlock(block, direction, index);
            }, index * 50); // Stagger o aparecimento
        });

        // Chamar callback se existir
        handleTimeTravel?.(direction);
    }

    // Criar bloco voador com animação
    function createFlyingBlock(block: any, direction: 'forward' | 'backward', delay: number) {
        const rect = timelineRef?.getBoundingClientRect();
        if (!rect) return;

        const flyingBlock = {
            id: `flying-${block.id}-${Date.now()}-${Math.random()}`,
            type: block.type,
            color: blockTypeColors[block.type] || '#9ca3af',
            direction,
            startX: rect.left + rect.width / 2 + Math.random() * 100 - 50,
            startY: rect.top + Math.random() * 50,
            scale: 0.3 + Math.random() * 0.4,
            rotation: Math.random() * 360,
            duration: 800 + Math.random() * 400
        };

        animatedBlocks = [...animatedBlocks, flyingBlock];

        // Remover após animação
        setTimeout(() => {
            animatedBlocks = animatedBlocks.filter(b => b.id !== flyingBlock.id);
        }, flyingBlock.duration);
    }

    // Calcular estilo do bloco ativo
    function getActiveBlockStyle(): string {
        if (!isDragging) return '';
        return `transform: translateX(${$dragSpring.x}px) scale(${$dragSpring.scale}) rotate(${$dragSpring.rotation}deg)`;
    }

    // Indicador de direção
    function getDirectionHint(): string {
        if (!isDragging || Math.abs(dragOffset) < 30) return '';
        
        if (dragOffset < -30) {
            return $canUndo ? '⬅️ Voltar no Tempo' : '⬅️ Impossível';
        }
        if (dragOffset > 30) {
            return $canRedo ? '➡️ Avançar no Tempo' : '➡️ Impossível';
        }
        
        return '';
    }

    // Função para pular diretamente para um estado
    function jumpToState(targetIndex: number) {
        if (targetIndex === $historyIndex) return;
        
        const direction = targetIndex > $historyIndex ? 'forward' : 'backward';
        
        // Criar efeito visual
        triggerTimeTravel(direction);
        
        // Navegar para o estado
        historyIndex.set(targetIndex);
        blocks.set($history[targetIndex] || []);
    }
</script>

<div class="maestro-container" bind:this={timelineRef}>
    <!-- Botão Undo -->
    <button 
        class="maestro-button undo" 
        on:click={() => {
            triggerTimeTravel('backward');
            undo();
        }}
        disabled={!$canUndo} 
        title="Voltar no Tempo (Ctrl+Z)"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.5,8C9.85,8,7.45,9,5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22,10.54,10.5,12.5,10.5C16.04,10.5,19.05,12.81,20.1,16L22.47,15.22C21.08,11.03,17.15,8,12.5,8Z" />
        </svg>
    </button>
    
    <!-- Timeline Principal -->
    <div class="timeline">
        <!-- Indicador de direção durante drag -->
        {#if isDragging}
            <div class="direction-hint">
                {getDirectionHint()}
            </div>
        {/if}
        
        <!-- Dica de uso -->
        <div class="usage-hint" class:visible={$history.length > 1 && !isDragging}>
            ← Arraste o bloco ativo para viajar no tempo →
        </div>
        
        <!-- Trilha LEGO -->
        <div class="lego-track">
            {#each $history as historyState, i (i)}
                {@const blockSize = getBlockSize(i)}
                <div 
                    class="lego-block" 
                    class:active={i === $historyIndex}
                    class:can-drag={i === $historyIndex}
                    class:past={i < $historyIndex}
                    class:future={i > $historyIndex}
                    style="
                        background-color: {getBlockColor(i)};
                        width: {blockSize.width}px;
                        height: {blockSize.height}px;
                        {i === $historyIndex ? getActiveBlockStyle() : ''}
                    "
                    on:mousedown={(e) => handleDragStart(e, i)}
                    on:click={() => jumpToState(i)}
                    role="button"
                    tabindex={0}
                    title="Estado {i + 1} ({historyState?.length || 0} bloco{historyState?.length !== 1 ? 's' : ''}) - {i === $historyIndex ? 'ATUAL' : i < $historyIndex ? 'Passado' : 'Futuro'}"
                >
                    <!-- Conectores LEGO adaptativos -->
                    <div class="lego-studs" style="gap: {Math.max(4, blockSize.width / 8)}px">
                        {#each Array(Math.min(4, Math.max(2, Math.floor(blockSize.width / 12)))) as _, studIndex}
                            <div class="stud" style="width: {Math.max(6, blockSize.width / 8)}px; height: {Math.max(6, blockSize.width / 8)}px"></div>
                        {/each}
                    </div>
                    
                    <!-- Contador de blocos -->
                    <div class="block-count">
                        {historyState?.length || 0}
                    </div>
                    
                    <!-- Efeitos visuais do bloco ativo -->
                    {#if i === $historyIndex}
                        <div class="active-glow"></div>
                        <div class="time-ripple"></div>
                    {/if}
                    
                    <!-- Setas de conexão -->
                    {#if i < $history.length - 1}
                        <div class="connection-arrow" class:active-path={i < $historyIndex}></div>
                    {/if}
                </div>
            {/each}
        </div>
        
        <!-- Status do histórico -->
        <div class="history-status">
            {$historyIndex + 1} de {$history.length} estados
        </div>
    </div>

    <!-- Botão Redo -->
    <button 
        class="maestro-button redo" 
        on:click={() => {
            triggerTimeTravel('forward');
            redo();
        }}
        disabled={!$canRedo} 
        title="Avançar no Tempo (Ctrl+Y)"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.4,10.6C16.55,9,14.15,8,11.5,8C6.85,8,2.92,11.03,1.54,15.22L3.9,16C4.95,12.81,7.95,10.5,11.5,10.5C13.45,10.5,15.23,11.22,16.62,12.38L13,16H22V7L18.4,10.6Z" />
        </svg>
    </button>
</div>

<!-- Blocos voadores -->
{#each animatedBlocks as flyingBlock (flyingBlock.id)}
    <div 
        class="flying-block"
        style="
            left: {flyingBlock.startX}px;
            top: {flyingBlock.startY}px;
            background-color: {flyingBlock.color};
            transform: scale({flyingBlock.scale}) rotate({flyingBlock.rotation}deg);
            --end-x: {flyingBlock.direction === 'forward' ? '100vw' : '-100px'};
            --duration: {flyingBlock.duration}ms;
        "
    >
        <div class="mini-studs">
            <div class="mini-stud"></div>
            <div class="mini-stud"></div>
        </div>
    </div>
{/each}

<style>
    .maestro-container {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 75px;
        background: linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98));
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 
            0 -8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        padding: 0 2rem;
        box-sizing: border-box;
    }

    .maestro-button {
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        border: 2px solid rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        padding: 0.75rem;
        border-radius: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }

    .maestro-button:disabled {
        background: linear-gradient(145deg, rgba(75, 85, 99, 0.2), rgba(75, 85, 99, 0.1));
        border-color: rgba(75, 85, 99, 0.3);
        color: #6b7280;
        cursor: not-allowed;
    }

    .maestro-button:not(:disabled):hover {
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
        border-color: rgba(255, 255, 255, 0.4);
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .maestro-button.undo:not(:disabled):hover {
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
    }

    .maestro-button.redo:not(:disabled):hover {
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }

    .maestro-button svg {
        width: 22px;
        height: 22px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }

    .timeline {
        flex-grow: 1;
        position: relative;
        height: 100%;
        overflow: visible;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .direction-hint {
        position: absolute;
        top: -45px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(31, 41, 55, 0.9));
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 25px;
        font-size: 13px;
        font-weight: 600;
        z-index: 30;
        white-space: nowrap;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .usage-hint {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        white-space: nowrap;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    }

    .usage-hint.visible {
        opacity: 1;
    }

    .lego-track {
        display: flex;
        align-items: center;
        gap: 1rem;
        height: 50px;
        justify-content: center;
        padding: 0 1rem;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .lego-track::-webkit-scrollbar {
        display: none;
    }

    .lego-block {
        background-color: #9ca3af;
        border-radius: 8px;
        position: relative;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
        user-select: none;
        overflow: visible;
    }

    .lego-block.past {
        opacity: 0.6;
        filter: saturate(0.7);
    }

    .lego-block.future {
        opacity: 0.5;
        filter: saturate(0.5) brightness(1.1);
    }

    .lego-block.can-drag {
        cursor: grab;
    }

    .lego-block.can-drag:active {
        cursor: grabbing;
    }

    .lego-block.active {
        border-color: rgba(255, 255, 255, 0.9);
        box-shadow: 
            0 0 30px rgba(255, 255, 255, 0.6),
            0 8px 25px rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.3);
        z-index: 20;
        filter: saturate(1.2) brightness(1.1);
        opacity: 1;
    }

    .lego-block:hover:not(.active) {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 
            0 6px 20px rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }

    .lego-studs {
        position: absolute;
        top: -5px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        z-index: 1;
    }

    .stud {
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
        border-radius: 50%;
        box-shadow: 
            inset 0 1px 3px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .block-count {
        position: absolute;
        bottom: -18px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 800;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(31, 41, 55, 0.6));
        border-radius: 10px;
        padding: 3px 8px;
        min-width: 18px;
        text-align: center;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .active-glow {
        position: absolute;
        inset: -4px;
        border: 3px solid rgba(255, 255, 255, 0.5);
        border-radius: 12px;
        animation: activeGlow 2s infinite;
        pointer-events: none;
    }

    .time-ripple {
        position: absolute;
        inset: -8px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        animation: timeRipple 3s infinite;
        pointer-events: none;
    }

    @keyframes activeGlow {
        0%, 100% {
            opacity: 0.7;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
    }

    @keyframes timeRipple {
        0% {
            opacity: 0;
            transform: scale(0.8);
        }
        50% {
            opacity: 0.5;
            transform: scale(1.1);
        }
        100% {
            opacity: 0;
            transform: scale(1.3);
        }
    }

    .connection-arrow {
        position: absolute;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 2px;
        background: rgba(255, 255, 255, 0.3);
        transition: all 0.3s;
    }

    .connection-arrow.active-path {
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
    }

    .connection-arrow::after {
        content: '';
        position: absolute;
        right: -3px;
        top: -1px;
        border: 2px solid transparent;
        border-left: 3px solid currentColor;
        color: inherit;
    }

    .history-status {
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: rgba(255, 255, 255, 0.6);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        white-space: nowrap;
    }

    .flying-block {
        position: fixed;
        width: 20px;
        height: 16px;
        border-radius: 3px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        animation: flyAway var(--duration) ease-out forwards;
    }

    @keyframes flyAway {
        0% {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(var(--scale, 1)) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translateX(var(--end-x)) translateY(-200px) scale(0.1) rotate(720deg);
        }
    }

    .mini-studs {
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 3px;
    }

    .mini-stud {
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
    }

    /* Responsividade */
    @media (max-width: 768px) {
        .maestro-container {
            height: 70px;
            gap: 1rem;
            padding: 0 1rem;
        }
        
        .maestro-button {
            padding: 0.6rem;
        }
        
        .maestro-button svg {
            width: 18px;
            height: 18px;
        }

        .lego-track {
            gap: 0.75rem;
        }
    }
</style>