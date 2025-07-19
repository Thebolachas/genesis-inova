<script lang="ts">
  import { T } from '@threlte/core'

  export let showLegs = false;
  export let showTorso = false;
  export let showHead = false;
  const C = { blue: '#0055BF', red: '#DA291C', yellow: '#FFD700', black: '#231F20' }
</script>

<T.Group>
  {#if showLegs}
    <T.Group position.y={0.8}>
      <T.Mesh position.x={-0.38} castShadow><T.BoxGeometry args={[0.7, 1.4, 0.8]} /><T.MeshStandardMaterial color={C.blue} /></T.Mesh>
      <T.Mesh position.x={0.38} castShadow><T.BoxGeometry args={[0.7, 1.4, 0.8]} /><T.MeshStandardMaterial color={C.blue} /></T.Mesh>
      <T.Mesh position.y={0.7}><T.CylinderGeometry args={[0.4, 0.4, 0.3, 16]} /><T.MeshStandardMaterial color={C.black} /></T.Mesh>
    </T.Group>
  {/if}
  {#if showTorso}
    <T.Group position.y={2.2}>
      <T.Mesh castShadow><T.BoxGeometry args={[1.7, 1.3, 0.85]} /><T.MeshStandardMaterial color={C.red} /></T.Mesh>
      
      <T.Mesh position.y={0.73} castShadow>
        <T.CylinderGeometry args={[0.18, 0.18, 0.16, 16]} />
        <T.MeshStandardMaterial color={C.red} />
      </T.Mesh>
      
      <T.Group position.x={-0.95} position.y={0.1}>
        <T.Mesh castShadow>
          <T.CylinderGeometry args={[0.25, 0.25, 1.0, 12]} />
          <T.MeshStandardMaterial color={C.red} />
        </T.Mesh>
        <T.Mesh position.y={-0.5} rotation.x={-Math.PI / 2} rotation.z={Math.PI / 2} castShadow>
          <T.TorusGeometry args={[0.22, 0.1, 8, 16, Math.PI * 1.75]} />
          <T.MeshStandardMaterial color={C.yellow} />
        </T.Mesh>
      </T.Group>

      <T.Group position.x={0.95} position.y={0.1}>
        <T.Mesh castShadow>
          <T.CylinderGeometry args={[0.25, 0.25, 1.0, 12]} />
          <T.MeshStandardMaterial color={C.red} />
        </T.Mesh>
        <T.Mesh position.y={-0.5} rotation.x={-Math.PI / 2} rotation.z={Math.PI / 2} castShadow>
          <T.TorusGeometry args={[0.22, 0.1, 8, 16, Math.PI * 1.75]} />
          <T.MeshStandardMaterial color={C.yellow} />
        </T.Mesh>
      </T.Group>
    </T.Group>
  {/if}
  {#if showHead}
    <T.Group position.y={3.335}>
      <T.Mesh castShadow><T.CylinderGeometry args={[0.5, 0.5, 0.85, 32]} /><T.MeshStandardMaterial color={C.yellow} /></T.Mesh>
      <T.Mesh position.y={0.425} castShadow><T.CylinderGeometry args={[0.3, 0.3, 0.2, 16]} /><T.MeshStandardMaterial color={C.yellow} /></T.Mesh>
      <T.Group position.z={0.51}>
        <T.Mesh position.x={-0.15} position.y={0.1}><T.CircleGeometry args={[0.07, 32]} /><T.MeshBasicMaterial color={C.black} /></T.Mesh>
        <T.Mesh position.x={0.15} position.y={0.1}><T.CircleGeometry args={[0.07, 32]} /><T.MeshBasicMaterial color={C.black} /></T.Mesh>
        <T.Mesh position.y={-0.1} rotation.z={Math.PI}><T.TorusGeometry args={[0.2, 0.04, 8, 32, Math.PI]} /><T.MeshBasicMaterial color={C.black} /></T.Mesh>
      </T.Group>
    </T.Group>
  {/if}
</T.Group>