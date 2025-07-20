<script lang="ts">
  import { blocks, globalStyles, imageFiles } from '$lib/stores';
  import { get } from 'svelte/store';
  import JSZip from 'jszip';
  import DownloadButton from './DownloadButton.svelte';

  let isLoading = false;

  const fontMap = {
    Roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
    Montserrat: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
    Lora: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
  }

  /**
   * SUGESTÃO 2: HTML Otimizado
   * - Gera caminhos de imagem relativos em vez de Base64.
   * - Adiciona classes CSS aos elementos para que correspondam aos componentes.
   */
  function gerarHTML(): string {
    const styles = get(globalStyles);
    const fontLink = fontMap[styles.fontFamily];
    const currentBlocks = get(blocks);

    const bodyContent = currentBlocks.map(block => {
      // Para imagens, criamos um nome de ficheiro seguro
      const imageFileName = block.props.imageUrl && block.props.imageUrl.startsWith('blob:')
        ? `images/${block.id}.png` // Nomeamos o ficheiro com o ID do bloco
        : block.props.imageUrl;

      switch (block.type) {
        case 'Header':
          return `<header style="background-color: ${block.props.corDeFundo};"><h1 style="color: ${block.props.corDoTexto}; font-size: ${block.props.tamanhoDaFonte}rem;">${block.props.titulo}</h1></header>`;

        case 'ProfileCard':
          return `<div class="profile-card variant-${block.props.styleVariant}">
                    <div class="background-glow"></div>
                    <img src="${imageFileName}" alt="Foto de ${block.props.nome}" class="profile-image" />
                    <div class="text-content">
                      <h2 class="profile-name">${block.props.nome}</h2>
                      <p class="profile-bio">${block.props.bio}</p>
                    </div>
                  </div>`;

        case 'LinkList':
          const linksHTML = block.props.links.map((link: { text: string; url: string; }) => `<a href="${link.url}" class="btn" target="_blank" rel="noopener noreferrer">${link.text}</a>`).join('');
          return `<div class="links-list">${linksHTML}</div>`;

        case 'RichText':
          return `<section class="richtext"><h2>${block.props.titulo}</h2><p>${block.props.texto}</p></section>`;

        case 'ImageBlock':
          return `<figure class="imageblock"><img src="${imageFileName}" alt="${block.props.legenda}" /><figcaption>${block.props.legenda}</figcaption></figure>`;

        default:
          return '';
      }
    }).join('\n    ');

    const pageTitle = get(blocks).find(b => b.type === 'ProfileCard')?.props.nome || 'Meu Site Incrível';

    return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <link rel="stylesheet" href="style.css">
    <link href="${fontLink}" rel="stylesheet">
  </head>
  <body>
    <main>
    ${bodyContent}
    </main>
  </body>
</html>`;
  }

  /**
   * SUGESTÃO 1: CSS Otimizado
   * - Recria os estilos dos componentes de forma mais fiel.
   * - Centraliza variáveis e estilos base.
   */
  function gerarCSS(): string {
    const styles = get(globalStyles);
    const fontFamilies = {
      Roboto: "'Roboto', sans-serif",
      Montserrat: "'Montserrat', sans-serif",
      Lora: "'Lora', serif",
    }
    const fontFamilyCss = `font-family: ${fontFamilies[styles.fontFamily]};`;

    return `
      /* --- GERAL E FUNDO --- */
      :root {
        --cor-primaria: #4f46e5;
        --cor-secundaria: #7c3aed;
        --cor-texto: #212529;
        --cor-texto-suave: #495057;
        --cor-fundo: #f8f9fa;
        --raio-borda: 1rem;
      }
      body {
        margin: 0;
        background-image: linear-gradient(180deg, #ffffff 0%, #f0f2f5 100%);
        color: var(--cor-texto);
        ${fontFamilyCss}
        line-height: 1.7;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      main {
        max-width: 900px;
        margin: 4rem auto;
        padding: 0 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 3rem;
      }
      h1, h2, h3, p { margin: 0; }
      
      /* --- BLOCO: HEADER --- */
      header { text-align: center; }
      
      /* --- BLOCO: PROFILE CARD --- */
      .profile-card {
        position: relative;
        overflow: hidden;
        padding: 2.5rem 2rem;
        border-radius: var(--raio-borda);
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        z-index: 1;
      }
      .profile-card .background-glow {
        position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(circle at center, rgba(101, 83, 228, 0.15), rgba(101, 83, 228, 0) 60%);
        z-index: -1;
      }
      .profile-image {
        display: block; object-fit: cover; border-radius: 50%; width: 8rem; height: 8rem;
        border: 3px solid white; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .profile-name {
        font-size: 2rem; font-weight: 700; margin: 1.5rem 0 0.5rem 0;
        background: linear-gradient(45deg, #2c3e50, #4b6cb7);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text; color: transparent;
      }
      .profile-bio { color: #374151; font-size: 1rem; line-height: 1.6; }
      .profile-card.variant-top { text-align: center; }
      .profile-card.variant-top .profile-image { margin-left: auto; margin-right: auto; }
      .profile-card.variant-left { display: flex; align-items: center; text-align: left; gap: 2rem; }
      .profile-card.variant-left .profile-name { margin-top: 0; }
      
      /* --- BLOCO: LINK LIST --- */
      .links-list { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
      .links-list .btn {
        display: block; background-color: #3730a3; color: #ffffff; text-decoration: none;
        padding: 1rem; border-radius: 0.5rem; text-align: center; font-weight: 500;
        width: 100%; max-width: 500px;
      }
      .links-list .btn:hover { background-color: #312e81; }

      /* --- BLOCO: RICH TEXT --- */
      .richtext {
        background: white; padding: 2.5rem; border-radius: var(--raio-borda);
        box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
      }
      .richtext h2 { margin-bottom: 1rem; font-size: 1.75rem; color: #1f2937; }
      .richtext p { line-height: 1.7; color: #4b5563; }

      /* --- BLOCO: IMAGE BLOCK --- */
      .imageblock { margin: 0; border-radius: var(--raio-borda); overflow: hidden; background: white; border: 1px solid #e5e7eb; }
      .imageblock img { display: block; width: 100%; height: auto; }
      .imageblock figcaption { padding: 1rem 1.5rem; text-align: center; font-style: italic; color: #6b7280; }
    `;
  }
  
  /**
   * SUGESTÃO 2: Geração de ZIP com Ficheiros de Imagem
   */
  async function handleDownload() {
    isLoading = true;
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const zip = new JSZip();
    zip.file("index.html", gerarHTML());
    zip.file("style.css", gerarCSS());

    // Adiciona a pasta de imagens e os ficheiros
    const imgFolder = zip.folder("images");
    const files = get(imageFiles);
    for (const blockId in files) {
        if (files[blockId]) {
            // Usa o ID do bloco como nome do ficheiro para garantir que seja único
            imgFolder?.file(`${blockId}.png`, files[blockId]);
        }
    }

    const blob = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "site-genesis.zip";
    link.click();
    URL.revokeObjectURL(link.href);

    isLoading = false;
  }
</script>

<div class="action-bar">
  <a href="/" class="back-button">← Voltar à Criação 3D</a>
  <DownloadButton onDownload={handleDownload} {isLoading} />
</div>

<style>
  .action-bar { 
    display: flex;
    justify-content: space-between; 
    align-items: center; 
    padding: 1rem 2rem; 
    background-color: #ffffff; 
    border-bottom: 1px solid #e5e7eb;
  }
  .back-button { 
    color: #4b5563; 
    text-decoration: none; 
    font-weight: 500; 
    font-size: 0.9rem;
  }
  .back-button:hover { 
    color: #1f2937; 
  }
</style>