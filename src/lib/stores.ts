import { writable } from 'svelte/store';
import { nanoid } from 'nanoid'; // Uma biblioteca minúscula para gerar IDs únicos

// --- A Planta de um Bloco ---
// Define a estrutura de cada peça de LEGO no nosso sistema.
export interface Block {
  id: string; // ID único para cada bloco (Header1, ProfileCard2, etc.)
  type: 'Header' | 'ProfileCard' | 'LinkList'; // O tipo do bloco
  props: any; // As propriedades específicas daquele bloco (título, cor, etc.)
}

// --- O Cérebro ---
// Criamos um 'writable store', que é uma caixa reativa onde guardaremos nossa lista de blocos.
// Qualquer parte da nossa aplicação pode 'ouvir' as mudanças nesta caixa.
// O <Block[]> diz que a caixa só pode conter um array de Blocos.
export const blocks = writable<Block[]>([]);

// --- Funções para Manipular o Cérebro ---

// Adiciona um novo bloco à nossa tela de pintura
export function addBlock(type: Block['type']) {
  const newBlock: Block = {
    id: nanoid(), // Gera um ID aleatório como 'V1StGXR8_Z5jdHi6B-myT'
    type: type,
    props: getInitialProps(type)
  };

  // O método 'update' do store nos permite alterar o valor dentro da caixa
  blocks.update(currentBlocks => {
    return [...currentBlocks, newBlock]; // Adiciona o novo bloco ao final da lista
  });
}

// Retorna as propriedades iniciais para cada tipo de bloco
function getInitialProps(type: Block['type']) {
  switch (type) {
    case 'Header':
      return {
        titulo: 'Título Lendário',
        corDeFundo: '#000000',
        corDoTexto: '#FFFFFF',
        tamanhoDaFonte: 3
      };
    case 'ProfileCard':
      return {
        imageUrl: 'https://placehold.co/128x128/111827/ffffff?text=Lenda',
        nome: 'Seu Nome',
        bio: 'Construindo o futuro.'
      };
    case 'LinkList':
      return {
        links: [
          { text: 'Visão', url: '#' },
          { text: 'Engenharia', url: '#' }
        ]
      };
    default:
      return {};
  }
}
// ... (todo o código anterior)

// Nova memória para guardar o ID do bloco que está selecionado
export const selectedBlockId = writable<string | null>(null);
// Precisamos instalar o nanoid para gerar os IDs
// npm install nanoid