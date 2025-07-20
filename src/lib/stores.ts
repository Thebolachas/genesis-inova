import { writable, type Writable, get } from 'svelte/store';
import { nanoid } from 'nanoid';
import { browser } from '$app/environment';
import { dequal } from 'dequal';

// --- Interfaces (sem alterações) ---
export interface Block {
  id: string;
  type: 'Header' | 'ProfileCard' | 'LinkList' | 'RichText' | 'ImageBlock';
  props: any;
}

export interface GlobalStyles {
  fontFamily: 'Roboto' | 'Montserrat' | 'Lora';
}

// --- Lógica de Persistência (sem alterações) ---
const storage = browser ? window.sessionStorage : null;
function createPersistentStore<T>(key: string, startValue: T): Writable<T> {
  const { subscribe, set, update } = writable<T>(startValue);
  if (browser) {
    const json = storage?.getItem(key);
    if (json) { set(JSON.parse(json)); }
    
    subscribe((current) => {
        // MAESTRO DO TEMPO: Apenas o estado atual é persistido
        storage?.setItem(key, JSON.stringify(current));
    });
  }
  return { subscribe, set, update };
}

// --- Stores Principais ---
export const blocks = createPersistentStore<Block[]>('blocks', []);
export const selectedBlockId = createPersistentStore<string | null>('selectedBlockId', null);
export const activeTemplate = createPersistentStore<'card' | 'landing' | null>('activeTemplate', null);
export const globalStyles = createPersistentStore<GlobalStyles>('globalStyles', { fontFamily: 'Roboto' });
export const imageFiles = writable<{ [blockId: string]: File }>({});

// --- MAESTRO DO TEMPO: Stores de Histórico ---
const MAX_HISTORY = 50;
export const history = writable<Block[][]>([[]]); // Array de estados dos blocos
export const historyIndex = writable<number>(0); // Ponteiro para o estado atual no histórico

// --- Wrapper para a Store de Blocos que atualiza o histórico ---
const blocksWithHistory = {
    set(newBlocks: Block[]) {
        const currentBlocks = get(blocks);
        // Só adiciona ao histórico se o estado realmente mudou
        if (!dequal(newBlocks, currentBlocks)) {
            history.update(h => {
                const currentIndex = get(historyIndex);
                // Apaga o "futuro" se estamos a fazer uma alteração a partir do meio da linha do tempo
                const newHistory = h.slice(0, currentIndex + 1);
                newHistory.push(newBlocks);
                // Limita o tamanho do histórico
                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                }
                historyIndex.set(newHistory.length - 1);
                return newHistory;
            });
        }
        blocks.set(newBlocks);
    },
    update(updater: (current: Block[]) => Block[]) {
        const newBlocks = updater(get(blocks));
        this.set(newBlocks);
    },
    subscribe: blocks.subscribe
};

// --- Funções do Maestro do Tempo ---
export function undo() {
    const h = get(history);
    const currentIndex = get(historyIndex);
    if (currentIndex > 0) {
        const newIndex = currentIndex - 1;
        historyIndex.set(newIndex);
        blocks.set(h[newIndex]);
    }
}

export function redo() {
    const h = get(history);
    const currentIndex = get(historyIndex);
    if (currentIndex < h.length - 1) {
        const newIndex = currentIndex + 1;
        historyIndex.set(newIndex);
        blocks.set(h[newIndex]);
    }
}

// --- Funções de Manipulação de Blocos (AGORA USAM O WRAPPER) ---
export function addImageFile(blockId: string, file: File) {
    imageFiles.update(files => ({ ...files, [blockId]: file }));
}

export function resetBlocks() {
  blocksWithHistory.set([]);
  selectedBlockId.set(null);
  globalStyles.set({ fontFamily: 'Roboto' });
  imageFiles.set({});
  // Reinicia o histórico
  history.set([[]]);
  historyIndex.set(0);
}

export function addBlock(type: Block['type']) {
  const newBlock: Block = { id: nanoid(), type: type, props: getInitialProps(type) };
  blocksWithHistory.update(currentBlocks => [...currentBlocks, newBlock]);
}

export function removeBlock(id: string) {
  blocksWithHistory.update(currentBlocks => currentBlocks.filter(b => b.id !== id));
  selectedBlockId.update(currentId => (currentId === id ? null : currentId));
}

export function updateBlockProps(id: string, newProps: Partial<Block['props']>) {
    blocksWithHistory.update(currentBlocks => {
        return currentBlocks.map(b => 
            b.id === id ? { ...b, props: { ...b.props, ...newProps } } : b
        );
    });
}

// Re-exporta `dndzone` para que use a nossa lógica de histórico
export function handleDndUpdate(event: CustomEvent<{ items: Block[], info: any }>) {
    blocksWithHistory.set(event.detail.items);
}

// --- Get Initial Props (sem alterações) ---
function getInitialProps(type: Block['type']) {
  switch (type) {
    case 'Header': return { titulo: 'Título da Página', corDeFundo: '#1f2937', corDoTexto: '#ffffff', tamanhoDaFonte: 3, geometry: { width: 8, depth: 2, height: 'plate' } };
    case 'ProfileCard': return { imageUrl: 'https://placehold.co/128x128/e0e7ff/3730a3?text=Eu', nome: 'Seu Nome', bio: 'Uma biografia concisa e impactante.', geometry: { width: 4, depth: 4, height: 'brick' }, styleVariant: 'top' };
    case 'LinkList': return { links: [ { text: 'Link Principal', url: '#' } ], geometry: { width: 6, depth: 2, height: 'brick' } };
    case 'RichText': return { titulo: 'Seção de Destaque', texto: 'Descreva aqui os benefícios do seu produto...', geometry: { width: 6, depth: 4, height: 'brick' } };
    case 'ImageBlock': return { imageUrl: 'https://placehold.co/800x450/cccccc/444444?text=Imagem', legenda: 'Uma legenda descritiva.', geometry: { width: 8, depth: 4, height: 'plate' } };
    default: return {};
  }
}