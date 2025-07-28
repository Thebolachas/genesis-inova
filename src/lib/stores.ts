// src/lib/stores.ts

import { writable, type Writable, get, readable } from 'svelte/store';
import { nanoid } from 'nanoid';
import { browser } from '$app/environment';
import { dequal } from 'dequal';
import JSZip from 'jszip';

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

// --- Lógica de Persistência ---
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
      if (!defaultProps) return block;
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
export const imageStorage = writable<{ 
  [blockId: string]: { 
    blobUrl: string,
    base64: string,
    filename: string,
    type: string 
  } 
}>({});

// --- Histórico (Undo/Redo) ---
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

// --- Funções de Histórico ---
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

// --- Funções de Blocos ---
export function resetBlocks() {
  blocksWithHistory.set([]);
  selectedBlockId.set(null);
  globalStyles.set({ fontFamily: 'Roboto' });
  imageFiles.set({});
  imageStorage.set({});
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
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `image-${blockId}.${fileExtension}`;
    const blobUrl = URL.createObjectURL(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      imageStorage.update(storage => ({
        ...storage,
        [blockId]: {
          blobUrl: blobUrl,
          base64: base64Data,
          filename: filename,
          type: file.type
        }
      }));
    };
    reader.readAsDataURL(file);
    updateBlockProps(blockId, { imageUrl: blobUrl });
  }
}

export function handleDndUpdate(event: CustomEvent<{ items: Block[], info: any }>) {
    blocksWithHistory.set(event.detail.items);
}

// --- SISTEMA DE DOWNLOAD ---
export async function downloadSite() {
  const currentBlocks = get(blocks);
  const currentTemplate = get(activeTemplate);
  const images = get(imageStorage);
  
  if (!currentTemplate) {
    alert('Selecione um template primeiro!');
    return;
  }

  const zip = new JSZip();
  
  // ✅ NOVO: Adiciona o "DNA" do projeto ao ZIP para permitir a re-edição
  const projectData = {
    blocks: currentBlocks,
    template: currentTemplate,
  };
  zip.file('project.json', JSON.stringify(projectData, null, 2));

  if (Object.keys(images).length > 0) {
    const imagesFolder = zip.folder('images');
    for (const [, imageData] of Object.entries(images)) {
      if (imagesFolder && imageData.base64) {
        const base64Data = imageData.base64.split(',')[1];
        if (base64Data) {
          imagesFolder.file(imageData.filename, base64Data, { base64: true });
        }
      }
    }
  }
  
  const blocksForDownload = convertBlobUrlsToRelativePaths(currentBlocks, images);
  const { html, css } = generateSiteFiles(blocksForDownload, currentTemplate);
  
  zip.file('index.html', html);
  zip.file('style.css', css);
  
  const readme = generateReadme();
  zip.file('README.md', readme);
  
  try {
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `meu-site-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // ✅ NOVO: Marca no navegador que o usuário já fez um download
    if (browser) {
      localStorage.setItem('genesis-has-downloaded', 'true');
      // Dispara um evento para que a UI em outras abas (se houver) ou na mesma página
      // possa reagir à mudança de estado.
      window.dispatchEvent(new Event('storage'));
    }
    
    console.log('✅ Site baixado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ZIP:', error);
    alert('Erro ao baixar o site. Tente novamente.');
  }
}

function convertBlobUrlsToRelativePaths(blocks: Block[], images: Record<string, any>): Block[] {
  return blocks.map(block => {
    if ((block.type === 'ProfileCard' || block.type === 'ImageBlock') && block.props.imageUrl) {
      const imageData = images[block.id];
      if (imageData && block.props.imageUrl.startsWith('blob:')) {
        return {
          ...block,
          props: {
            ...block.props,
            imageUrl: `./images/${imageData.filename}`
          }
        };
      }
    }
    return block;
  });
}

function generateSiteFiles(blocks: Block[], template: 'card' | 'landing') {
  if (template === 'card') {
    return generateBusinessCard(blocks);
  } else {
    return generateLandingPage(blocks);
  }
}

function generateBusinessCard(blocks: Block[]) {
  const headerBlock = blocks.find(b => b.type === 'Header');
  const profileBlock = blocks.find(b => b.type === 'ProfileCard');
  const linkBlock = blocks.find(b => b.type === 'LinkList');
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${headerBlock?.props.titulo || 'Meu Cartão'}</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Montserrat:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
    ${headerBlock ? generateHeaderHTML(headerBlock) : ''}
    
    <main class="card-main">
        ${profileBlock ? generateProfileCardHTML(profileBlock) : ''}
        ${linkBlock ? generateLinkListHTML(linkBlock) : ''}
    </main>
</body>
</html>`;

  const css = generateBusinessCardCSS();
  
  return { html, css };
}

function generateLandingPage(blocks: Block[]) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blocks.find(b => b.type === 'Header')?.props.titulo || 'Minha Landing Page'}</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Montserrat:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
    <main class="landing-main">
        ${blocks.map(block => generateBlockHTML(block)).join('\n        ')}
    </main>
</body>
</html>`;

  const css = generateLandingPageCSS();
  
  return { html, css };
}

function generateHeaderHTML(block: Block) {
  const { titulo, corDeFundo, tituloStyle } = block.props;
  return `<header class="site-header" style="background-color: ${corDeFundo};">
        <h1 class="header-title" style="color: ${tituloStyle.color}; font-size: ${tituloStyle.fontSize}rem; font-family: ${getFontFamily(tituloStyle.fontFamily)}; font-weight: ${tituloStyle.bold ? 'bold' : 'normal'}; font-style: ${tituloStyle.italic ? 'italic' : 'normal'};">
            ${titulo}
        </h1>
    </header>`;
}

function generateProfileCardHTML(block: Block) {
  const { imageUrl, nome, bio, styleVariant, nomeStyle, bioStyle } = block.props;
  
  return `<section class="profile-card ${styleVariant === 'left' ? 'variant-left' : ''}">
        <div class="background-glow"></div>
        <img src="${imageUrl}" alt="Foto de ${nome}" class="profile-image">
        <div class="text-content">
            <h2 class="profile-name" style="color: ${nomeStyle.color}; font-size: ${nomeStyle.fontSize}rem; font-family: ${getFontFamily(nomeStyle.fontFamily)}; font-weight: ${nomeStyle.bold ? 'bold' : 'normal'}; font-style: ${nomeStyle.italic ? 'italic' : 'normal'};">
                ${nome}
            </h2>
            <p class="profile-bio" style="color: ${bioStyle.color}; font-size: ${bioStyle.fontSize}rem; font-family: ${getFontFamily(bioStyle.fontFamily)}; font-weight: ${bioStyle.bold ? 'bold' : 'normal'}; font-style: ${bioStyle.italic ? 'italic' : 'normal'};">
                ${bio}
            </p>
        </div>
    </section>`;
}

function generateImageBlockHTML(block: Block) {
  const { imageUrl, legenda, legendaStyle } = block.props;
  
  return `<figure class="imageblock-container">
        <img src="${imageUrl}" alt="${legenda}">
        ${legenda ? `<figcaption style="color: ${legendaStyle.color}; font-size: ${legendaStyle.fontSize}rem; font-family: ${getFontFamily(legendaStyle.fontFamily)}; font-weight: ${legendaStyle.bold ? 'bold' : 'normal'}; font-style: ${legendaStyle.italic ? 'italic' : 'normal'};">
            ${legenda}
        </figcaption>` : ''}
    </figure>`;
}

function generateLinkListHTML(block: Block) {
  const { links } = block.props;
  
  return `<section class="link-list">
        ${links.map((link: any) => `<a href="${link.url}" class="link-item">${link.text}</a>`).join('\n        ')}
    </section>`;
}

function generateRichTextHTML(block: Block) {
  const { titulo, texto, tituloStyle, textoStyle } = block.props;
  
  return `<section class="rich-text">
        <h2 style="color: ${tituloStyle.color}; font-size: ${tituloStyle.fontSize}rem; font-family: ${getFontFamily(tituloStyle.fontFamily)}; font-weight: ${tituloStyle.bold ? 'bold' : 'normal'}; font-style: ${tituloStyle.italic ? 'italic' : 'normal'};">
            ${titulo}
        </h2>
        <p style="color: ${textoStyle.color}; font-size: ${textoStyle.fontSize}rem; font-family: ${getFontFamily(textoStyle.fontFamily)}; font-weight: ${textoStyle.bold ? 'bold' : 'normal'}; font-style: ${textoStyle.italic ? 'italic' : 'normal'};">
            ${texto}
        </p>
    </section>`;
}

function generateBlockHTML(block: Block) {
  switch (block.type) {
    case 'Header': return generateHeaderHTML(block);
    case 'ProfileCard': return generateProfileCardHTML(block);
    case 'ImageBlock': return generateImageBlockHTML(block);
    case 'LinkList': return generateLinkListHTML(block);
    case 'RichText': return generateRichTextHTML(block);
    default: return '';
  }
}

function generateBusinessCardCSS() {
  return `/* Reset e Base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Roboto', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
}

/* Header */
.site-header {
    text-align: center;
    padding: 2rem 1rem;
    margin-bottom: 2rem;
}

.header-title {
    margin: 0;
}

/* Card Principal */
.card-main {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
}

/* Profile Card */
.profile-card {
    position: relative;
    overflow: hidden;
    padding: 2.5rem 2rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    text-align: center;
    margin-bottom: 2rem;
}

.profile-card:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 16px 45px 0 rgba(31, 38, 135, 0.15);
}

.profile-image {
    display: block;
    object-fit: cover;
    border-radius: 50%;
    width: 8rem;
    height: 8rem;
    border: 3px solid white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    margin: 0 auto 1.5rem auto;
}

.profile-name {
    margin: 0 0 0.5rem 0;
}

.profile-bio {
    margin: 0;
    line-height: 1.6;
}

.variant-left {
    display: flex;
    align-items: center;
    text-align: left;
    gap: 2rem;
}

.variant-left .profile-image {
    margin: 0;
    width: 7.5rem;
    height: 7.5rem;
    flex-shrink: 0;
}

/* Background Glow */
.background-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(101, 83, 228, 0.2), rgba(101, 83, 228, 0) 50%);
    transition: transform 1.2s cubic-bezier(0.075, 0.82, 0.165, 1);
    z-index: 1;
    transform: scale(0);
}

.profile-card:hover .background-glow {
    transform: scale(1);
}

.text-content {
    position: relative;
    z-index: 2;
}

/* Link List */
.link-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.link-item {
    display: block;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 0.5rem;
    text-decoration: none;
    color: #2563eb;
    font-weight: 500;
    text-align: center;
    transition: all 0.3s ease;
}

.link-item:hover {
    background: rgba(37, 99, 235, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

/* Responsividade */
@media (max-width: 768px) {
    .card-main {
        padding: 1rem;
    }
    
    .profile-card {
        padding: 2rem 1.5rem;
    }
    
    .variant-left {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .variant-left .profile-image {
        margin: 0 auto;
    }
}`;
}

function generateLandingPageCSS() {
  return `/* Reset e Base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Roboto', sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f8fafc;
}

/* Layout Principal */
.landing-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Header */
.site-header {
    text-align: center;
    padding: 4rem 2rem;
    margin-bottom: 3rem;
}

.header-title {
    margin: 0;
}

/* Profile Card */
.profile-card {
    position: relative;
    overflow: hidden;
    padding: 3rem 2rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    margin-bottom: 3rem;
    text-align: center;
}

.profile-image {
    display: block;
    object-fit: cover;
    border-radius: 50%;
    width: 10rem;
    height: 10rem;
    border: 4px solid white;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    margin: 0 auto 2rem auto;
}

.profile-name {
    margin: 0 0 1rem 0;
}

.profile-bio {
    margin: 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

/* Image Block */
.imageblock-container {
    margin: 3rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    border: 1px solid #e5e7eb;
    background: white;
}

.imageblock-container img {
    display: block;
    width: 100%;
    height: auto;
}

.imageblock-container figcaption {
    padding: 1.5rem 2rem;
    text-align: center;
    background-color: #f9fafb;
}

/* Rich Text */
.rich-text {
    margin: 3rem 0;
    padding: 2rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.rich-text h2 {
    margin-bottom: 1rem;
}

.rich-text p {
    margin: 0;
}

/* Link List */
.link-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 3rem 0;
}

.link-item {
    display: block;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.link-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* Responsividade */
@media (max-width: 768px) {
    .landing-main {
        padding: 0 0.5rem;
    }
    
    .site-header {
        padding: 2rem 1rem;
    }
    
    .profile-card {
        padding: 2rem 1rem;
    }
    
    .profile-image {
        width: 8rem;
        height: 8rem;
    }
    
    .rich-text {
        padding: 1.5rem;
    }
    
    .link-list {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .link-item {
        padding: 1rem 1.5rem;
    }
}`;
}

function getFontFamily(fontFamily: string) {
  const fontMap = {
    'Default': 'inherit',
    'Roboto': "'Roboto', sans-serif",
    'Montserrat': "'Montserrat', sans-serif",
    'Lora': "'Lora', serif",
    'Playfair Display': "'Playfair Display', serif",
    'Poppins': "'Poppins', sans-serif"
  };
  return fontMap[fontFamily as keyof typeof fontMap] || 'inherit';
}

function generateReadme() {
  return `# Meu Site Gerado com Genesis Builder

## 🚀 Como usar:

### 1. Desenvolvimento Local:
- Abra o arquivo \`index.html\` em qualquer navegador
- Ou use um servidor local como Live Server no VS Code

### 2. Deploy no Vercel:
- Faça upload de todos os arquivos para um repositório Git
- Conecte o repositório ao Vercel
- O site será automaticamente implantado

### 3. Deploy no Netlify:
- Arraste a pasta inteira para o Netlify Drop
- Ou conecte via Git como no Vercel

## 📁 Estrutura dos arquivos:

- \`index.html\` - Página principal
- \`style.css\` - Estilos do site  
- \`images/\` - Todas as imagens utilizadas
- \`README.md\` - Este arquivo

## ✅ Verificações importantes:

1. **Todas as imagens** estão na pasta \`images/\`
2. **Os caminhos** no HTML estão corretos: \`./images/nome-da-imagem.jpg\`
3. **Ao fazer upload no Git**, incluir TODOS os arquivos
4. **No Vercel**, verificar se a pasta \`images/\` foi enviada

## 🎨 Personalizações:

Você pode editar diretamente os arquivos HTML e CSS para fazer ajustes adicionais.

---

✨ Criado com Genesis Builder
🌐 Deploy: Vercel ou Netlify
📱 Responsivo: Mobile-first
`;
}

// Utilities para análise do histórico
export function getHistoryDiff(stateA: Block[], stateB: Block[]) {
  const addedBlocks = stateB.filter(b => !stateA.some(a => a.id === b.id));
  const removedBlocks = stateA.filter(a => !stateB.some(b => b.id === a.id));
  const modifiedBlocks = stateB.filter(b => {
    const original = stateA.find(a => a.id === b.id);
    return original && !dequal(original.props, b.props);
  });
  
  return { addedBlocks, removedBlocks, modifiedBlocks };
}

export function getBlockTypeStats(blocks: Block[]) {
  return blocks.reduce((stats, block) => {
    stats[block.type] = (stats[block.type] || 0) + 1;
    return stats;
  }, {} as Record<Block['type'], number>);
}

// ✅ NOVO: Store reativa para saber se o usuário já baixou um projeto
export const hasDownloaded = readable(false, (set) => {
  function update() {
    if (browser) {
      set(localStorage.getItem('genesis-has-downloaded') === 'true');
    }
  }

  if (browser) {
    // Escuta por mudanças no storage, o que é útil se a flag for setada em outra aba.
    // O evento que disparamos manualmente também aciona isso.
    window.addEventListener('storage', update);
    update(); // Checa o valor inicial quando a store é criada.
  }

  // Função de cleanup que o Svelte chama quando a store não é mais necessária.
  return () => {
    if (browser) {
      window.removeEventListener('storage', update);
    }
  };
});