<script lang="ts">
  import { updateBlockProps, handleImageUpload } from '$lib/stores';
  import { showPopover } from '$lib/popoverStore';

  export let id: string;
  export let imageUrl: string;
  export let legenda: string;
  export let legendaStyle: { color: string, fontSize: number, fontFamily: string, bold: boolean, italic: boolean };
  
  let fileInput: HTMLInputElement;

  function handleUpdate(event: FocusEvent) {
    const newValue = (event.currentTarget as HTMLElement).innerText;
    updateBlockProps(id, { legenda: newValue });
  }

  const fontMap = { 'Default': 'inherit', 'Roboto': "'Roboto', sans-serif", 'Montserrat': "'Montserrat', sans-serif", 'Lora': "'Lora', serif", 'Playfair Display': "'Playfair Display', serif", 'Poppins': "'Poppins', sans-serif" };
</script>

<input type="file" bind:this={fileInput} on:change={(e) => handleImageUpload(e, id)} style="display: none;" accept="image/*"/>

<figure class="imageblock-container">
  <img 
    src={imageUrl} 
    alt={legenda} 
    on:click|stopPropagation={() => fileInput.click()}
    title="Clique para alterar a imagem"
  />
  
  {#if legenda || legenda !== ""}
    <figcaption
      contenteditable="true"
      on:blur={handleUpdate}
      on:click|stopPropagation={(e) => showPopover(id, e.currentTarget, 'legendaStyle')}
      style:color={legendaStyle.color}
      style:font-size="{legendaStyle.fontSize}rem"
      style:font-family={fontMap[legendaStyle.fontFamily] || 'inherit'}
      style:font-weight={legendaStyle.bold ? 'bold' : 'normal'}
      style:font-style={legendaStyle.italic ? 'italic' : 'normal'}
    >{@html legenda}</figcaption>
  {/if}
</figure>

<style>
  .imageblock-container { margin: 0; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; background: white; }
  img { display: block; width: 100%; height: auto; cursor: pointer; }
  figcaption { padding: 1rem 1.5rem; text-align: center; background-color: #f9fafb; cursor: pointer; transition: background-color 0.2s; border-radius: 8px; }
  figcaption:hover { background-color: rgba(0,0,0,0.05); }
</style>