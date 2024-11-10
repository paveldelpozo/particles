<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Particles } from '@/classes/Particles'

const canvas = ref<HTMLCanvasElement>()
const bg = ref<null|Particles>()
const options = ref({
    maxParticles: 100,
    minDistance: 200,
    maxSpeed: 1,
    fullOpacityDistance: 50,
    mouseAttraction: true,
    mouseMinProximity: 250
})

onMounted(() => {
    bg.value = new Particles(canvas.value, options.value)
})

onBeforeUnmount(() => {
    bg.value?.unmount()
})
</script>

<template>
    <canvas ref="canvas"></canvas>
</template>

<style scoped>

</style>
