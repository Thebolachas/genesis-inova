import { writable, type Writable, get } from 'svelte/store';
import { nanoid } from 'nanoid';
import { browser } from '$app/environment';
import { dequal } from 'dequal';

// --- Interfaces ---
export interface Block {
  id: string;
  type: 'Header' | 'ProfileCard' | 'LinkList' | 'RichText' | 'ImageBlock';
  props: any;
}

export interface GlobalStyles {
  fontFamily: 'Roboto' | 'Montserrat' | 'Lora';
}

// --- Valores Padrão para Estilos ---
const defaultStyles = {
  tituloStyle: { color: '#1f2937', fontSize: 1.75, fontFamily: 'Default', bold: true, italic: false },
  textoStyle: { color: '#4b5563', fontSize: 1, fontFamily: 'Default', bold: false, italic: false },
  legendaStyle: { color: '#6b7280', fontSize: 1, fontFamily: 'Default', bold: false, italic: true },
  nomeStyle: { color: '#2c3e50', fontSize: 2, fontFamily: 'Default', bold: true, italic: false },
  bioStyle: { color: '#374151', fontSize: 1, fontFamily: 'Default', bold: false, italic: false },
  headerTituloStyle: { color: '#ffffff', fontSize: 3, fontFamily: 'Default', bold: true, italic: false }
};

function getInitialProps(type: Block['type']) {
  switch (type) {
    case 'Header': 
      return { 
        titulo: 'Título da Página', 
        corDeFundo: '#1f2937',
        tituloStyle: defaultStyles.headerTituloStyle,
        geometry: { width: 8, depth: 2, height: 'plate' } 
      };
    case 'ProfileCard': 
      return { 
        imageUrl: 'https://placehold.co/128x128/e0e7ff/3730a3?text=Eu', 
        nome: 'Seu Nome', 
        bio: 'Uma biografia concisa e impactante.',
        styleVariant: 'top',
        nomeStyle: defaultStyles.nomeStyle,
        bioStyle: defaultStyles.bioStyle,
        geometry: { width: 4, depth: 4, height: 'brick' } 
      };
    case 'LinkList': 
      return { links: [ { text: 'Link Principal', url: '#' } ], geometry: { width: 6, depth: 2, height: 'brick' } };
    case 'RichText': 
      return { 
        titulo: 'Seção de Destaque', 
        texto: 'Descreva aqui os benefícios do seu produto, serviço ou ideia. Use este espaço para convencer seus visitantes.',
        tituloStyle: defaultStyles.tituloStyle,
        textoStyle: defaultStyles.textoStyle,
        geometry: { width: 6, depth: 4, height: 'brick' } 
      };
    case 'ImageBlock': 
      return { 
        imageUrl: 'https://placehold.co/800x450/cccccc/444444?text=Imagem', 
        legenda: 'Uma legenda descritiva para a imagem.',
        legendaStyle: defaultStyles.legendaStyle,
        geometry: { width: 8, depth: 4, height: 'plate' } 
      };
    default: return {};
  }
}

// --- Lógica de Persistência Corrigida ---
const storage = browser ? window.sessionStorage : null;

function createPersistentStore<T>(key: string, startValue: T): Writable<T> {
  if (!browser) {
    return writable<T>(startValue);
  }

  const json = storage?.getItem(key);
  let initialValue = json ? JSON.parse(json) : startValue;

  if (key === 'blocks' && Array.isArray(initialValue)) {
    initialValue = initialValue.map(block => {
      const defaultProps = getInitialProps(block.type);
      if (!defaultProps) return block; // Se for um tipo de bloco desconhecido
      return {
        ...block,
        props: {
          ...defaultProps,
          ...block.props
        }
      };
    });
  }

  const store = writable<T>(initialValue);

  store.subscribe((current) => {
    storage?.setItem(key, JSON.stringify(current));
  });
  
  return store;
}

// --- Stores Principais ---
export const blocks = createPersistentStore<Block[]>('blocks', []);
export const selectedBlockId = createPersistentStore<string | null>('selectedBlockId', null);
export const activeTemplate = createPersistentStore<'card' | 'landing' | null>('activeTemplate', null);
export const globalStyles = createPersistentStore<GlobalStyles>('globalStyles', { fontFamily: 'Roboto' });
export const imageFiles = writable<{ [blockId: string]: File }>({});

// --- MAESTRO DO TEMPO: Stores de Histórico ---
const MAX_HISTORY = 50;
export const history = writable<Block[][]>([[]]);
export const historyIndex = writable<number>(0);

const blocksWithHistory = {
    set(newBlocks: Block[]) {
        const currentBlocks = get(blocks);
        if (!dequal(newBlocks, currentBlocks)) {
            history.update(h => {
                const currentIndex = get(historyIndex);
                const newHistory = h.slice(0, currentIndex + 1);
                newHistory.push(newBlocks);
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

function addImageFile(blockId: string, file: File) {
    imageFiles.update(files => ({ ...files, [blockId]: file }));
}

export function resetBlocks() {
  blocksWithHistory.set([]);
  selectedBlockId.set(null);
  globalStyles.set({ fontFamily: 'Roboto' });
  imageFiles.set({});
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

export function handleImageUpload(event: Event, blockId: string) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    addImageFile(blockId, file);
    const tempUrl = URL.createObjectURL(file);
    updateBlockProps(blockId, { imageUrl: tempUrl });
  }
}

export function handleDndUpdate(event: CustomEvent<{ items: Block[], info: any }>) {
    blocksWithHistory.set(event.detail.items);
}