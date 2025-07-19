<script lang="ts">
  import { blocks, globalStyles } from '$lib/stores';
  import { get } from 'svelte/store';
  import JSZip from 'jszip';
  import DownloadButton from './DownloadButton.svelte';

  let isLoading = false;

  const fontMap = {
    Roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
    Montserrat: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
    Lora: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
  }

  function gerarHTML(): string {
    const styles = get(globalStyles);
    const fontLink = fontMap[styles.fontFamily];
    const currentBlocks = get(blocks);
    const bodyContent = currentBlocks.map(block => {
      switch (block.type) {
        case 'Header':
          return `<header style="background-color: ${block.props.corDeFundo}; color: ${block.props.corDoTexto};"><h1 style="font-size: ${block.props.tamanhoDaFonte}rem;">${block.props.titulo}</h1></header>`;
        
        case 'ProfileCard':
          return `<div class="profile-card variant-${block.props.styleVariant}">
                    <div class="background-glow"></div> 
                    <img src="${block.props.imageUrl}" alt="Foto de ${block.props.nome}" class="profile-image" />
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
          return `<figure class="imageblock"><img src="${block.props.imageUrl}" alt="${block.props.legenda}" /><figcaption>${block.props.legenda}</figcaption></figure>`;
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

  // --- FUNÇÃO GERAR CSS ATUALIZADA COM O NOVO DESIGN ---
  function gerarCSS(): string {
    const styles = get(globalStyles);
    // Mapeia o nome da fonte para o valor CSS correto.
    const fontFamilies = {
      Roboto: "'Roboto', sans-serif",
      Montserrat: "'Montserrat', sans-serif",
      Lora: "'Lora', serif",
    }
    const fontFamilyCss = `font-family: ${fontFamilies[styles.fontFamily]};`;
    const currentBlocks = get(blocks);

    // --- CSS Base e Animações ---
    let css = `
      /* --- GERAL E FUNDO --- */
      :root {
        --cor-primaria: #4f46e5;
        --cor-secundaria: #7c3aed;
        --cor-texto: #212529;
        --cor-texto-suave: #495057;
        --cor-fundo: #f8f9fa;
        --raio-borda: 12px;
      }

      body { 
        margin: 0; 
        background-image: linear-gradient(180deg, #ffffff 0%, #f0f2f5 100%);
        color: var(--cor-texto);
        ${fontFamilyCss}; 
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
        gap: 3rem; /* Espaçamento padrão entre blocos */
      }

      /* --- TIPOGRAFIA --- */
      h1, h2, h3 { font-weight: 700; color: var(--cor-texto); }
      h1 { font-size: 3rem; line-height: 1.2; }
      h2 { font-size: 2.25rem; }
      p { color: var(--cor-texto-suave); margin-top: 0; }
      a { color: var(--cor-primaria); text-decoration: none; transition: color 0.2s ease; }
      a:hover { color: var(--cor-secundaria); }

      /* --- ANIMAÇÃO DE SCROLL --- */
      @keyframes slideUpFadeIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animated-block {
        /* Esta animação pode ser aplicada aos blocos com JavaScript (Intersection Observer) */
        animation: slideUpFadeIn 0.8s ease-out forwards;
      }
    `;
    
    // --- ESTILOS DOS BLOCOS ---

    if (currentBlocks.some(b => b.type === 'Header')) {
      css += `
        header { 
          padding: 0;
          text-align: center;
        } 
        header h1 { 
          margin: 0; 
          font-size: clamp(2.5rem, 8vw, 4.5rem); /* Título responsivo */
          background: linear-gradient(45deg, var(--cor-primaria), var(--cor-secundaria));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
      `;
    }

    // Estilo unificado para blocos tipo "card"
    const cardBlocks = ['ProfileCard', 'RichText', 'ImageBlock'];
    if (currentBlocks.some(b => cardBlocks.includes(b.type))) {
      css += `
        .profile-card, .richtext, .imageblock {
          background-color: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: var(--raio-borda);
          padding: 2.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .profile-card:hover, .richtext:hover, .imageblock:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }
      `;
    }
    
    // Estilos específicos para cada bloco
    if (currentBlocks.some(b => b.type === 'ProfileCard')) {
      // Usando as regras do ProfileCard magnífico que já fizemos
      css += `
        .profile-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
          position: relative;
          overflow: hidden;
        }
        .profile-card .background-glow {
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle at center, rgba(101, 83, 228, 0.15), rgba(101, 83, 228, 0) 60%);
          transition: transform 1.2s cubic-bezier(0.075, 0.82, 0.165, 1);
          z-index: 1; transform: scale(0);
        }
        .profile-card:hover .background-glow { transform: scale(1); }
        .profile-card .profile-image, .profile-card .text-content { position: relative; z-index: 2; }
        .profile-card .profile-name { 
          background: linear-gradient(45deg, #2c3e50, #4b6cb7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        /* ... (regras de layout do profile card que já existem) ... */
        .profile-card .profile-image { display: block; object-fit: cover; border-radius: 50%; width: 8rem; height: 8rem; border: 4px solid #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .profile-card.variant-top { text-align: center; } .variant-top .profile-image { margin: 0 auto 1.5rem auto; }
        .profile-card.variant-left { display: flex; align-items: center; text-align: left; gap: 2rem; }
      `;
    }
    
    if (currentBlocks.some(b => b.type === 'LinkList')) {
      css += `
        .links-list { 
          display: flex; 
          flex-direction: column; 
          align-items: center;
          gap: 1rem; 
        } 
        .links-list .btn { 
          background-image: linear-gradient(45deg, var(--cor-primaria) 0%, var(--cor-secundaria) 100%); 
          color: #ffffff; 
          text-decoration: none; 
          padding: 1rem 2rem; 
          border-radius: 50px; /* Botões de pílula */
          font-weight: 700;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .links-list .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          color: #fff;
        }
      `;
    }
    
    if (currentBlocks.some(b => b.type === 'ImageBlock')) {
      css += `
        .imageblock { padding: 0; }
        .imageblock img { width: 100%; height: auto; display: block; border-radius: var(--raio-borda); } 
        .imageblock figcaption { text-align: center; font-style: italic; color: var(--cor-texto-suave); padding: 1rem; }
      `;
    }

    return css;
  }
  
  async function handleDownload() {
    isLoading = true;
    await new Promise(resolve => setTimeout(resolve, 500));
    const zip = new JSZip();
    zip.file("index.html", gerarHTML());
    zip.file("style.css", gerarCSS());
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "site-interestelar.zip";
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