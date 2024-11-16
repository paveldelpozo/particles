<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Particles } from '@/classes/Particles'
import type {ParticlesOptions} from "@/interfaces/ParticlesOptions";
import GitHub from '@/components/GitHub.vue'

const canvas = ref<HTMLCanvasElement>()
const bg = ref<null|Particles>()
const options = ref<ParticlesOptions>({
    maxParticles: 100,
    minDistance: 200,
    maxSpeed: 1,
    fullOpacityDistance: 50,
    mouseAttraction: false,
    mouseRepulsion: false,
    mouseMinProximity: 250
})

onMounted(() => {
    //@ts-expect-error use refs to create instance of Particles
    bg.value = new Particles(canvas.value, options.value)
})

onBeforeUnmount(() => {
    bg.value?.unmount()
})
</script>

<template>
    <canvas ref="canvas"></canvas>

    <git-hub color="#1D1D1D" url="https://github.com/paveldelpozo/particles" />
</template>

<style scoped>

</style>
