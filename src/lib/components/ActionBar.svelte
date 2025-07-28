<script lang="ts">
  // ✅ NOVO: Importar a store 'activeTemplate' e a função de navegação 'goto'
  import { downloadSite, activeTemplate } from '$lib/stores';
  import { goto } from '$app/navigation';
  import DownloadButton from './DownloadButton.svelte';

  let isDownloading = false;

  async function handleDownload() {
    isDownloading = true;
    try {
      await downloadSite();
      console.log('✅ Site baixado com sucesso!');
    } catch (error) {
      console.error('❌ Erro no download:', error);
      alert('Erro ao baixar o site. Tente novamente.');
    } finally {
      isDownloading = false;
    }
  }

  // ✅ NOVO: Função para voltar à tela inicial e resetar o estado
  function goHomeAndReset() {
    // 1. Limpa a seleção do template ativo. Isso é o mais importante!
    activeTemplate.set(null);
    
    // 2. Navega o usuário de volta para a página inicial
    goto('/');
  }
</script>

<div class="action-bar">
  <button on:click={goHomeAndReset} class="back-button">
    ← Voltar ao Início
  </button>
  
  <DownloadButton onDownload={handleDownload} isLoading={isDownloading} />
</div>

<style>
  .action-bar { 
    display: flex;
    justify-content: space-between; 
    align-items: center; 
    padding: 1rem 2rem; 
    background-color: #ffffff; 
    border-bottom: 1px solid #e5e7eb;
    height: 60px;
    box-sizing: border-box;
  }
  
  .back-button { 
    /* ✅ NOVO: Estilos para que o <button> se pareça com o link anterior */
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit; /* Garante que a fonte seja a mesma do resto da página */

    /* Estilos que já tínhamos */
    color: #4b5563; 
    text-decoration: none; 
    font-weight: 500; 
    font-size: 0.9rem;
    transition: color 0.2s ease, background-color 0.2s ease;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }
  
  .back-button:hover { 
    color: #1f2937; 
    background-color: #f3f4f6;
  }
</style>