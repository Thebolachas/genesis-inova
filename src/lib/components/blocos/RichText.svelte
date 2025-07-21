<script lang="ts">
  import { updateBlockProps } from '$lib/stores';
  import { showPopover } from '$lib/popoverStore';
  import { activeTemplate } from '$lib/stores';

  export let id: string;
  export let titulo: string;
  export let texto: string;
  export let tituloStyle: { color: string, fontSize: number, fontFamily: string, bold: boolean, italic: boolean };
  export let textoStyle: { color: string, fontSize: number, fontFamily: string, bold: boolean, italic: boolean };

  function handleUpdate(propName: 'titulo' | 'texto', event: FocusEvent) {
    const newValue = (event.currentTarget as HTMLElement).innerHTML;
    updateBlockProps(id, { [propName]: newValue });
  }

  const fontMap = { 'Default': 'inherit', 'Roboto': "'Roboto', sans-serif", 'Montserrat': "'Montserrat', sans-serif", 'Lora': "'Lora', serif", 'Playfair Display': "'Playfair Display', serif", 'Poppins': "'Poppins', sans-serif" };
</script>

<div class="richtext-wrapper" class:landing-style={$activeTemplate === 'landing'}>
  <div class="background-glow"></div>
  <div class="richtext-container">
    <h2
      contenteditable="true"
      on:blur={(e) => handleUpdate('titulo', e)}
      on:click|stopPropagation={(e) => showPopover(id, e.currentTarget, 'tituloStyle')}
      style:color={tituloStyle.color}
      style:font-size="{tituloStyle.fontSize}rem"
      style:font-family={fontMap[tituloStyle.fontFamily] || 'inherit'}
      style:font-weight={tituloStyle.bold ? 'bold' : 'normal'}
      style:font-style={tituloStyle.italic ? 'italic' : 'normal'}
    >{@html titulo}</h2>
    <p
      contenteditable="true"
      on:blur={(e) => handleUpdate('texto', e)}
      on:click|stopPropagation={(e) => showPopover(id, e.currentTarget, 'textoStyle')}
      style:color={textoStyle.color}
      style:font-size="{textoStyle.fontSize}rem"
      style:font-family={fontMap[textoStyle.fontFamily] || 'inherit'}
      style:font-weight={textoStyle.bold ? 'bold' : 'normal'}
      style:font-style={textoStyle.italic ? 'italic' : 'normal'}
    >{@html texto}</p>
  </div>
</div>

<style>
  .richtext-wrapper { position: relative; border-radius: 1rem; }
  .richtext-wrapper.landing-style { overflow: hidden; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .richtext-wrapper.landing-style:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 16px 45px 0 rgba(31, 38, 135, 0.15); }
  .background-glow { display: none; }
  .richtext-wrapper.landing-style .background-glow { display: block; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(101, 83, 228, 0.15), rgba(101, 83, 228, 0) 50%); transition: transform 1.2s cubic-bezier(0.075, 0.82, 0.165, 1); z-index: 1; transform: scale(0); }
  .richtext-wrapper.landing-style:hover .background-glow { transform: scale(1); }
  .richtext-container { padding: 2.5rem; position: relative; z-index: 2; background: white; border: 1px solid #e5e7eb; border-radius: 1rem; }
  .landing-style .richtext-container { background: transparent; border: none; }
  [contenteditable] { cursor: pointer; transition: background-color 0.2s; border-radius: 8px; padding: 0.25rem; }
  [contenteditable]:hover { background-color: rgba(0,0,0,0.05); }
  h2 { margin: 0 0 1rem 0; }
  p { margin: 0; line-height: 1.7; }
</style>