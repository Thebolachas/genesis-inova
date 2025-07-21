<script lang="ts">
  import { T } from '@threlte/core';
  import LegoBrick from './LegoBrick.svelte';
  import type { Writable } from 'svelte/store';

  // Props:
  // 1. A store que contém os dados da animação (posição, rotação)
  export let animationStore: Writable<{ position: {x:number, y:number, z:number}, rotation: {x:number, y:number, z:number}}>;
  
  // 2. As propriedades visuais do nosso bloco de LEGO
  export let brickProps: any;
</script>

<T.Group
  position={$animationStore.position}
  rotation={$animationStore.rotation}
>
  <LegoBrick {...brickProps} positionY={0} />
</T.Group>