<script lang="ts">
  // A função onDownload será passada como uma 'prop' quando usarmos este componente
  export let onDownload: () => void;
  // Prop para controlar o estado de carregamento, se necessário
  export let isLoading: boolean = false;
</script>

<button class="lego-button" on:click={onDownload} disabled={isLoading} aria-label="Baixar o site como arquivo .zip">
  <div class="stud"></div>
  <div class="stud"></div>
  
  <span class="button-text">
    {#if isLoading}
      Gerando...
    {:else}
      Baixar (.zip)
    {/if}
  </span>
</button>

<style>
  .lego-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    /* Dimensões da peça - uma peça 2x4 */
    width: 160px;
    height: 50px;
    
    background-color: #f59e0b; /* Amarelo LEGO */
    color: #ffffff;
    
    border: none;
    border-radius: 5px; /* Bordas levemente arredondadas */
    
    font-weight: bold;
    font-size: 1rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    
    cursor: pointer;
    box-shadow: inset 0 -4px 0 rgba(0,0,0,0.15), 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: all 0.1s ease-in-out;
  }

  .lego-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: inset 0 -4px 0 rgba(0,0,0,0.15), 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .lego-button:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: inset 0 -2px 0 rgba(0,0,0,0.15), 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .lego-button:disabled {
    background-color: #a1a1aa; /* Cinza quando desabilitado */
    cursor: not-allowed;
  }

  /* Os pinos de encaixe */
  .stud {
    position: absolute;
    top: 5px; /* Distância do topo */
    width: 15px;
    height: 15px;
    background-color: #f7b900;
    border-radius: 50%;
    box-shadow: inset 0 -2px 1px rgba(0,0,0,0.1);
  }
  
  /* Posicionamento dos 4 pinos de uma peça 2x4 */
  .stud:nth-child(1) { left: 18px; }
  .stud:nth-child(2) { right: 18px; }

  /* O texto do botão */
  .button-text {
    position: relative; /* Garante que o texto fique acima dos pinos */
    z-index: 1;
  }
</style>