import { Application } from './application'

export class Canvas2DApplication extends Application {
    public context2D: CanvasRenderingContext2D | null
    public constructor(canvas: HTMLCanvasElement, contextAttributes?: WebGLRenderingContext) {
        super(canvas)
        this.context2D = this.canvas.getContext('2d', contextAttributes) as CanvasRenderingContext2D
    }
}