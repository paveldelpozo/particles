import { Particle } from '@/classes/Particle'
import { Utils } from '@/classes/Utils'
import { CanvasDrawer } from '@/classes/CanvasDrawer'
import type { CoordinatesInterface } from '@/interfaces/CoordinatesInterface'
import type { ParticlesOptions } from '@/interfaces/ParticlesOptions'

export class Particles {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    drawer: CanvasDrawer

    maxParticles: number
    minRadius: number
    maxRadius: number
    minSpeed: number
    maxSpeed: number

    particles: Particle[] = []
    minDistance: number = 200
    fullOpacityDistance: number = 150
    mouse: CoordinatesInterface = {
        x: 0,
        y: 0
    }

    lastTime = performance.now();
    fps = 0;

    constructor(canvas: HTMLCanvasElement, options?: ParticlesOptions) {
        this.canvas = canvas
        this.maxParticles = options?.maxParticles ?? 10
        this.minRadius = options?.minRadius ?? 2
        this.maxRadius = options?.maxRadius ?? 5
        this.minSpeed = options?.minSpeed ?? .5
        this.maxSpeed = options?.maxSpeed ?? 1
        this.minDistance = options?.minDistance ?? 200
        this.fullOpacityDistance = options?.fullOpacityDistance ?? 150
        this.mouseMinProximity = options?.mouseMinProximity ?? 100
        this.mouseAttraction = options?.mouseAttraction ?? false
        this.ctx = this.canvas.getContext('2d');
        this.init()
    }

    init = (): void => {
        if (this.canvas && this.ctx) {
            this.drawer = new CanvasDrawer(this.canvas, this.ctx)
            this.setFullSizeCanvas()
            this.createInitialParticles()
            this.animate()
            this.canvas.addEventListener('mousemove', this.mouseMoveHandler)
        }
    }

    setFullSizeCanvas = () => {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight - 6
    }

    createInitialParticles = () => {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle())
        }
    }

    createParticle = (fromCenter: boolean = false): Particle => {
        const x = fromCenter ? this.canvas.width / 2 : Utils.random(0, this.canvas.width)
        const y = fromCenter ? this.canvas.height / 2 : Utils.random(0, this.canvas.height)
        const s = Utils.random(this.minSpeed, this.maxSpeed)
        const r = Math.round(Utils.random(this.minRadius, this.maxRadius))
        const options = {
            coordinates: {
                x,
                y
            },
            speed: s,
            radius: r
        }
        return new Particle(options)
    }

    animate = (): void => {
        this.setFullSizeCanvas()
        this.drawer.clearCanvas()
        this.animateParticles()
        this.calculateFPS()
        this.drawInfo()
        requestAnimationFrame(this.animate)
    }

    animateParticles = (): void => {
        const particlesToRemove: number[] = []
        this.particles.forEach((particle: Particle, b: number) => {
            this.drawParticle(particle)
            if (this.checkCollisions(particle)) {
                particlesToRemove.push(b)
            } else {
                this.checkMouseProximity(particle)
            }
        })
        this.removeParticles(particlesToRemove)
        for (let i = 0; i < particlesToRemove.length; i++) {
            this.particles.push(this.createParticle())
        }
        this.updateConnections()
    }

    drawParticle = (particle: Particle): void => {
        this.drawer.drawCircle(
            particle.coordinates,
            particle.radius,
            {
                bgColor: particle.bgColor,
                strokeColor: particle.strokeColor,
                lineWidth: particle.lineWidth
            }
        )
    }

    checkCollisions = (particle: Particle) => {
        return this.particleIsOutsideBoundaries(particle)
    }

    checkMouseProximity = (particle: Particle): void => {
        const distance = Utils.calculateDistance(particle.coordinates, this.mouse)
        if (distance < this.mouseMinProximity && this.mouse.x > 10 && this.mouse.x < this.canvas.width - 10 && this.mouse.y > 10 && this.mouse.y < this.canvas.height - 10) {
            const {radians} = Utils.calculateAngle(particle.coordinates, this.mouse)
            const delta = 2
            particle.coordinates.x = particle.coordinates.x + delta * Math.cos(radians + (this.mouseAttraction ? 0 : Math.PI));
            particle.coordinates.y = particle.coordinates.y + delta * Math.sin(radians + (this.mouseAttraction ? 0 : Math.PI));
        } else {
            particle.move()
        }
    }

    particleIsOutsideBoundaries = (particle) => {
        return particle.coordinates.x + particle.radius > this.canvas.width + this.minDistance
            || particle.coordinates.x - particle.radius < 0 - this.minDistance
            || particle.coordinates.y + particle.radius > this.canvas.height + this.minDistance
            || particle.coordinates.y - particle.radius < 0 - this.minDistance
    }

    removeParticles = (indexes: number[]) => {
        indexes.sort((a, b) => b - a);
        indexes.forEach(index => this.particles.splice(index, 1))
    }

    updateConnections(): void {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const distance = Utils.calculateDistance(this.particles[i].coordinates, this.particles[j].coordinates);
                if (distance < this.minDistance) {
                    this.drawer.drawLine(this.particles[i].coordinates, this.particles[j].coordinates, this.getOpacity(distance));
                }
            }
        }
    }

    getOpacity = (distance) => {
        let opacity
        if (distance <= this.fullOpacityDistance) {
            opacity = 1;
        } else {
            opacity = 1 - (distance - this.fullOpacityDistance) / (this.minDistance - this.fullOpacityDistance);
        }
        return opacity;
    }

    calculateFPS = () => {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        this.fps = 1000 / delta;
    }

    drawInfo = (): void => {
        this.drawer.writeText(`FPS: ${this.fps.toFixed(0)}`, { x: 10, y: 0 })
        this.drawer.writeText(`Mouse: ${this.mouse.x}, ${this.mouse.y}`, { x: 10, y: 20 })
        this.drawer.writeText(`Particles: ${this.particles.length}`, { x: 10, y: 40 })
    }

    mouseMoveHandler = (event): void => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
    }

    unmount = () => {
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler)
    }

}
