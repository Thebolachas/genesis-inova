import { writable, type Writable } from 'svelte/store';
import { nanoid } from 'nanoid';
import { browser } from '$app/environment';

export interface Block {
  id: string;
  type: 'Header' | 'ProfileCard' | 'LinkList' | 'RichText' | 'ImageBlock';
  props: any;
}

export interface GlobalStyles {
  fontFamily: 'Roboto' | 'Montserrat' | 'Lora';
}

const storage = browser ? window.sessionStorage : null;
function createPersistentStore<T>(key: string, startValue: T): Writable<T> {
  const { subscribe, set, update } = writable<T>(startValue);
  if (browser) {
    const json = storage?.getItem(key);
    if (json) { set(JSON.parse(json)); }
    subscribe((current) => { storage?.setItem(key, JSON.stringify(current)); });
  }
  return { subscribe, set, update };
}

export const blocks = createPersistentStore<Block[]>('blocks', []);
export const selectedBlockId = createPersistentStore<string | null>('selectedBlockId', null);
export const activeTemplate = createPersistentStore<'card' | 'landing' | null>('activeTemplate', null);
export const globalStyles = createPersistentStore<GlobalStyles>('globalStyles', { fontFamily: 'Roboto' });

export function resetBlocks() {
  blocks.set([]);
  selectedBlockId.set(null);
  globalStyles.set({ fontFamily: 'Roboto' });
}

export function addBlock(type: Block['type']) {
  const newBlock: Block = { id: nanoid(), type: type, props: getInitialProps(type) };
  blocks.update(currentBlocks => [...currentBlocks, newBlock]);
}

// --- ALTERAÇÃO: A função 'removeBlock' foi apagada daqui ---

function getInitialProps(type: Block['type']) {
  switch (type) {
    case 'Header': return { titulo: 'Título da Página', corDeFundo: '#1f2937', corDoTexto: '#ffffff', tamanhoDaFonte: 3, geometry: { width: 8, depth: 2, height: 'plate' } };
    case 'ProfileCard':
      return {
        imageUrl: 'https://placehold.co/128x128/e0e7ff/3730a3?text=Eu',
        nome: 'Seu Nome',
        bio: 'Uma biografia concisa e impactante.',
        geometry: { width: 4, depth: 4, height: 'brick' },
        styleVariant: 'top'
      };
    case 'LinkList': return { links: [ { text: 'Link Principal', url: '#' } ], geometry: { width: 6, depth: 2, height: 'brick' } };
    case 'RichText': return { titulo: 'Seção de Destaque', texto: 'Descreva aqui os benefícios do seu produto...', geometry: { width: 6, depth: 4, height: 'brick' } };
    case 'ImageBlock': return { imageUrl: 'https://placehold.co/800x450/cccccc/444444?text=Imagem', legenda: 'Uma legenda descritiva.', geometry: { width: 8, depth: 4, height: 'plate' } };
    default: return {};
  }
}