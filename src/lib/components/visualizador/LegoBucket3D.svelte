<script lang="ts">
  import { T } from '@threlte/core';
  import { spring } from 'svelte/motion';

  export let tipping = false;
  // Usamos uma spring para animar a rotação quando o botão for clicado
  const rotation = spring({ x: 0, z: 0 });

  // Quando a prop 'tipping' se tornar verdadeira, mandamos a mola girar o pote
  $: if (tipping) {
    rotation.set({ x: -Math.PI / 1.8, z: -0.2 });
  }

  // Proporções baseadas nas dimensões de uma peça real, escalonadas
  const bucketHeight = 2.6;
  const topRadius = 1.8;
  const bottomRadius = 1.5;

</script>

<T.Group rotation.x={$rotation.x} rotation.z={$rotation.z}>
  <T.Mesh position.y={-0.5} castShadow receiveShadow>
    <T.CylinderGeometry args={[topRadius, bottomRadius, bucketHeight, 32]} />
    <T.MeshStandardMaterial color="#f59e0b" roughness={0.4} />
  </T.Mesh>

  <T.Mesh position.y={bucketHeight / 2 - 0.4} castShadow>
    <T.CylinderGeometry args={[topRadius + 0.1, topRadius + 0.1, 0.3, 32]} />
    <T.MeshStandardMaterial color="#f59e0b" roughness={0.4} />
  </T.Mesh>
</T.Group>