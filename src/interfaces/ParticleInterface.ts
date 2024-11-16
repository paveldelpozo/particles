import type { CoordinatesInterface } from '@/interfaces/CoordinatesInterface'

export interface ParticleInterface {
    coordinates: CoordinatesInterface
    radius?: number
    bgColor?: string
    strokeColor?: string|null
    lineWidth?: number
    speed?: number
}
