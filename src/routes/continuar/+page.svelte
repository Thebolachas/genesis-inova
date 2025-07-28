<script lang="ts">
  import { goto } from '$app/navigation';
  import { blocks, activeTemplate, imageStorage, resetBlocks } from '$lib/stores';
  import JSZip from 'jszip';

  let isLoading = false;
  let errorMessage = '';

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    isLoading = true;
    errorMessage = '';
    const file = input.files[0];

    try {
      // Reseta o estado atual antes de carregar o novo
      resetBlocks();

      const zip = await JSZip.loadAsync(file);
      const projectFile = zip.file('project.json');

      if (!projectFile) {
        throw new Error('Arquivo project.json não encontrado. O ZIP parece ser inválido.');
      }

      const projectContent = await projectFile.async('string');
      const projectData = JSON.parse(projectContent);

      // Recarrega as stores com os dados do arquivo
      blocks.set(projectData.blocks);
      activeTemplate.set(projectData.template);
      
      // Lógica para recarregar as imagens
      const imagesFolder = zip.folder('images');
      if (imagesFolder) {
        const imagePromises: Promise<void>[] = [];
        imagesFolder.forEach((relativePath, imageFile) => {
          const promise = (async () => {
            const blob = await imageFile.async('blob');
            const blobUrl = URL.createObjectURL(blob);
            
            const blockId = relativePath.split('.')[0].replace('image-', '');

            const base64 = await blobToBase64(blob);
            
            imageStorage.update(storage => {
              storage[blockId] = {
                blobUrl,
                base64,
                filename: relativePath,
                type: blob.type
              };
              return storage;
            });
          })();
          imagePromises.push(promise);
        });
        await Promise.all(imagePromises);
      }

      // Tudo pronto! Leva o usuário de volta para o editor.
      goto('/refinar');

    } catch (err) {
      errorMessage = 'Ocorreu um erro ao processar o arquivo. Verifique se é um ZIP válido do Genesis.';
      console.error(err);
      // Limpa tudo se deu erro
      resetBlocks();
    } finally {
      isLoading = false;
    }
  }

  // Função auxiliar para converter um Blob em uma string Base64
  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
</script>

<div class="page-container">
    <div class="upload-card">
        <a href="/" class="back-link">← Voltar</a>
        <h1>Continuar um Projeto</h1>
        <p>Faça o upload do arquivo <strong>.zip</strong> que você salvou para carregar sua criação e continuar de onde parou.</p>
        
        <input type="file" id="zip-upload" accept=".zip" on:change={handleFileUpload} hidden disabled={isLoading} />
        <label for="zip-upload" class="upload-button" class:loading={isLoading}>
            {#if isLoading}
                <span>Carregando...</span>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Selecionar Arquivo .zip</span>
            {/if}
        </label>
        
        {#if errorMessage}
            <p class="error-message">{errorMessage}</p>
        {/if}
    </div>
</div>

<style>
    .page-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #f1f5f9;
        font-family: system-ui, sans-serif;
    }
    .upload-card {
        background: white;
        padding: 2.5rem;
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
        text-align: center;
        position: relative;
    }
    .back-link {
        position: absolute;
        top: 1.5rem;
        left: 1.5rem;
        color: #4b5563;
        text-decoration: none;
        font-weight: 500;
    }
    h1 {
        font-size: 1.75rem;
        color: #1e293b;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
    }
    p {
        color: #4b5563;
        margin-bottom: 2rem;
        line-height: 1.6;
    }
    .upload-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        width: 100%;
        padding: 1rem;
        border: 2px dashed #cbd5e1;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
        color: #4338ca;
        background-color: #eef2ff;
    }
    .upload-button:hover {
        border-color: #a5b4fc;
        background-color: #e0e7ff;
    }
    .upload-button.loading {
        cursor: not-allowed;
        background-color: #f1f5f9;
        color: #64748b;
    }
    .error-message {
        margin-top: 1.5rem;
        color: #dc2626;
        font-weight: 500;
    }
</style>