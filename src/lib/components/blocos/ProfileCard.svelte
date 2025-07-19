<script lang="ts">
  export let imageUrl: string;
  export let nome: string;
  export let bio: string;
  export let styleVariant: 'top' | 'left' = 'top';
</script>

<div class="card-container" class:variant-left={styleVariant === 'left'}>
  <div class="background-glow"></div>

  <img src={imageUrl} alt="Foto de {nome}" class="profile-image" />
  <div class="text-content">
    <h2 class="profile-name">{nome}</h2>
    <p class="profile-bio">{bio}</p>
  </div>
</div>

<style>
  .card-container {
    position: relative; /* Essencial para o posicionamento do brilho */
    overflow: hidden; /* Garante que o brilho não vaze */
    padding: 2.5rem 2rem;
    border-radius: 1rem; /* Borda mais arredondada */
    
    /* --- Efeito Glassmorphism --- */
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px); /* Suporte para Safari */
    border: 1px solid rgba(255, 255, 255, 0.2);

    /* --- Sombra Suave e Transição --- */
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* --- Micro-interação no Hover --- */
  .card-container:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 16px 45px 0 rgba(31, 38, 135, 0.15);
  }

  .profile-image {
    display: block;
    object-fit: cover;
    border-radius: 50%;
    width: 8rem;
    height: 8rem;
    
    /* Borda e sombra na imagem para destacá-la do fundo */
    border: 3px solid white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    position: relative; /* Garante que a imagem fique acima do brilho */
    z-index: 2;
  }

  .text-content {
    position: relative; /* Garante que o texto fique acima do brilho */
    z-index: 2;
  }
  
  .profile-name {
    font-size: 2rem;
    font-weight: 700;
    margin: 1.5rem 0 0.5rem 0;

    /* --- Título com Gradiente --- */
    background: linear-gradient(45deg, #2c3e50, #4b6cb7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
  }

  .profile-bio {
    color: #374151; /* Um pouco mais escuro para melhor contraste */
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
  }

  /* --- Elemento de Brilho de Fundo --- */
  .background-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(101, 83, 228, 0.2), rgba(101, 83, 228, 0) 50%);
    transition: transform 1.2s cubic-bezier(0.075, 0.82, 0.165, 1);
    z-index: 1;
    transform: scale(0); /* Começa invisível */
  }

  .card-container:hover .background-glow {
    transform: scale(1);
  }


  /* --- ESTILO PADRÃO (IMAGEM NO TOPO) --- */
  .card-container:not(.variant-left) {
    text-align: center;
  }
  .card-container:not(.variant-left) .profile-image {
    margin-left: auto;
    margin-right: auto;
  }

  /* --- VARIANTE (IMAGEM À ESQUERDA) --- */
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