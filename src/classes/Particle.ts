import type { ParticleInterface } from '@/interfaces/ParticleInterface'
import { Utils } from '@/classes/Utils'

export class Particle implements ParticleInterface {
    coordinates: {
        x: number,
        y: number
    }
    radius: number
    bgColor: string
    strokeColor: string|null
    lineWidth: number
    dirX: number
    dirY: number
    speed: number

    constructor(options: ParticleInterface) {
        this.coordinates = {
            x: options.coordinates.x,
            y: options.coordinates.y
        }
        this.radius = options.radius ?? Utils.random(5, 20)
        this.bgColor = options.bgColor ?? 'black'
        this.strokeColor = options.strokeColor ?? null
        this.lineWidth = options.lineWidth ?? 0

        this.dirX = Utils.random(-1, 1)
        this.dirY = Utils.random(-1, 1)
        this.speed = options?.speed ?? .1
    }

    move = (speed?: number) => {
        this.coordinates.x += this.dirX * (speed ?? this.speed)
        this.coordinates.y += this.dirY * (speed ?? this.speed)
    }
}
