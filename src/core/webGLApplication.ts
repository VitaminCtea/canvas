import { Application } from './application'

export class WebGLApplication extends Application {
    public context3D: WebGLRenderingContext | null
    public constructor(canvas: HTMLCanvasElement, contextAttributes?: WebGLRenderingContext) {
        super(canvas)
        this.context3D = this.canvas.getContext('webgl', contextAttributes) as WebGLRenderingContext
        // tslint:disable-next-line: strict-type-predicates
        if (this.context3D === null) {
            throw new Error('无法创建WebGLRenderingContext上下文对象')
        }
    }
}