<script lang="ts">
  import { T } from '@threlte/core'
  export let color = '#FFD700'
</script>
<T.Group>
  <T.Mesh castShadow>
    <T.CylinderGeometry args={[0.5, 0.5, 0.85, 32]} />
    <T.MeshStandardMaterial {color} roughness={0.4} />
  </T.Mesh>
  <T.Mesh position.y={0.425} castShadow>
    <T.CylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
    <T.MeshStandardMaterial {color} />
  </T.Mesh>
</T.Group>