import { Canvas2DApplication } from './canvas2DApplication'
import { Colors } from '../colors'
import { Repeat, Font, ELayout, EImageFillType } from '../types'
import { Rectangle, Size, Vec2, Math2D } from './math2D'
import { Position } from '../position'
import { CanvasMouseEvent } from './event/canvasMouseEvent'
import { Tank } from '../demo/tank'
import { CanvasKeyBoardEvent } from './event/canvasKeyBoardEvent'

export class TestApplication extends Canvas2DApplication {
	private _lineDashOffset: number = 0
	private _pattern: CanvasPattern
	public context2D: CanvasRenderingContext2D
	private _mouseX: number = 0
	private _mouseY: number = 0
	private _tank: Tank

	constructor(canvas: HTMLCanvasElement, contextAttributes?: WebGLRenderingContext) {
		super(canvas)
		this.context2D = this.context2D
		this.isSupportMouseMove = true

		this._tank = new Tank()
		this._tank.x = canvas.width * 0.5
		this._tank.y = canvas.height * 0.5

		// this._tank.tankRotation = Math2D.toRadian(30)
		// this._tank.turretRotation = Math2D.toRadian(-30)
	}
	public render(): void {
		let centX: number
		this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.strokeGrid()
		this.drawCanvasCoordsCenter()
		this.drawQuadrantText()
		this.drawTank()

		let x: string = (this._mouseX - this._tank.x).toFixed(2)
		let y: string = (this._mouseY - this._tank.y).toFixed(2)
		let deg: string = Math2D.toDegree(this._tank.tankRotation).toFixed(2)
		this.drawCoordsInfo(`坐标: [${x}, ${y}] 角度: ${deg}`, this._mouseX, this._mouseY)

		// this.drawCoordsInfo(`${this._mouseX}, ${this._mouseY}`, this._mouseX, this._mouseY)
		// this.doTransform(0)
		// this.doTransform(20)
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
		layout: ELayout = ELayout.CENTER_MIDDLE,
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
		layout: ELayout,
		text: string,
		parentWidth: number,
		parentHeight: number
	): Rectangle {
		const s: Size = this.calcTextSize(text)
		const o: Vec2 = Vec2.create()
		const left: number = 0
		const top: number = 0
		const right: number = parentWidth - s.width
		const bottom: number = parentHeight - s.height
		const center: number = right * 0.5
		const middle: number = bottom * 0.5

		switch (layout) {
			case ELayout.LEFT_TOP:
				o.x = left
				o.y = top
				break
			case ELayout.RIGHT_TOP:
				o.x = right
				o.y = top
				break
			case ELayout.RIGHT_BOTTOM:
				o.x = right
				o.y = bottom
				break
			case ELayout.LEFT_BOTTOM:
				o.x = left
				o.y = bottom
				break
			case ELayout.CENTER_MIDDLE:
				o.x = center
				o.y = middle
				break
			case ELayout.CENTER_TOP:
				o.x = center
				o.y = 0
				break
			case ELayout.RIGHT_MIDDLE:
				o.x = right
				o.y = middle
				break
			case ELayout.CENTER_BOTTOM:
				o.x = center
				o.y = bottom
				break
			case ELayout.LEFT_MIDDLE:
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
	public fillRectangleWithColor(rect: Rectangle, color: string): void {
		this.context2D.save()
		this.context2D.fillStyle = color
		this.context2D.fillRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)
		this.context2D.restore()
	}
	public drawImage(
		img: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
		destRect: Rectangle,
		srcRect: Rectangle = Rectangle.create(0, 0, this.width, this.height),
		fillType: string = EImageFillType.STRETCH,
		backgroundColor: string = 'grey'
	): boolean {
		if (fillType === EImageFillType.STRETCH) {
			this.context2D.drawImage(
				img,
				srcRect.origin.x,
				srcRect.origin.y,
				srcRect.size.width,
				srcRect.size.height,
				destRect.origin.x,
				destRect.origin.y,
				destRect.size.width,
				destRect.size.height
			)
		} else {
			this.fillRectangleWithColor(srcRect, backgroundColor)

			let rows: number = Math.ceil(srcRect.size.width / destRect.size.width)
			let columns: number = Math.ceil(srcRect.size.height / destRect.size.height)

			let left: number = 0
			let top: number = 0
			let right: number = 0
			let bottom: number = 0
			let width: number = 0
			let height: number = 0

			let destRight: number = destRect.origin.x + destRect.size.width
			let destBottom: number = destRect.origin.y + destRect.size.height

			if (fillType === EImageFillType.REPEAT_X) {
				columns = 1
			} else if (fillType === EImageFillType.REPEAT_Y) {
				rows = 1
			}

			for (let i: number = 0; i < rows; i++) {
				for (let j: number = 0; j < columns; j++) {
					left = destRect.origin.x + i * destRect.size.width
					top = destRect.origin.y + j * destRect.size.height
					width = destRect.size.width
					height = destRect.size.height

					right = left + width
					bottom = top + height

					if (right > destRight) width = srcRect.size.width - (right - destRight)
					if (bottom > destBottom) height = srcRect.size.height - (bottom - destBottom)

					this.context2D.drawImage(
						img,
						destRect.origin.x,
						destRect.origin.y,
						width,
						height,
						left,
						top,
						width,
						height
					)
				}
			}
		}
		return true
	}
	// &获取4 * 4 = 16种基本颜色的离屏画布
	public getColorCanvas(amount: number = 32): HTMLCanvasElement {
		let step: number = 4
		let canvas: HTMLCanvasElement = document.createElement('canvas')

		canvas.width = amount * step
		canvas.height = amount * step

		let context: CanvasRenderingContext2D | null = canvas.getContext('2d')
		for (let i: number = 0; i < step; i++) {
			for (let j: number = 0; j < step; j++) {
				// =将二维索引转换成一维索引，用来在静态的Colors数组中寻址
				let idx: number = step * i + j
				context.save()
				context.fillStyle = Colors[idx]
				context.fillRect(i * amount, j * amount, amount, amount)
				context.restore()
			}
		}
		return canvas
	}
	public testChangePartCanvasImageData(
		rRow: number = 2, // -初始源矩形所在的行
		rColumn: number = 0, // =初始源矩形所在的列
		cRow: number = 1, // #要修改矩形的行
		cColumn: number = 0, // *要修改矩形的列
		size: number = 100 // ?每个矩形的大小
	): void {
		let colorCanvas: HTMLCanvasElement = this.getColorCanvas(size) // %创建4 * 4 = 16的矩形
		let context: CanvasRenderingContext2D | null = colorCanvas.getContext('2d')

		// &绘制源矩形
		this.drawImage(
			colorCanvas,
			Rectangle.create(21, 100, colorCanvas.width, colorCanvas.height / 2)
		)

		let imgData: ImageData = context.createImageData(size, size) // !创建size * size个像素
		let data: Uint8ClampedArray = imgData.data
		let rgbaCount: number = data.length / 4 // $得到像素个数
		for (let i: number = 0; i < rgbaCount; i++) {
			// =修改
			data[i * 4 + 0] = 255
			data[i * 4 + 1] = 0
			data[i * 4 + 2] = 0
			data[i * 4 + 3] = 255
		}

		context.putImageData(imgData, size * rColumn, size * rRow, 0, 0, size, size) // &将修改好的颜色放到新的矩形上
		imgData = context.getImageData(size * cColumn, size * cRow, size, size) // *获取修改后的大矩形像素数据
		data = imgData.data

		let component: number = 0
		for (let i: number = 0; i < imgData.width; i++) {
			for (let j: number = 0; j < imgData.height; j++) {
				for (let k: number = 0; k < 4; k++) {
					let idx: number = (i * imgData.height + j) * 4 + k // %将三维数组表示的索引转换为一为数组表示的索引
					component = data[idx]
					// $在data数组中，idx % 4为3时，说明是alpha值(保持alpha不变，因此需要下面判断代码)
					if (idx % 4 !== 3) {
						data[idx] = 255 - component // #反转颜色，即RGB
					}
				}
			}
		}

		context.putImageData(imgData, size * cColumn, size * cRow) // &使用putImageData更新像素数据
		// %将修改后的结果绘制显示出来
		this.drawImage(
			colorCanvas,
			Rectangle.create(301, imgData.height, colorCanvas.width, colorCanvas.height / 2)
		)
	}
	public setShadowState(
		shadowBlur: number = 5,
		shadowColor: string = 'rgba(127, 127, 127, .5)',
		shadowOffsetX: number = 10,
		shadowOffsetY: number = 10
	): void {
		this.context2D.save()
		this.context2D.shadowBlur = shadowBlur
		this.context2D.shadowColor = shadowColor
		this.context2D.shadowOffsetX = shadowOffsetX
		this.context2D.shadowOffsetY = shadowOffsetY
		this.context2D.restore()
	}
	public drawCanvasCoordsCenter(): void {
		let halfWidth: number = this.canvas.width * 0.5
		let halfHeight: number = this.canvas.height * 0.5
		this.context2D.save()
		this.context2D.lineWidth = 2
		this.context2D.strokeStyle = 'rgba(255, 0, 0, 0.5)'
		this.strokeLine(0, halfHeight, this.canvas.width, halfHeight)
		this.context2D.strokeStyle = 'rgba(0, 0, 255, 0.5)'
		this.strokeLine(halfWidth, 0, halfWidth, this.canvas.height)
		this.context2D.restore()
		this.fillCircle(halfWidth, halfHeight, 5, 'rgba(0, 0, 0, 0.5)')
	}
	public drawCoordsInfo(info: string, x: number, y: number): void {
		this.fillText(info, x, y, 'black', 'center', 'bottom')
	}
	public distance(x0: number, y0: number, x1: number, y1: number): number {
		const diffX: number = x1 - x0
		const diffY: number = y1 - y0
		return Math.sqrt(diffX * diffX + diffY * diffY)
	}
	protected dispatchMouseMove(evt: CanvasMouseEvent): void {
		this._mouseX = evt.canvasPosition.x
		this._mouseY = evt.canvasPosition.y
		this._tank.onMouseMove(evt)
	}
	public strokeCircle(
		x: number,
		y: number,
		radius: number,
		color: string = 'red',
		lineWidth: number = 1
	): void {
		this.context2D.save()
		this.context2D.strokeStyle = color
		this.context2D.lineWidth = lineWidth
		this.context2D.beginPath()
		this.context2D.arc(x, y, radius, 0, Math.PI * 2)
		this.context2D.stroke()
		this.context2D.restore()
	}
	public doTransform(degree: number, rotateFirst: boolean = true): void {
		const width: number = 100
		const height: number = 60

		const x: number = this.canvas.width * 0.5
		const y: number = this.canvas.height * 0.5

		const radians: number = Math2D.toRadian(degree)
		const radius: number = this.distance(0, 0, x, y)

		this.context2D.save()
		// &使用translate方法后，坐标为[0, 0]开始，而不是[this.canvas.width * 0.5, this.canvas.height * 0.5]
		if (rotateFirst) {
			this.context2D.rotate(radians)
			this.context2D.translate(x, y)
		} else {
			this.context2D.translate(x, y)
			this.context2D.rotate(radians)
		}
		this.fillRectWithTitle(0, 0, width, height, `+${degree}度旋转`)
		this.context2D.restore()

		this.context2D.save()
		if (rotateFirst) {
			this.context2D.rotate(-radians)
			this.context2D.translate(x, y)
		} else {
			this.context2D.translate(x, y)
			this.context2D.rotate(-radians)
		}
		this.fillRectWithTitle(0, 0, width, height, `-${degree}度旋转`)
		this.context2D.restore()

		this.strokeCircle(0, 0, radius, 'black')
	}
	public fillLocalRectWithTitle(
		width: number,
		height: number,
		title: string = '',
		referencePt: ELayout = ELayout.LEFT_TOP,
		layout: ELayout = ELayout.CENTER_MIDDLE,
		color: string = 'grey',
		showCoord: boolean = false
	): void {
		let x: number = 0
		let y: number = 0
		switch (referencePt) {
			case ELayout.LEFT_TOP: // !Canvas2D中，默认是左上角为坐标系原点
				x = 0
				y = 0
				break
			case ELayout.LEFT_MIDDLE: // *左中为原点
				x = 0
				y = -height * 0.5
				break
			case ELayout.LEFT_BOTTOM: // $左下为原点
				x = 0
				y = -height
				break
			case ELayout.RIGHT_TOP: // ?右上为原点
				x = -width
				y = 0
				break
			case ELayout.RIGHT_MIDDLE: // &右中为原点
				x = -width
				y = -height * 0.5
				break
			case ELayout.RIGHT_BOTTOM: // %右下为原点
				x = -width
				y = -height
				break
			case ELayout.CENTER_TOP: // #中上为原点
				x = -width * 0.5
				y = 0
				break
			case ELayout.CENTER_MIDDLE: // -中中为原点
				x = -width * 0.5
				y = -height * 0.5
				break
			case ELayout.CENTER_BOTTOM: // =中下为原点
				x = -width * 0.5
				y = -height
				break
		}
		this.context2D.save()
		// $绘制矩形
		this.context2D.fillStyle = color
		this.context2D.beginPath()
		this.context2D.rect(x, y, width, height)
		this.context2D.fill()
		// &如果有文字，先根据枚举值计算x, y坐标
		if (title.length !== 0) {
			const rect: Rectangle = this.calcLocalTextRectangle(layout, title, width, height) // #绘制文字信息
			this.fillText(title, x + rect.origin.x, y + rect.origin.y) // -绘制文本
			// =绘制文本框
			this.strokeRect(
				x + rect.origin.x,
				y + rect.origin.y,
				rect.size.width,
				rect.size.height,
				'rgba(0, 0, 0, 0.5)'
			)
			this.fillCircle(x + rect.origin.x, y + rect.origin.y, 2) // %绘制文本框左上角坐标(相对父矩形表示)
		}
		/**
		 * #绘制变换的局部坐标系，局部坐标原点总是为[0, 0]
		 * &附加一个坐标，x轴和y轴比矩形的width和height多20像素
		 * *并且绘制3像素的原点
		 */
		if (showCoord) {
			this.strokeCoordinate(0, 0, width + 20, height + 20)
			this.fillCircle(0, 0, 3)
		}
		this.context2D.restore()
	}
	public rotateTranslate(
		degree: number,
		layout: ELayout = ELayout.LEFT_TOP,
		width: number = 40,
		height: number = 20
	): void {
		let radians: number = Math2D.toRadian(degree) // &将角度转换为弧度
		this.context2D.save()
		this.context2D.rotate(radians) // %先旋转
		this.context2D.translate(this.canvas.width * 0.5, this.canvas.height * 0.5) // =再平移到中心点
		this.fillLocalRectWithTitle(width, height, '', layout)
		this.context2D.restore()
	}
	public testFillLocalRectWithTitle(): void {
		this.drawCanvasCoordsCenter()
		// &旋转0度
		this.rotateTranslate(0, ELayout.LEFT_TOP)
		// %顺时针旋转
		this.rotateTranslate(10, ELayout.LEFT_MIDDLE)
		this.rotateTranslate(20, ELayout.LEFT_BOTTOM)
		this.rotateTranslate(30, ELayout.CENTER_TOP)
		this.rotateTranslate(40, ELayout.CENTER_MIDDLE)
		// ?逆时针旋转
		this.rotateTranslate(-10, ELayout.CENTER_BOTTOM)
		this.rotateTranslate(-20, ELayout.RIGHT_TOP)
		this.rotateTranslate(-30, ELayout.RIGHT_MIDDLE)
		this.rotateTranslate(-40, ELayout.RIGHT_BOTTOM)
		// $计算半径
		const radius: number = this.distance(
			0,
			0,
			this.canvas.width * 0.5,
			this.canvas.height * 0.5
		)
		// #绘制一个圆
		this.strokeCircle(0, 0, radius, 'black')
	}
	public doLocalTransform(): void {
		const width: number = 100
		const height: number = 60
		const coordsWidth: number = width * 1.2
		const coordsHeight: number = height * 1.2
		const radius: number = 5
		this.context2D.save()
		this.strokeCoordinate(0, 0, coordsWidth, coordsHeight)
		this.fillCircle(0, 0, radius)
		this.fillLocalRectWithTitle(width, height, '1.初始状态')

		this.context2D.translate(this.canvas.width * 0.5, 10)
		this.strokeCoordinate(0, 0, coordsWidth, coordsHeight)
		this.fillCircle(0, 0, radius)
		this.fillLocalRectWithTitle(width, height, '2.平移')

		this.context2D.translate(0, this.canvas.height * 0.5 - 10)
		this.strokeCoordinate(0, 0, coordsWidth, coordsHeight)
		this.fillCircle(0, 0, radius)
		this.fillLocalRectWithTitle(width, height, '3.平移到画布中心')

		this.context2D.rotate(Math2D.toRadian(-120))
		this.fillLocalRectWithTitle(width, height, '4.旋转-120度')
		this.strokeCoordinate(0, 0, coordsWidth, coordsHeight)
		this.fillCircle(0, 0, radius)

		this.context2D.rotate(Math2D.toRadian(-130))
		this.fillLocalRectWithTitle(width, height, '5.旋转-130度')
		this.strokeCoordinate(0, 0, coordsWidth, coordsHeight)
		this.fillCircle(0, 0, radius)

		this.context2D.translate(100, 100)
		this.fillLocalRectWithTitle(width, height, '6.局部平移100个单位')
		this.strokeCoordinate(0, 0, coordsWidth, coordsHeight)

		this.context2D.restore()
	}
	public fillLocalRectWithTitleUV(
		width: number,
		height: number,
		title: string = '',
		u: number = 0,
		v: number = 0,
		layout: ELayout = ELayout.CENTER_MIDDLE,
		color: string = 'grey',
		showCoords: boolean = true
	): void {
		let x: number = -width * u
		let y: number = -height * v
		this.context2D.save()
		// $绘制矩形
		this.context2D.fillStyle = color
		this.context2D.beginPath()
		this.context2D.rect(x, y, width, height)
		this.context2D.fill()
		// &如果有文字，先根据枚举值计算x, y坐标
		if (title.length !== 0) {
			const rect: Rectangle = this.calcLocalTextRectangle(layout, title, width, height) // #绘制文字信息
			this.fillText(title, x + rect.origin.x, y + rect.origin.y) // -绘制文本
			// =绘制文本框
			this.strokeRect(
				x + rect.origin.x,
				y + rect.origin.y,
				rect.size.width,
				rect.size.height,
				'rgba(0, 0, 0, 0.5)'
			)
			this.fillCircle(x + rect.origin.x, y + rect.origin.y, 2) // %绘制文本框左上角坐标(相对父矩形表示)
		}
		/**
		 * #绘制变换的局部坐标系，局部坐标原点总是为[0, 0]
		 * &附加一个坐标，x轴和y轴比矩形的width和height多20像素
		 * *并且绘制3像素的原点
		 */
		if (showCoords) {
			this.strokeCoordinate(0, 0, width + 20, height + 20)
			this.fillCircle(0, 0, 3)
		}
		this.context2D.restore()
	}
	public translateRotateTranslateDrawRect(
		degree: number,
		u: number = 0,
		v: number = 0,
		radius: number = 200,
		width: number = 40,
		height: number = 20
	): void {
		let radians: number = Math2D.toRadian(degree)
		this.context2D.save()
		this.context2D.translate(this.canvas.width * 0.5, this.canvas.height * 0.5)
		this.context2D.rotate(radians)
		this.context2D.translate(radius, 0)
		this.fillLocalRectWithTitleUV(width, height, '', u, v)
		this.context2D.restore()
	}
	public testFillLocalRectWithTitleUV(): void {
		let radius: number = 200
		let steps: number = 18

		this.drawCanvasCoordsCenter()

		for (let i: number = 0; i <= steps; i++) {
			let n: number = i / steps
			this.translateRotateTranslateDrawRect(i * 10, n, 0, radius)
		}

		for (let i = 0; i < steps; i++) {
			let n: number = i / steps
			this.translateRotateTranslateDrawRect(-i * 10, 0, n, radius)
		}

		this.context2D.save()
		this.context2D.translate(
			this.canvas.width * 0.5 - radius * 0.4,
			this.canvas.height * 0.5 - radius * 0.4
		)
		this.fillLocalRectWithTitleUV(100, 60, 'u = 0.5 / v = 0.5', 0.5, 0.5)
		this.context2D.restore()

		this.context2D.save()
		this.context2D.translate(
			this.canvas.width * 0.5 + radius * 0.2,
			this.canvas.height * 0.5 - radius * 0.2
		)
		this.fillLocalRectWithTitleUV(100, 60, 'u = 0 / v = 1', 0, 1)
		this.context2D.restore()

		this.context2D.save()
		this.context2D.translate(
			this.canvas.width * 0.5 + radius * 0.3,
			this.canvas.height * 0.5 + radius * 0.4
		)
		this.fillLocalRectWithTitleUV(100, 60, 'u = 0.3 / v = 0.6', 0.3, 0.6)
		this.context2D.restore()

		this.context2D.save()
		this.context2D.translate(
			this.canvas.width * 0.5 - radius * 0.1,
			this.canvas.height * 0.5 + radius * 0.25
		)
		this.fillLocalRectWithTitleUV(100, 60, 'u = 1 / v = 0.2', 1, 0.2)
		this.context2D.restore()

		this.strokeCircle(
			this.canvas.width * 0.5,
			this.canvas.height * 0.5,
			radius,
			'rgba(0, 255, 255, 0.5)',
			10
		)
		this.drawQuadrantText()
	}
	// #绘制象限
	public drawQuadrantText(): void {
		const color: string = 'rgb(0, 0, 255)'
		const spacing: number = 10

		this.context2D.save()
		this.fillText(
			'第一象限',
			this.canvas.width - spacing,
			this.canvas.height - spacing,
			color,
			'right',
			'bottom',
			'15px sans-serif'
		)
		this.fillText(
			'第二象限',
			spacing,
			this.canvas.height - spacing,
			color,
			'left',
			'bottom',
			'15px sans-serif'
		)
		this.fillText('第三象限', spacing, spacing, color, 'left', 'top', '15px sans-serif')
		this.fillText(
			'第四象限',
			this.canvas.width - spacing,
			spacing,
			color,
			'right',
			'top',
			'15px sans-serif'
		)

		this.context2D.restore()
	}
	// %绘制坦克
	public drawTank(): void {
		this._tank.drawTank(this)
	}
	// ?更新坦克位置
	public update(elapsedMsec: number, intervalSec: number): void {
		this._tank.update(intervalSec)
	}
	protected dispatchKeyPress(evt: CanvasKeyBoardEvent): void {
		this._tank.onKeyPress(evt)
	}
	public get width() {
		return this.context2D.canvas.width
	}
	public get height() {
		return this.context2D.canvas.height
	}
}
