<script lang="ts">
  import { handleImageUpload, updateBlockProps } from '$lib/stores';
  import { showPopover } from '$lib/popoverStore';

  export let id: string;
  export let imageUrl: string;
  export let nome: string;
  export let bio: string;
  export let styleVariant: 'top' | 'left' = 'top';

  export let nomeStyle: { color: string, fontSize: number, fontFamily: string, bold: boolean, italic: boolean };
  export let bioStyle: { color: string, fontSize: number, fontFamily: string, bold: boolean, italic: boolean };

  let fileInput: HTMLInputElement;

  function handleUpdate(propName: 'nome' | 'bio', event: FocusEvent) {
    const newValue = (event.currentTarget as HTMLElement).innerText;
    updateBlockProps(id, { [propName]: newValue });
  }
  
  const fontMap = { 'Default': 'inherit', 'Roboto': "'Roboto', sans-serif", 'Montserrat': "'Montserrat', sans-serif", 'Lora': "'Lora', serif", 'Playfair Display': "'Playfair Display', serif", 'Poppins': "'Poppins', sans-serif" };
</script>

<input type="file" bind:this={fileInput} on:change={(e) => handleImageUpload(e, id)} style="display: none;" accept="image/*"/>

<div class="card-container" class:variant-left={styleVariant === 'left'}>
  <div class="background-glow"></div>
  <img src={imageUrl} alt="Foto de {nome}" class="profile-image" on:click|stopPropagation={() => fileInput.click()} title="Clique para alterar a imagem"/>
  <div class="text-content">
    <h2
      class="profile-name"
      style:color={nomeStyle.color}
      style:font-size="{nomeStyle.fontSize}rem"
      style:font-family={fontMap[nomeStyle.fontFamily] || 'inherit'}
      style:font-weight={nomeStyle.bold ? 'bold' : 'normal'}
      style:font-style={nomeStyle.italic ? 'italic' : 'normal'}
      contenteditable="true"
      on:blur={(e) => handleUpdate('nome', e)}
      on:click|stopPropagation={(e) => showPopover(id, e.currentTarget, 'nomeStyle')}
    >{@html nome}</h2>
    <p
      class="profile-bio"
      style:color={bioStyle.color}
      style:font-size="{bioStyle.fontSize}rem"
      style:font-family={fontMap[bioStyle.fontFamily] || 'inherit'}
      style:font-weight={bioStyle.bold ? 'bold' : 'normal'}
      style:font-style={bioStyle.italic ? 'italic' : 'normal'}
      contenteditable="true"
      on:blur={(e) => handleUpdate('bio', e)}
      on:click|stopPropagation={(e) => showPopover(id, e.currentTarget, 'bioStyle')}
    >{@html bio}</p>
  </div>
</div>

<style>
  .card-container {
    position: relative;
    overflow: hidden;
    padding: 2.5rem 2rem;
    border-radius: 1rem;
    
    /* EFEITO VIDRO FOSCO RESTAURADO */
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* EFEITO HOVER RESTAURADO */
  .card-container:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 16px 45px 0 rgba(31, 38, 135, 0.15);
  }

  .profile-image {
    cursor: pointer;
    display: block;
    object-fit: cover;
    border-radius: 50%;
    width: 8rem;
    height: 8rem;
    border: 3px solid white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 2;
  }
  
  [contenteditable] { 
    cursor: pointer; 
  }
  [contenteditable]:hover { 
    background-color: rgba(0,0,0,0.05); 
    border-radius: 8px; 
  }

  .text-content {
    position: relative;
    z-index: 2;
  }
  
  .profile-name {
    margin: 1.5rem 0 0.5rem 0;
  }

  .profile-bio {
    color: #374151;
    line-height: 1.6;
    margin: 0;
  }

  /* BRILHO DE FUNDO RESTAURADO */
  .background-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(101, 83, 228, 0.2), rgba(101, 83, 228, 0) 50%);
    transition: transform 1.2s cubic-bezier(0.075, 0.82, 0.165, 1);
    z-index: 1;
    transform: scale(0);
  }

  .card-container:hover .background-glow {
    transform: scale(1);
  }

  .card-container:not(.variant-left) {
    text-align: center;
  }
  .card-container:not(.variant-left) .profile-image {
    margin-left: auto;
    margin-right: auto;
  }

  .card-container.variant-left {
    display: flex;
    align-items: center;
    text-align: left;
    gap: 2rem;
  }
  .variant-left .profile-image {
    margin: 0;
    width: 7.5rem;
    height: 7.5rem;
    flex-shrink: 0;
  }
  .variant-left .profile-name {
    margin-top: 0;
  }
</style>