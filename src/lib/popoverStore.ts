import { writable } from 'svelte/store';

interface PopoverState {
  visible: boolean;
  blockId: string | null;
  targetElement: HTMLElement | null;
  stylePropName: string | null; // ex: 'tituloStyle', 'nomeStyle'
}

export const popoverState = writable<PopoverState>({
  visible: false,
  blockId: null,
  targetElement: null,
  stylePropName: null
});

export function showPopover(blockId: string, targetElement: HTMLElement, stylePropName: string) {
  popoverState.set({ visible: true, blockId, targetElement, stylePropName });
}

export function hidePopover() {
  popoverState.update(s => ({ ...s, visible: false }));
}