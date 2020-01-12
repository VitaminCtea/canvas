import { Canvas2DApplication } from './canvas2DApplication'
import { Colors } from '../colors'
import { Repeat, Font, ETextLayout } from '../types'
import { Rectangle, Size, Vec2 } from './math2D'
import { Position } from '../position'

export class TestApplication extends Canvas2DApplication {
	private _lineDashOffset: number = 0
	private _pattern: CanvasPattern
	public context2D: CanvasRenderingContext2D
	constructor(canvas: HTMLCanvasElement, contextAttributes?: WebGLRenderingContext) {
		super(canvas)
		this.context2D = this.context2D
	}
	public render(): void {
		// this.context2D.clearRect(0, 0, this.context2D.canvas.width, this.context2D.canvas.height)
	}
	public fillPatternRect(
		x: number,
		y: number,
		w: number,
		h: number,
		imgPath: string,
		repeat: Repeat = 'repeat'
	): void {
		if (!this._pattern) {
			let img: HTMLImageElement = document.createElement('img')
			img.src = imgPath
			img.onload = (ev: Event) => {
				this._pattern = this.context2D.createPattern(img, repeat)
				this.fillPattern(x, y, w, h)
			}
			return
		}
		this.fillPattern(x, y, w, h)
	}
	public fillPattern(x: number, y: number, w: number, h: number) {
		this.context2D.save()
		this.context2D.fillStyle = this._pattern
		this.context2D.beginPath()
		this.context2D.rect(x, y, w, h)
		this.context2D.fill()
		this.context2D.restore()
	}
	private _drawRect(x: number, y: number, w: number, h: number): void {
		this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.context2D.save()

		this.context2D.fillStyle = Colors[Colors.white]
		this.context2D.strokeStyle = Colors[Colors.blue]
		this.context2D.lineWidth = 2

		this.context2D.setLineDash([16, 6])
		this.context2D.lineDashOffset = -this._lineDashOffset

		this.context2D.beginPath()
		this.context2D.moveTo(x, y)
		this.context2D.lineTo(x + w, y)
		this.context2D.lineTo(x + w, y + h)
		this.context2D.lineTo(x, y + h)
		this.context2D.closePath()

		this.context2D.fill()
		this.context2D.stroke()

		this.context2D.restore()
	}
	private _updateLineDashOffset(): void {
		this._lineDashOffset++
		if (this._lineDashOffset > 10000) {
			this._lineDashOffset = 0
		}
	}
	public timeCallback(id: number, data: any): void {
		this._updateLineDashOffset()
		this._drawRect(10, 10, this.canvas.width - 20, this.canvas.height - 20)
		this.strokeGrid()
	}
	public start(): void {
		this.addTimer((id: number, data: any): void => {
			this.timeCallback(id, data)
		}, 0.05)
		super.start()
	}
	public fillCircle(
		x: number,
		y: number,
		radius: number,
		fillStyle: string | CanvasGradient | CanvasPattern = Colors[Colors.red]
	): void {
		this.context2D.save()
		this.context2D.fillStyle = fillStyle
		this.context2D.beginPath()
		this.context2D.arc(x, y, radius, 0, Math.PI * 2)
		this.context2D.fill()
		this.context2D.restore()
	}
	public strokeLine(x0: number, y0: number, x1: number, y1: number): void {
		this.context2D.beginPath()
		this.context2D.moveTo(x0, y0)
		this.context2D.lineTo(x1, y1)
		this.context2D.stroke()
	}
	public strokeCoordinate(originX: number, originY: number, width: number, height: number): void {
		this.context2D.save()
		this.context2D.strokeStyle = Colors[Colors.red]
		this.strokeLine(originX, originY, originX + width, originY)
		this.context2D.strokeStyle = Colors[Colors.blue]
		this.strokeLine(originX, originY, originX, originY + height)
		this.context2D.restore()
	}
	public strokeGrid(color: string = Colors[Colors.grey], interval: number = 10): void {
		this.context2D.save()
		this.context2D.strokeStyle = color
		this.context2D.lineWidth = 0.5

		for (let x: number = interval + 0.5; x < this.canvas.width; x += interval) {
			this.strokeLine(x, 0, x, this.canvas.height)
		}
		for (let y: number = interval + 0.5; y < this.canvas.height; y += interval) {
			this.strokeLine(0, y, this.canvas.width, y)
		}
		this.context2D.restore()
		// this.fillCircle(0, 0, 5, Colors[Colors.black])
		// this.strokeCoordinate(5, 5, this.canvas.width, this.canvas.height)
	}
	public fillText(
		text: string,
		x: number,
		y: number,
		color: string = Colors[Colors.white],
		align: Font.TextAlign = 'left',
		baseline: Font.TextBaseLine = 'top',
		font: Font.FontType = '10px sans-serif'
	): void {
		this.context2D.save()
		this.context2D.textAlign = align
		this.context2D.textBaseline = baseline
		this.context2D.font = font
		this.context2D.fillStyle = color
		this.context2D.fillText(text, x, y)
		this.context2D.restore()
	}
	public fillRectWithTitle(
		x: number,
		y: number,
		width: number,
		height: number,
		title: string = '',
		layout: ETextLayout = ETextLayout.CENTER_MIDDLE,
		color: string = Colors[Colors.grey],
		showCoord: boolean = true
	): void {
		this.context2D.save()
		this.context2D.fillStyle = color
		this.context2D.beginPath()
		this.context2D.rect(x, y, width, height)
		this.context2D.fill()

		if (title.length !== 0) {
			let rect: Rectangle = this.calcLocalTextRectangle(layout, title, width, height)
			this.fillText(title, x + rect.origin.x, y + rect.origin.y)
			this.strokeRect(
				x + rect.origin.x,
				y + rect.origin.y,
				rect.size.width,
				rect.size.height,
				'rgba(0, 0, 0, 0.5)'
			)
			this.fillCircle(x + rect.origin.x, y + rect.origin.y, 2)
		}
		if (showCoord) {
			this.strokeCoordinate(x, y, width + 20, height + 20)
			this.fillCircle(x, y, 3)
		}
		this.context2D.restore()
	}
	public strokeRect(
		x: number,
		y: number,
		w: number,
		h: number,
		color: string = Colors[Colors.black]
	): void {
		this.context2D.save()
		this.context2D.strokeStyle = color
		this.context2D.strokeRect(x, y, w, h)
		this.context2D.restore()
	}
	public calcLocalTextRectangle(
		layout: ETextLayout,
		text: string,
		parentWidth: number,
		parentHeight: number
	): Rectangle {
		let s: Size = this.calcTextSize(text)
		let o: Vec2 = Vec2.create()
		let left: number = 0
		let top: number = 0
		let right: number = parentWidth - s.width
		let bottom: number = parentHeight - s.height
		let center: number = right * 0.5
		let middle: number = bottom * 0.5

		switch (layout) {
			case ETextLayout.LEFT_TOP:
				o.x = left
				o.y = top
				break
			case ETextLayout.RIGHT_TOP:
				o.x = right
				o.y = top
				break
			case ETextLayout.RIGHT_BOTTOM:
				o.x = right
				o.y = bottom
				break
			case ETextLayout.LEFT_BOTTOM:
				o.x = left
				o.y = bottom
				break
			case ETextLayout.CENTER_MIDDLE:
				o.x = center
				o.y = middle
				break
			case ETextLayout.CENTER_TOP:
				o.x = center
				o.y = 0
				break
			case ETextLayout.RIGHT_MIDDLE:
				o.x = right
				o.y = middle
				break
			case ETextLayout.CENTER_BOTTOM:
				o.x = center
				o.y = bottom
				break
			case ETextLayout.LEFT_MIDDLE:
				o.x = left
				o.y = middle
				break
		}
		return new Rectangle(o, s)
	}
	public calcTextSize(text: string, char: string = 'W', scale: number = 0.5): Size {
		let size: Size = new Size()
		size.width = this.context2D.measureText(text).width
		let w: number = this.context2D.measureText(char).width
		size.height = w + w * scale
		return size
	}
	public positionText(
		text: string,
		width: number,
		height: number,
		index: number,
		color: string = 'rgba(255, 255, 0, .2)'
	): void {
		let drawX: number = 20
		let drawY: number = 20
		let right: number = drawX + width
		let bottom: number = drawY + height
		let drawWidth: number = 80
		let drawHeight: number = 50

		switch (text) {
			case Position.rightTop: // !右上
				drawX = right - drawWidth
				break
			case Position.rightBottom: // %右下
				drawX = right - drawWidth
				drawY = bottom - drawHeight
				break
			case Position.leftBottom: // *左下
				drawY = bottom - drawHeight
				break
			case Position.centerMiddle: // -中心
				drawX = (right - drawWidth) * 0.5
				drawY = (bottom - drawHeight) * 0.5
				break
			case Position.centerTop: // =中上
				drawX = (right - drawWidth) * 0.5
				break
			case Position.rightMiddle: // $右中
				drawX = right - drawWidth
				drawY = (bottom - drawHeight) * 0.5
				break
			case Position.centerBottom: // &中下
				drawX = (right - drawWidth) * 0.5
				drawY = bottom - drawHeight
				break
			case Position.leftMiddle: // !左中
				drawY = (bottom - drawHeight) * 0.5
				break
		}
		this.fillRectWithTitle(drawX, drawY, drawWidth, drawHeight, text, index, color)
	}
	public testCanvas2DTextLayout(x: number = 20, y: number = 20): void {
		let width: number = this.canvas.width - x * 2
		let height: number = this.canvas.height - y * 2
		this.fillRectWithTitle(x, y, width, height)

		Object.keys(Position).forEach((text: string, index: number) => {
			this.positionText(Position[text], width, height, index)
		})
	}
}
