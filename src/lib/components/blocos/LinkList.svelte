<script lang="ts">
  // A 'prop' aqui não é uma string ou número, mas um ARRAY de objetos!
  export let links: { text: string; url: string }[] = [];
</script>

{#if links.length > 0}
  <div class="links-container">
    {#each links as link}
      <a href={link.url} target="_blank" rel="noopener noreferrer" class="link-button">
        {link.text}
      </a>
    {/each}
  </div>
{/if}

<style>
  .links-container {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem; /* Espaçamento entre os botões */
  }

  .link-button {
    display: block;
    background-color: #3730a3; /* Indigo */
    color: #ffffff;
    text-decoration: none;
    padding: 1rem;
    border-radius: 0.5rem; /* 8px */
    text-align: center;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
  }

  .link-button:hover {
    background-color: #312e81;
    transform: translateY(-2px); /* Efeito de elevação sutil */
  }
</style>