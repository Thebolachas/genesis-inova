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
        case 'Header': return `<header style="background-color: ${block.props.corDeFundo}; color: ${block.props.corDoTexto};"><h1 style="font-size: ${block.props.tamanhoDaFonte}rem;">${block.props.titulo}</h1></header>`;
        case 'ProfileCard':
          return `<div class="profile-card variant-${block.props.styleVariant}">
                    <img src="${block.props.imageUrl}" alt="Foto de ${block.props.nome}" class="profile-image" />
                    <div class="text-content">
                      <h2 class="profile-name">${block.props.nome}</h2>
                      <p class="profile-bio">${block.props.bio}</p>
                    </div>
                  </div>`;
        case 'LinkList': const linksHTML = block.props.links.map((link: { text: string; url: string; }) => `<a href="${link.url}" class="btn" target="_blank" rel="noopener noreferrer">${link.text}</a>`).join(''); return `<div class="links-list">${linksHTML}</div>`;
        case 'RichText': return `<section class="richtext"><h2>${block.props.titulo}</h2><p>${block.props.texto}</p></section>`;
        case 'ImageBlock': return `<figure class="imageblock"><img src="${block.props.imageUrl}" alt="${block.props.legenda}" /><figcaption>${block.props.legenda}</figcaption></figure>`;
        default: return '';
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

  function gerarCSS(): string {
    const styles = get(globalStyles);
    const fontFamilyCss = `font-family: '${styles.fontFamily}', sans-serif;`;
    const currentBlocks = get(blocks);

    let css = `body { margin: 0; background-color: #f3f4f6; ${fontFamilyCss}; line-height: 1.6; } main { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }`;
    if (currentBlocks.some(b => b.type === 'Header')) css += `header { width: 100%; padding: 2rem 0; text-align: center; } header h1 { margin: 0; }`;
    if (currentBlocks.some(b => b.type === 'ProfileCard')) {
      css += `
        .profile-card { background-color: #ffffff; border-radius: 0.75rem; padding: 2.5rem 2rem; margin: 2rem 0; }
        .profile-card .profile-image { display: block; object-fit: cover; border-radius: 50%; width: 8rem; height: 8rem; border: 4px solid #ffffff; }
        .profile-card .profile-name { font-size: 1.875rem; } .profile-card .profile-bio { color: #4b5563; }
        .profile-card.variant-top { text-align: center; }
        .variant-top .profile-image { margin: 0 auto 1.5rem auto; }
        .profile-card.variant-left { display: flex; align-items: center; text-align: left; gap: 2rem; }
        .variant-left .profile-image { margin: 0; width: 7rem; height: 7rem; flex-shrink: 0; }
      `;
    }
    if (currentBlocks.some(b => b.type === 'LinkList')) css += `.links-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin: 2rem 0; } .links-list .btn { background-color: #3730a3; color: #ffffff; text-decoration: none; padding: 1rem; border-radius: 0.5rem; }`;
    if (currentBlocks.some(b => b.type === 'RichText')) css += `.richtext { background: white; padding: 2.5rem; margin: 2rem 0; }`;
    if (currentBlocks.some(b => b.type === 'ImageBlock')) css += `.imageblock { margin: 2rem 0; } .imageblock img { width: 100%; height: auto; display: block; } .imageblock figcaption { text-align: center; font-style: italic; color: #6b7280; padding: 0.5rem; }`;
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
  .action-bar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; }
  .back-button { color: #4b5563; text-decoration: none; font-weight: 500; font-size: 0.9rem; }
  .back-button:hover { color: #1f2937; }
</style>