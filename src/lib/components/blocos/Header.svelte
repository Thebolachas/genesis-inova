<script lang="ts">
  import { updateBlockProps } from '$lib/stores';
  import { showPopover } from '$lib/popoverStore';

  export let id: string;
  export let titulo: string;
  export let corDeFundo: string;
  export let tituloStyle: {
    color: string,
    fontSize: number,
    fontFamily: string,
    bold: boolean,
    italic: boolean
  };

  function handleTitleUpdate(event: FocusEvent) {
    const newTitle = (event.currentTarget as HTMLElement).innerText;
    if (newTitle !== titulo) {
      updateBlockProps(id, { titulo: newTitle });
    }
  }

  const fontMap = { 'Default': 'inherit', 'Roboto': "'Roboto', sans-serif", 'Montserrat': "'Montserrat', sans-serif", 'Lora': "'Lora', serif", 'Playfair Display': "'Playfair Display', serif", 'Poppins': "'Poppins', sans-serif" };
</script>

<div 
  class="header-wrapper" 
  style:background-color={corDeFundo}
  on:click|stopPropagation={(e) => showPopover(id, e.currentTarget, 'corDeFundoStyle')}
>
  <header>
    <div class="container">
      <h1
        style:color={tituloStyle.color}
        style:font-size="{tituloStyle.fontSize}rem"
        style:font-family={fontMap[tituloStyle.fontFamily] || 'inherit'}
        style:font-weight={tituloStyle.bold ? 'bold' : 'normal'}
        style:font-style={tituloStyle.italic ? 'italic' : 'normal'}
        contenteditable="true"
        on:blur={handleTitleUpdate}
        on:click|stopPropagation={(e) => showPopover(id, e.currentTarget, 'tituloStyle')}
      >
        {@html titulo}
      </h1>
    </div>
  </header>
</div>


<style>
  .header-wrapper {
    padding: 2rem 0;
    border-radius: 1rem; /* Borda arredondada para o efeito */
    cursor: pointer;
    position: relative;
    overflow: hidden;

    /* EFEITO VIDRO FOSCO */
    background: rgba(31, 41, 55, 0.85); /* Cor de fundo padrão com transparência */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* EFEITO HOVER */
  .header-wrapper:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 16px 45px 0 rgba(0, 0, 0, 0.2);
  }

  h1 { 
    margin: 0; 
    transition: all 0.2s ease; 
    border-radius: 8px;
    padding: 0.5rem;
  }
  h1:hover { 
    background-color: rgba(255,255,255,0.1); 
  }

  /* Estilos internos do header */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
  }
</style>