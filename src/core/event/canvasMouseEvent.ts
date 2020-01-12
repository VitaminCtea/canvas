import { CanvasInputEvent } from './canvasInputEvent'
import { Vec2 } from '../math2D'

export class CanvasMouseEvent extends CanvasInputEvent {
	public button: number
	public canvasPosition: Vec2
	public localPosition: Vec2
	public constructor(
		canvasPos: Vec2,
		button: number,
		altKey: boolean = false,
		ctrlKey: boolean = false,
		shiftKey: boolean = false
	) {
		super(altKey, ctrlKey, shiftKey)
		this.canvasPosition = canvasPos
		this.button = button
		this.localPosition = Vec2.create()
	}
}
