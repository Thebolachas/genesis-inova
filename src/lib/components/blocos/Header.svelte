<script lang="ts">
  // --- As "Entradas" do nosso Bloco de LEGO ---
  export let titulo: string = "Título do Site";
  export let corDoTexto: string = "#000000";
  export let corDeFundo: string = "#FFFFFF";
  export let tamanhoDaFonte: number = 2.5; // em 'rem'
</script>

<header style="--cor-fundo: {corDeFundo};">
  <div class="container">
    <h1 style="--cor-texto: {corDoTexto}; --tamanho-fonte: {tamanhoDaFonte}rem;">
      {titulo}
    </h1>
  </div>
</header>

<style>
  /* --- O Estilo ÚNICO e Isolado deste Bloco --- */
  header {
    width: 100%;
    padding: 2rem 0;
    background-color: var(--cor-fundo);
    border-bottom: 1px solid #eaeaea;
    transition: background-color 0.3s ease;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
  }
  h1 {
    font-size: var(--tamanho-fonte);
    color: var(--cor-texto);
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-weight: bold;
    margin: 0;
    transition: color 0.3s ease, font-size 0.3s ease;
  }
</style>