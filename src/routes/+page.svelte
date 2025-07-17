<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import PropertiesPanel from '$lib/components/PropertiesPanel.svelte';
  import { addBlock, blocks } from '$lib/stores'; // Importamos 'blocks'
  import { get } from 'svelte/store'; // 1. Importamos 'get' para ler o valor atual de uma store
  import JSZip from 'jszip'; // Importamos a prensa digital

  let isLoading = false;

  // --- A SALA DE MÁQUINAS DA EXPORTAÇÃO (VERSÃO LENDÁRIA) ---

  function gerarHTML(): string {
    const currentBlocks = get(blocks); // 2. Pegamos um 'snapshot' do estado atual do Cérebro

    // 3. Construímos o corpo do HTML iterando sobre a lista de blocos
    const bodyContent = currentBlocks.map(block => {
      switch (block.type) {
        case 'Header':
          return `<header style="background-color: ${block.props.corDeFundo}; color: ${block.props.corDoTexto};">
                    <h1 style="font-size: ${block.props.tamanhoDaFonte}rem;">${block.props.titulo}</h1>
                  </header>`;
        case 'ProfileCard':
          return `<div class="profile-card">
                    <img src="${block.props.imageUrl}" alt="Foto de ${block.props.nome}" />
                    <h2>${block.props.nome}</h2>
                    <p>${block.props.bio}</p>
                  </div>`;
        case 'LinkList':
          const linksHTML = block.props.links.map((link: { text: string; url: string; }) => 
            `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a>`
          ).join('');
          return `<div class="links-list">${linksHTML}</div>`;
        default:
          return '';
      }
    }).join('\n');

    // 4. Retornamos o template HTML completo com o corpo gerado
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${get(blocks).find(b => b.type === 'ProfileCard')?.props.nome || 'Meu Site Incrível'}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${bodyContent}
</body>
</html>`;
  }

  function gerarCSS(): string {
    // Para simplificar, o CSS ainda é genérico, mas poderia ser gerado dinamicamente também.
    return `
body { margin: 0; background-color: #f3f4f6; font-family: system-ui, sans-serif; }
header { width: 100%; padding: 2rem 0; text-align: center; }
header h1 { margin: 0; }
.profile-card { background-color: #ffffff; border-radius: 0.75rem; padding: 2.5rem 2rem; text-align: center; max-width: 500px; margin: 2rem auto; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
.profile-card img { width: 8rem; height: 8rem; border-radius: 9999px; object-fit: cover; margin: 0 auto 1.5rem auto; }
.profile-card h2 { font-size: 1.875rem; font-weight: 600; color: #1f2937; margin: 0 0 0.5rem 0; }
.profile-card p { color: #4b5563; font-size: 1rem; line-height: 1.5; margin: 0; }
.links-list { max-width: 500px; margin: 2rem auto; display: flex; flex-direction: column; gap: 1rem; }
.links-list a { display: block; background-color: #3730a3; color: #ffffff; text-decoration: none; padding: 1rem; border-radius: 0.5rem; text-align: center; font-weight: 500; }
    `;
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
    link.download = "site-lendario.zip";
    link.click();
    URL.revokeObjectURL(link.href);
    isLoading = false;
  }
</script>

<div class="playground-layout">
  <aside class="palette">
    <h2 class="palette-title">Paleta de Blocos</h2>
    <div class="palette-buttons">
      <button on:click={() => addBlock('Header')}>Adicionar Cabeçalho</button>
      <button on:click={() => addBlock('ProfileCard')}>Adicionar Cartão de Perfil</button>
      <button on:click={() => addBlock('LinkList')}>Adicionar Lista de Links</button>
    </div>
    <hr>
    <div class="publish-section">
      <h3>Publicar</h3>
      <button class="download-button" on:click={handleDownload} disabled={isLoading}>
        {#if isLoading}Gerando...{:else}Baixar Site (.zip){/if}
      </button>
    </div>
  </aside>

  <main class="canvas-area">
    <Canvas />
  </main>

  <aside class="properties-panel">
    <PropertiesPanel />
  </aside>
</div>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; }
  .playground-layout { display: grid; grid-template-columns: 280px 1fr 350px; height: 100vh; width: 100vw; overflow: hidden; }
  .palette { background-color: #1f2937; color: #f9fafb; padding: 1.5rem; display: flex; flex-direction: column; }
  .palette-title { margin: 0 0 2rem 0; border-bottom: 1px solid #4b5563; padding-bottom: 1rem; }
  .palette-buttons { display: flex; flex-direction: column; gap: 1rem; }
  .palette-buttons button { background-color: #374151; color: #f9fafb; border: none; padding: 0.75rem 1rem; border-radius: 0.375rem; text-align: left; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
  .palette-buttons button:hover { background-color: #4b5563; }
  hr { border: none; border-top: 1px solid #4b5563; margin: auto 0 1rem 0; }
  .publish-section h3 { margin-bottom: 1rem; }
  .download-button { width: 100%; padding: 1rem; font-size: 1.1rem; font-weight: bold; color: #ffffff; background: linear-gradient(to right, #4f46e5, #7c3aed); border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.3s ease; }
  .download-button:hover { opacity: 0.9; }
  .download-button:disabled { background: #9ca3af; cursor: not-allowed; }
  .canvas-area { overflow-y: auto; }
  .properties-panel { overflow-y: auto; }
</style>