import type { CoordinatesInterface } from '@/interfaces/CoordinatesInterface'

export class CanvasDrawer {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas
        this.ctx = ctx
    }

    drawCircle = (coordinates: CoordinatesInterface, radius: number, options?: { bgColor?: string, strokeColor?: string, lineWidth?: number }): void => {
        this.ctx.beginPath()
        this.ctx.arc(coordinates.x, coordinates.y, radius, 0, 2 * Math.PI)
        if (options?.bgColor) {
            this.ctx.fillStyle = options?.bgColor
            this.ctx.fill()
        }
        if (options?.lineWidth && options?.strokeColor) {
            this.ctx.lineWidth = options?.lineWidth
            this.ctx.strokeStyle = options?.strokeColor
            this.ctx.stroke()
        }
        this.ctx.closePath()
    }

    drawLine = (obj1: CoordinatesInterface, obj2: CoordinatesInterface, opacity: number): void => {
        this.ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
        this.ctx.beginPath();
        this.ctx.moveTo(obj1.x, obj1.y);
        this.ctx.lineTo(obj2.x, obj2.y);
        this.ctx.stroke();
    }

    writeText = (text: string, coordinates: CoordinatesInterface, font = null): void => {
        const fontSize = font?.size ?? 12
        const fontFamily = font?.family ?? 'sans-serif'
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        this.ctx.fillText(text, coordinates.x, coordinates.y + fontSize);
    }

    clearCanvas = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}
