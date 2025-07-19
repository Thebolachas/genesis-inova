<script lang="ts">
    import { Canvas } from '@threlte/core'
    import { T } from '@threlte/core'
    import { OrbitControls } from '@threlte/extras'
    import LegoMinifigure from '$lib/components/visualizador/LegoMinifigure.svelte';
    import Interactor from '$lib/components/Interactor.svelte';

    let showHead = true;
    let showTorso = true;
    let showLegs = true;
</script>

<div class="test-controls">
    <h2>Controles do Avatar</h2>
    <label><input type="checkbox" bind:checked={showLegs}> Mostrar Pernas</label>
    <label><input type="checkbox" bind:checked={showTorso}> Mostrar Tronco</label>
    <label><input type="checkbox" bind:checked={showHead}> Mostrar Cabeça</label>
</div>

<div class="canvas-container">
    <Canvas>
        <Interactor />
        <T.Color attach="background" args={['#f0f0f0']} />
        <T.AmbientLight intensity={0.7} />
        <T.DirectionalLight position={[10, 10, 10]} intensity={1} />
        <T.PerspectiveCamera makeDefault position={[0, 4, 8]}>
            <OrbitControls />
        </T.PerspectiveCamera>
        <LegoMinifigure {showLegs} {showTorso} {showHead} />
    </Canvas>
</div>

<style>
    .test-controls {
        position: absolute; top: 1rem; left: 1rem; z-index: 10;
        background: white; padding: 1rem; border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .canvas-container {
        position: fixed; top: 0; left: 0;
        width: 100vw; height: 100vh;
    }
</style>