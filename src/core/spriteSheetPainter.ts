import { Sprite } from './sprite'

export class SpriteSheetPainter {
	public cells: any[]
	public cellIndex: number
	public spriteSheet: HTMLImageElement
	constructor(cells: any[] = [], spriteSheet: HTMLImageElement) {
		this.cells = cells
		this.cellIndex = 0
		this.spriteSheet = spriteSheet
	}
	advance(): void {
		if (this.cellIndex === this.cells.length - 1) {
			this.cellIndex = 0
		} else {
			this.cellIndex++
		}
	}
	paint(sprite: Sprite, context: CanvasRenderingContext2D): void {
		const cell: any = this.cells[this.cellIndex]
		if (this.spriteSheet.complete) {
			context.drawImage(
				this.spriteSheet,
				cell.left,
				cell.top,
				cell.width,
				cell.height,
				sprite.left,
				sprite.top,
				cell.width,
				cell.height
			)
		}
	}
}
