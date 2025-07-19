<script lang="ts">
  export let imageUrl: string;
  export let legenda: string;
</script>

<figure class="imageblock-container">
  <img src={imageUrl} alt={legenda} />
  {#if legenda}
    <figcaption>{legenda}</figcaption>
  {/if}
</figure>

<style>
  .imageblock-container {
    margin: 0;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    border: 1px solid #e5e7eb;
    background: white;
  }
  img {
    display: block;
    width: 100%;
    height: auto;
  }
  figcaption {
    padding: 1rem 1.5rem;
    text-align: center;
    font-style: italic;
    color: #6b7280;
    background-color: #f9fafb;
  }
</style>