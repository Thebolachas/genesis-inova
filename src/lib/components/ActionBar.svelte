<script lang="ts">
  // 🆕 NOVO: Importar a função de download melhorada do stores
  import { downloadSite } from '$lib/stores';
  import DownloadButton from './DownloadButton.svelte';

  // Estado para controlar loading do download
  let isDownloading = false;

  // 🆕 NOVA: Função de download que inclui imagens
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
</script>

<div class="action-bar">
  <a href="/" class="back-button">← Voltar à Criação 3D</a>
  
  <!-- 🆕 USANDO a nova função que inclui imagens -->
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
  }
  
  .back-button { 
    color: #4b5563; 
    text-decoration: none; 
    font-weight: 500; 
    font-size: 0.9rem; 
    transition: color 0.2s ease;
  }
  
  .back-button:hover { 
    color: #1f2937; 
  }
</style>