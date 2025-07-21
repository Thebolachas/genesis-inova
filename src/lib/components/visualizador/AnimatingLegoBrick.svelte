<script lang="ts">
	import { T } from '@threlte/core';
	import { spring } from 'svelte/motion';
	import { onMount } from 'svelte';
	import LegoBrick from './LegoBrick.svelte';

	// As propriedades que nossa peça animada precisa
	export let type: string;
	export let color: string;
	export let isDisabled: boolean;
	export let delay = 0;
	export let onSelect: () => void;

	// Criamos uma mola para a posição Y da peça.
	// Ela começa "flutuando" em y = 3.
	const positionY = spring(3);

	// Quando o componente é montado no universo 3D...
	onMount(() => {
		// ...usamos o 'delay' para esperar um pouco...
		setTimeout(() => {
			// ...e então dizemos à mola para ir para sua posição final (y = 0).
			positionY.set(0);
		}, delay);
	});
</script>

<T.Group
	position.y={$positionY}
	on:click={() => {
		if (!isDisabled) onSelect();
	}}
>
	<LegoBrick id={`available-${type}`} {color} geometry={{ width: 2, depth: 2, height: 'brick' }} />
	<T.Text text={type} position.y={1.2} anchorY="bottom" fontSize={0.3} color="black" />
</T.Group>