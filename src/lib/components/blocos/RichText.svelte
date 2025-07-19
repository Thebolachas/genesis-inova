<script lang="ts">
  export let titulo: string;
  export let texto: string;
</script>

<div class="richtext-container">
  <h2>{titulo}</h2>
  <p>{texto}</p>
</div>

<style>
  .richtext-container {
    background: white;
    padding: 2.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    border: 1px solid #e5e7eb;
  }
  h2 { margin: 0 0 1rem 0; font-size: 1.75rem; color: #1f2937; }
  p { margin: 0; line-height: 1.7; color: #4b5563; }
</style>