import { Sprite, ImagePainter } from '../core/sprite'
import { requestNextAnimationFrame } from '../core/requestNextAnimationFrame'

const canvasEl: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const ctx2D: CanvasRenderingContext2D = canvasEl.getContext('2d')
const CLOCK_RADIUS: number = canvasEl.width / 4
const HOUR_HAND_TRUNCATION: number = 35
const bomb: Sprite = new Sprite('bomb', new ImagePainter('../countryImage.jpg'))
const BOMB_WIDTH: number = 400
const BOMB_HEIGHT: number = 300
const BOMB_LEFT: number = canvasEl.width / 2 - BOMB_WIDTH / 2
const BOMB_TOP: number = canvasEl.height / 2 - BOMB_HEIGHT / 2

const ballPainter = {
	paint: function(sprite, context, color?: string): void {
		const x: number = sprite.left + sprite.width / 2
		const y: number = sprite.top + sprite.height / 2
		const radius: number = sprite.width / 2

		context.save()
		context.shadowColor = 'rgb(0, 0, 0)'
		context.shadowOffsetX = -4
		context.shadowOffsetY = -4
		context.shadowBlur = 8
		context.fillStyle = color
		context.beginPath()
		context.arc(x, y, radius, 0, Math.PI * 2, false)
		context.clip()
		context.fill()

		context.lineWidth = 2
		context.strokeStyle = 'rgb(100, 100, 195)'
		context.stroke()

		context.restore()
	}
}

const ball: Sprite = new Sprite('ball', ballPainter)

function animate(): void {
	ctx2D.clearRect(0, 0, canvasEl.width, canvasEl.height)
	// ?绘制时钟
	drawGrid('lightgray')
	// drawClock()
	bomb.paint(ctx2D)
	requestNextAnimationFrame(animate)
}

bomb.left = BOMB_LEFT
bomb.top = BOMB_TOP
bomb.width = BOMB_WIDTH
bomb.height = BOMB_HEIGHT

requestNextAnimationFrame(animate)

function drawGrid(color: string = 'grey', stepX: number = 10, stepY: number = 10): void {
	ctx2D.strokeStyle = color
	ctx2D.lineWidth = 0.5
	for (let i: number = stepX + 0.5; i < canvasEl.width; i += stepX) {
		ctx2D.beginPath()
		ctx2D.moveTo(i, 0)
		ctx2D.lineTo(i, canvasEl.height)
		ctx2D.stroke()
	}
	for (let i: number = stepY + 0.5; i < canvasEl.height; i += stepY) {
		ctx2D.beginPath()
		ctx2D.moveTo(0, i)
		ctx2D.lineTo(canvasEl.width, i)
		ctx2D.stroke()
	}
}

function drawClock(): void {
	drawClockFace()
	drawHands()
}

function drawClockFace(): void {
	ctx2D.save()
	ctx2D.beginPath()
	ctx2D.arc(canvasEl.width / 2, canvasEl.height / 2, CLOCK_RADIUS, 0, Math.PI * 2, false)
	ctx2D.strokeStyle = 'rgba(0, 0, 0, 0.2)'
	ctx2D.stroke()
	ctx2D.restore()
}

function drawHands(): void {
	const date: Date = new Date()
	let hour: number = date.getHours()

	ctx2D.save()
	ctx2D.lineWidth = 2.5
	ctx2D.save()
	ball.width = 20
	ball.height = 20
	ctx2D.strokeStyle = '#0066CC'
	drawHand(date.getSeconds(), false, '#CCCCFF')
	ctx2D.restore()

	ctx2D.save()
	hour = hour > 12 ? hour - 12 : hour
	ball.width = 35
	ball.height = 35
	ctx2D.strokeStyle = '#FF3366'
	drawHand(date.getMinutes(), false, '#CCCC66')
	ctx2D.restore()

	ctx2D.save()
	ball.width = 50
	ball.height = 50
	ctx2D.strokeStyle = '#9933FF'
	drawHand(hour * 5 + (date.getMinutes() / 60) * 5, true, '#00CCFF')
	ctx2D.restore()

	ctx2D.restore()

	ball.width = 20
	ball.height = 20
	ball.left = canvasEl.width / 2 - ball.width / 2
	ball.top = canvasEl.height / 2 - ball.height / 2
	ballPainter.paint(ball, ctx2D, '#CCFFCC')
}

function drawHand(loc: number, isHour?: boolean, color?: string): void {
	const angle: number = Math.PI * 2 * (loc / 60) - Math.PI / 2 // ?秒 -> 分钟 分钟 -> 小时
	const handRadius: number = isHour ? CLOCK_RADIUS - HOUR_HAND_TRUNCATION : CLOCK_RADIUS
	const lineEnd: { x: number; y: number } = {
		x: canvasEl.width / 2 + Math.cos(angle) * (handRadius - ball.width / 2),
		y: canvasEl.height / 2 + Math.sin(angle) * (handRadius - ball.width / 2)
	}
	ctx2D.beginPath()
	ctx2D.moveTo(canvasEl.width / 2, canvasEl.height / 2)
	ctx2D.lineTo(lineEnd.x, lineEnd.y)
	ctx2D.stroke()
	ball.left = canvasEl.width / 2 + Math.cos(angle) * handRadius - ball.width / 2
	ball.top = canvasEl.height / 2 + Math.sin(angle) * handRadius - ball.height / 2
	ball.paint(ctx2D, color)
}

requestNextAnimationFrame(animate)
