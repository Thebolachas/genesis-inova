<script lang="ts">
  export let imageUrl: string = "https://placehold.co/128x128/e0e7ff/3730a3?text=Eu";
  export let nome: string = "Seu Nome Aqui";
  export let bio: string = "Uma breve biografia sobre você, suas paixões, e o que você faz.";
</script>

<div class="card-container">
  <img src={imageUrl} alt="Foto de {nome}" class="profile-image" />
  <h2 class="profile-name">{nome}</h2>
  <p class="profile-bio">{bio}</p>
</div>

<style>
  .card-container {
    background-color: #ffffff;
    border-radius: 0.75rem; /* 12px */
    padding: 2.5rem 2rem;
    text-align: center;
    max-width: 500px;
    margin: 2rem auto; /* Centraliza o card */
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  .profile-image {
    width: 8rem; /* 128px */
    height: 8rem; /* 128px */
    border-radius: 9999px; /* Círculo perfeito */
    object-fit: cover; /* Garante que a imagem não se distorça */
    margin: 0 auto 1.5rem auto;
    border: 4px solid #ffffff;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .profile-name {
    font-size: 1.875rem; /* 30px */
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }

  .profile-bio {
    color: #4b5563;
    font-size: 1rem; /* 16px */
    line-height: 1.5;
    margin: 0;
  }
</style>