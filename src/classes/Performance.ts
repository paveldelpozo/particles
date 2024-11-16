export class Performance {
    private lastTime = performance.now();
    private fps = 0;

    refresh = () => {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        this.fps = 1000 / delta;
    }

    getFPS = (): string => {
        return this.fps.toFixed(0)
    }
}
