<script lang="ts">
  import { T } from '@threlte/core';
  import { spring } from 'svelte/motion';

  export let color = '#ff0000';
  export let positionY = 0.5;

  // MÁGICA DA ANIMAÇÃO:
  // Criamos uma 'spring store'. É um valor que se move suavemente
  // para seu alvo, como uma mola, em vez de pular instantaneamente.
  // Começamos o tijolo "embaixo do chão" (y = -5)
  const animatedPosition = spring({ y: -5 }, {
    stiffness: 0.05,
    damping: 0.2
  });

  // Quando a propriedade 'positionY' muda, nós mandamos a mola
  // se mover suavemente para a nova posição.
  $: animatedPosition.set({ y: positionY });
</script>

<T.Mesh position.y={$animatedPosition.y} castShadow>
  <T.BoxGeometry args={[2, 0.5, 1]} />
  <T.MeshStandardMaterial {color} roughness={0.5} />
</T.Mesh>