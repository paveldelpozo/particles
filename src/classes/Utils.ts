import type { CoordinatesInterface } from '@/interfaces/CoordinatesInterface'

export class Utils {
    static random(min: number, max: number) {
        return (Math.random() * (max - min)) + min;
    }

    static calculateDistance(obj1: CoordinatesInterface, obj2: CoordinatesInterface): number {
        const dX = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        return Math.sqrt(dX * dX + dy * dy);
    }

    static calculateAngle(obj1: CoordinatesInterface, obj2: CoordinatesInterface) {
        const angleRadians = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
        const angleDegrees = angleRadians * (180 / Math.PI);
        return {
            radians: angleRadians,
            degrees: angleDegrees
        };
    }
}
