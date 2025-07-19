<script lang="ts">
  import { T } from '@threlte/core'
  import { spring } from 'svelte/motion'

  type Geometry = { width: number; depth: number; height: 'brick' | 'plate' }
  export let geometry: Geometry = { width: 2, depth: 2, height: 'brick' }
  export let positionY: number = 0.5
  export let color: string = '#ff0000'
  export let scale: number = 1.0

  const P_UNIT = 1;
  const BRICK_HEIGHT = 1.2;
  const PLATE_HEIGHT = 0.4;
  
  $: height = geometry.height === 'brick' ? BRICK_HEIGHT : PLATE_HEIGHT;
  $: width = geometry.width * P_UNIT;
  $: depth = geometry.depth * P_UNIT;

  const animatedPosition = spring({ y: -10 }, { stiffness: 0.05, damping: 0.2 });
  $: animatedPosition.set({ y: positionY });

  $: studs = Array(geometry.width * geometry.depth).fill(0);
</script>

<T.Group {scale} position.y={$animatedPosition.y}>
  <T.Mesh castShadow>
    <T.BoxGeometry args={[width, height, depth]} />
    <T.MeshStandardMaterial {color} roughness={0.5} />
  </T.Mesh>

  {#each studs as _, i}
    {@const x = i % geometry.width}
    {@const z = Math.floor(i / geometry.width)}
    <T.Mesh
      position.x={x * P_UNIT - width / 2 + P_UNIT / 2}
      position.y={height / 2}
      position.z={z * P_UNIT - depth / 2 + P_UNIT / 2}
      castShadow
    >
      <T.CylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
      <T.MeshStandardMaterial {color} roughness={0.5} />
    </T.Mesh>
  {/each}
</T.Group>