import type {CoordinatesInterface} from '@/interfaces/CoordinatesInterface'
import type {ParticlesOptions} from '@/interfaces/ParticlesOptions'
import {CanvasDrawer} from '@/classes/CanvasDrawer'
import {Particle} from '@/classes/Particle'
import {Performance} from "@/classes/Performance";
import {Utils} from '@/classes/Utils'

export class Particles {
    performance: Performance

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D|null
    drawer: CanvasDrawer|null

    maxParticles: number
    minRadius: number
    maxRadius: number
    minSpeed: number
    maxSpeed: number
    minDistance: number = 200
    fullOpacityDistance: number = 150
    mouseMinProximity: number = 100
    mouseAttraction: boolean = false
    mouseRepulsion: boolean = false

    particles: Particle[] = []
    pause: boolean

    mouse: CoordinatesInterface = {
        x: 0,
        y: 0
    }

    constructor(canvas: HTMLCanvasElement, options?: ParticlesOptions) {
        this.performance = new Performance()
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d');
        this.drawer = null
        this.maxParticles = options?.maxParticles ?? 10
        this.minRadius = options?.minRadius ?? 2
        this.maxRadius = options?.maxRadius ?? 5
        this.minSpeed = options?.minSpeed ?? .5
        this.maxSpeed = options?.maxSpeed ?? 1
        this.minDistance = options?.minDistance ?? 200
        this.fullOpacityDistance = options?.fullOpacityDistance ?? 150
        this.mouseMinProximity = options?.mouseMinProximity ?? 100
        this.mouseAttraction = options?.mouseAttraction ?? false
        this.mouseRepulsion = options?.mouseRepulsion ?? false
        this.pause = false
        this.init()
    }

    init = (): void => {
        if (this.canvas && this.ctx) {
            this.drawer = new CanvasDrawer(this.canvas, this.ctx)
            this.setFullSizeCanvas()
            this.createInitialParticles()
            this.animate()
            this.canvas.addEventListener('mousemove', this.mouseMoveHandler)
            //this.canvas.addEventListener('touchmove', this.mouseMoveHandler, { passive: true })
            this.canvas.addEventListener('click', this.mouseClickHandler)
            this.canvas.addEventListener('contextmenu', this.mouseRightClickHandler)
            this.canvas.addEventListener('touchstart', this.mouseTouchStartHandler, { passive: true })
            this.canvas.addEventListener('touchend', this.mouseTouchEndHandler)
            this.canvas.addEventListener("wheel", this.mouseWheelHandler, { passive: true });
            window.addEventListener('keyup', this.keyUpHandler)
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
        if (!this.drawer) return
        this.setFullSizeCanvas()
        this.drawer.clearCanvas()
        this.animateParticles()
        this.performance.refresh()
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
        this.drawMouse()
    }

    drawParticle = (particle: Particle): void => {
        if (!this.drawer) return
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
        if (!this.drawer) return
        const distance = Utils.calculateDistance(particle.coordinates, this.mouse)
        if ((this.mouseAttraction || this.mouseRepulsion)
            && !this.pause
            && distance < this.mouseMinProximity
            && this.mouse.x > 10
            && this.mouse.x < this.canvas.width - 10
            && this.mouse.y > 10
            && this.mouse.y < this.canvas.height - 10
        ) {
            const {radians} = Utils.calculateAngle(particle.coordinates, this.mouse)
            const delta = 2

            particle.coordinates.x = particle.coordinates.x + delta * Math.cos(radians + (this.mouseAttraction ? 0 : Math.PI));
            particle.coordinates.y = particle.coordinates.y + delta * Math.sin(radians + (this.mouseAttraction ? 0 : Math.PI));
        }
        if (!this.mouseAttraction && !this.mouseRepulsion) {
            this.drawer.drawLine(particle.coordinates, this.mouse, this.getOpacity(distance), 2);
        }
        if (!this.pause && (distance > this.mouseMinProximity + 2 || (!this.mouseAttraction && !this.mouseRepulsion))) {
            particle.move()
        }
    }

    particleIsOutsideBoundaries = (particle: Particle) => {
        return particle.coordinates.x + particle.radius > this.canvas.width + this.minDistance
            || particle.coordinates.x - particle.radius < 0 - this.minDistance
            || particle.coordinates.y + particle.radius > this.canvas.height + this.minDistance
            || particle.coordinates.y - particle.radius < 0 - this.minDistance
    }

    removeParticles = (indexes: number[]) => {
        indexes.sort((a, b) => b - a);
        indexes.forEach(index => this.particles.splice(index, 1))
    }

    updateConnections = (): void => {
        if (!this.drawer) return
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const distance = Utils.calculateDistance(this.particles[i].coordinates, this.particles[j].coordinates);
                if (distance < this.minDistance) {
                    this.drawer.drawLine(this.particles[i].coordinates, this.particles[j].coordinates, this.getOpacity(distance));
                }
            }
        }
    }

    drawMouse = () => {
        const mouseCircle = new Particle({ coordinates: this.mouse, radius: 10, bgColor: '#000' })
        this.drawParticle(mouseCircle)
    }

    getOpacity = (distance: number) => {
        let opacity
        if (distance <= this.fullOpacityDistance) {
            opacity = 1;
        } else {
            opacity = 1 - (distance - this.fullOpacityDistance) / (this.minDistance - this.fullOpacityDistance);
        }
        return opacity;
    }

    drawInfo = (): void => {
        if (!this.drawer) return
        this.drawer.writeText(`FPS: ${this.performance.getFPS()}`, {x: 10, y: 0})
        this.drawer.writeText(`Mouse: ${this.mouse.x}, ${this.mouse.y}`, {x: 10, y: 20})
        this.drawer.writeText(`Particles: ${this.particles.length}`, {x: 10, y: 40})
    }

    mouseMoveHandler = (event: MouseEvent): void => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
    }

    mouseClickHandler = (): void => {
        this.mouseAttraction = !this.mouseAttraction;
        if (this.mouseAttraction) this.mouseRepulsion = false
    }

    mouseRightClickHandler = (event: MouseEvent): void => {
        event.preventDefault()
        this.mouseRepulsion = !this.mouseRepulsion
        if (this.mouseRepulsion) this.mouseAttraction = false
    }

    mouseTouchStartHandler = (): void => {
        this.mouseAttraction = true
    }

    mouseTouchEndHandler = (): void => {
        this.mouseAttraction = false
    }

    mouseWheelHandler = (event: WheelEvent): void => {
        if (event.deltaX < 0 || event.deltaY < 0 || event.deltaZ < 0) {
            this.particles.splice(this.maxParticles--, 1)
        } else {
            this.maxParticles++
            this.particles.push(this.createParticle())
        }
    }

    keyUpHandler = (event: KeyboardEvent): void => {
        switch (event.code) {
            case 'Space':
                this.pause = !this.pause
                break
        }
    }

    unmount = () => {
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler)
        // this.canvas.removeEventListener('touchmove', this.mouseMoveHandler)
        this.canvas.removeEventListener('click', this.mouseClickHandler)
        this.canvas.removeEventListener('contextmenu', this.mouseRightClickHandler)
        this.canvas.removeEventListener('touchstart', this.mouseTouchStartHandler)
        this.canvas.removeEventListener('touchend', this.mouseTouchEndHandler)
        this.canvas.removeEventListener("wheel", this.mouseWheelHandler);
        window.removeEventListener('keyup', this.keyUpHandler)
    }

}
