import { Coordinates } from '../types/index'
import { Math2D } from './math2D'

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

const AXIS_MARGIN: number = 40
const AXIS_ORIGIN: Coordinates = { x: AXIS_MARGIN, y: canvas.height - AXIS_MARGIN }
const ORIGIN: Coordinates = { x: AXIS_MARGIN - 25, y: canvas.height - AXIS_MARGIN + 25 }
const verticalShaft: Coordinates = { x: AXIS_MARGIN + 10, y: AXIS_MARGIN + 10 }
const horizontalAxis: Coordinates = {
	x: canvas.width - AXIS_MARGIN - 10,
	y: canvas.height - AXIS_MARGIN + 25
}

const CENTER_X: number = canvas.width / 2
const CENTER_Y: number = canvas.height / 2

const verticalShaftPoint: Coordinates = { x: AXIS_MARGIN, y: AXIS_MARGIN }
const horizontalPoint: Coordinates = {
	x: canvas.width - AXIS_MARGIN,
	y: canvas.height - AXIS_MARGIN
}

const AXIS_TOP: number = AXIS_MARGIN
const AXIS_RIGHT: number = canvas.width - AXIS_MARGIN

const HORIZONTAL_TICK_SPACING: number = 10
const VERTICAL_TICK_SPACING: number = 10

const AXIS_WIDTH: number = AXIS_RIGHT - AXIS_ORIGIN.x
const AXIS_HEIGHT: number = AXIS_ORIGIN.y - AXIS_TOP

const NUM_VERTICAL_TICKS: number = AXIS_HEIGHT / HORIZONTAL_TICK_SPACING
const NUM_HORIZONTAL_TICKS: number = AXIS_WIDTH / HORIZONTAL_TICK_SPACING

const TICK_WIDTH: number = 10
const TICKS_LINE_WIDTH: number = 0.5
const TICKS_COLOR: string = 'navy'

const AXIS_LINE_WIDTH: number = 1.0
const AXIS_COLOR: string = 'blue'

function drawGird(
	context: CanvasRenderingContext2D = ctx,
	color: string = 'lightgray',
	stepX: number = 10,
	stepY: number = 10
): void {
	const width: number = context.canvas.width
	const height: number = context.canvas.height
	context.strokeStyle = color
	context.lineWidth = 0.5
	for (let i: number = stepX + 0.5; i < width; i += stepX) {
		context.beginPath()
		context.moveTo(i, 0)
		context.lineTo(i, height)
		context.stroke()
	}
	for (let i: number = stepY + 0.5; i < height; i += stepY) {
		context.beginPath()
		context.moveTo(0, i)
		context.lineTo(width, i)
		context.stroke()
	}
}

function drawAxis(): void {
	ctx.save()
	ctx.strokeStyle = AXIS_COLOR
	ctx.lineWidth = AXIS_LINE_WIDTH

	drawHorizontalAxis()
	drawVerticalAxis()

	ctx.lineWidth = 0.5
	ctx.lineWidth = TICKS_LINE_WIDTH
	ctx.strokeStyle = TICKS_COLOR

	drawVerticalAxisTicks()
	drawHorizontalAxisTicks()

	ctx.restore()
}

function drawHorizontalAxis(): void {
	ctx.beginPath()
	ctx.moveTo(AXIS_ORIGIN.x, AXIS_ORIGIN.y)
	ctx.lineTo(AXIS_RIGHT, AXIS_ORIGIN.y)
	ctx.stroke()
}

function drawVerticalAxis(): void {
	ctx.beginPath()
	ctx.moveTo(AXIS_MARGIN, AXIS_ORIGIN.y)
	ctx.lineTo(AXIS_ORIGIN.x, AXIS_TOP)
	ctx.stroke()
}

function drawVerticalAxisTicks(): void {
	let deltaX: number
	for (let i: number = 1; i < NUM_VERTICAL_TICKS; i++) {
		ctx.beginPath()
		if (i % 5 === 0) deltaX = TICK_WIDTH
		else deltaX = TICK_WIDTH / 2

		ctx.moveTo(AXIS_ORIGIN.x - deltaX + 0.5, AXIS_ORIGIN.y - i * VERTICAL_TICK_SPACING + 0.5)
		ctx.lineTo(AXIS_ORIGIN.x + deltaX + 0.5, AXIS_ORIGIN.y - i * VERTICAL_TICK_SPACING + 0.5)
		ctx.stroke()
	}
}
function drawHorizontalAxisTicks(): void {
	let deltaY: number
	for (let i: number = 1; i < NUM_HORIZONTAL_TICKS; i++) {
		ctx.beginPath()
		if (i % 5 === 0) deltaY = TICK_WIDTH
		else deltaY = TICK_WIDTH / 2

		ctx.moveTo(AXIS_ORIGIN.x + i * HORIZONTAL_TICK_SPACING + 0.5, AXIS_ORIGIN.y - deltaY + 0.5)
		ctx.lineTo(AXIS_ORIGIN.x + i * HORIZONTAL_TICK_SPACING + 0.5, AXIS_ORIGIN.y + deltaY + 0.5)
		ctx.stroke()
	}
}

function drawOriginCircle(): void {
	ctx.save()
	ctx.fillStyle = 'red'
	ctx.beginPath()
	ctx.arc(AXIS_ORIGIN.x, AXIS_ORIGIN.y, 4, 0, Math.PI * 2, true)
	ctx.fill()
	ctx.restore()
}

function drawText(): void {
	ctx.save()
	ctx.font = 'italic normal normal 22px PingFang SC Regular'
	ctx.fillText('O', ORIGIN.x, ORIGIN.y)
	ctx.fillText('y', verticalShaft.x, verticalShaft.y)
	ctx.fillText('x', horizontalAxis.x, horizontalAxis.y)
	ctx.restore()
}

function coordinatesComputed(
	y: number,
	x: number,
	theta: number = 14,
	headLength: number = 24
): {
	topX: number
	topY: number
	botX: number
	botY: number
} {
	const angle: number = (Math.atan2(y, x) * 180) / Math.PI
	const angle1: number = ((angle + theta) * Math.PI) / 180
	const angle2: number = ((angle - theta) * Math.PI) / 180
	const topX: number = headLength * Math.cos(angle1)
	const topY: number = headLength * Math.sin(angle1)
	const botX: number = headLength * Math.cos(angle2)
	const botY: number = headLength * Math.sin(angle2)
	return {
		topX,
		topY,
		botX,
		botY
	}
}

function drawArrow(width: number = 1.5, color: string = '#000'): void {
	let coordinates: {
		topX: number
		topY: number
		botX: number
		botY: number
	} = coordinatesComputed(verticalShaftPoint.y, verticalShaftPoint.x - verticalShaftPoint.x)

	ctx.save()
	ctx.strokeStyle = color
	ctx.lineWidth = width
	let arrowX: number
	let arrowY: number
	ctx.beginPath()
	ctx.moveTo(verticalShaftPoint.x, verticalShaftPoint.y)
	arrowX = verticalShaftPoint.x + coordinates.topX
	arrowY = verticalShaftPoint.y + coordinates.topY
	ctx.lineTo(arrowX, arrowY)

	arrowX = verticalShaftPoint.x + coordinates.botX
	arrowY = verticalShaftPoint.y + coordinates.botY
	ctx.moveTo(verticalShaftPoint.x, verticalShaftPoint.y)
	ctx.lineTo(arrowX, arrowY)
	ctx.stroke()

	ctx.beginPath()
	coordinates = coordinatesComputed(horizontalPoint.y - horizontalPoint.y, horizontalPoint.x)
	ctx.moveTo(horizontalPoint.x, horizontalPoint.y)
	arrowX = horizontalPoint.x - coordinates.topX
	arrowY = horizontalPoint.y - coordinates.topY
	ctx.lineTo(arrowX, arrowY)

	arrowX = horizontalPoint.x - coordinates.topX
	arrowY = horizontalPoint.y + coordinates.topY
	ctx.moveTo(horizontalPoint.x, horizontalPoint.y)
	ctx.lineTo(arrowX, arrowY)

	ctx.stroke()
	ctx.restore()
}

class Point {
	constructor(public x: number, public y: number) {
		this.x = x
		this.y = y
	}
	static create(x: number, y: number): Point {
		return new Point(x, y)
	}
}
// $获取坐标点
function getPolygonPoints(
	centerX: number,
	centerY: number,
	radius: number,
	sides: number,
	startAngle: number
): Array<Point> {
	const points: Array<Point> = []
	let angle: number = startAngle
	for (let i: number = 0; i < sides; ++i) {
		points.push(
			Point.create(centerX + radius * Math.sin(angle), centerY - radius * Math.cos(angle))
		)
		angle += (2 * Math.PI) / sides
	}
	return points
}

function getColor(): string {
	const hex: string = '0123456789ABCDEF'
	const length: number = hex.length
	let result: string = '#'
	for (let i: number = 0; i < 6; i++) {
		const randomIndex: number = Math.floor(Math.random() * length)
		result += hex[randomIndex]
	}
	if (result === '#ffffff') {
		getColor()
	} else {
		return result
	}
}
// %创建多边形路径
function createPolygonPath(
	centerX: number,
	centerY: number,
	radius: number,
	sides: number,
	startAngle: number
): void {
	let points: Array<Point> = getPolygonPoints(centerX, centerY, radius, sides, startAngle)
	ctx.lineWidth = 1.5
	ctx.strokeStyle = '#000'
	ctx.beginPath()
	ctx.moveTo(points[0].x, points[0].y)
	ctx.fillText(`(${points[0].x}, ${points[0].y})`, points[0].x + 10, points[0].y + 10)
	ctx.arc(points[0].x, points[0].y, 5, 0, 2 * Math.PI, false)
	ctx.fillStyle = getColor()
	ctx.fill()
	for (let i: number = 1; i < sides; ++i) {
		ctx.lineTo(points[i].x, points[i].y)
	}
	ctx.closePath()
	ctx.stroke()
	for (let i: number = 1; i < sides; ++i) {
		ctx.beginPath()
		ctx.arc(points[i].x, points[i].y, 5, 0, 2 * Math.PI, false)
		ctx.fillStyle = getColor()
		ctx.fill()
		ctx.lineTo(points[i].x, points[i].y)
	}
}
// &绘制多边形
function drawPolygon(radius: number = 200, sides: number = 8, startAngle: number = 0) {
	createPolygonPath(CENTER_X, CENTER_Y, radius, sides, Math2D.toRadian(startAngle))
	ctx.beginPath()
	ctx.arc(CENTER_X, CENTER_Y, radius, 0, 2 * Math.PI, false)
	ctx.strokeStyle = '#000'
	ctx.stroke()
}

function drawQuadraticCurveTo(): void {
	ctx.save()
	ctx.translate(CENTER_X - 200.5, CENTER_Y - 150)
	ctx.fillStyle = 'conrnflowerblue'
	ctx.strokeStyle = 'aqua'
	ctx.shadowColor = '#ff00ff'
	ctx.shadowOffsetX = 2
	ctx.shadowOffsetY = 2
	ctx.shadowBlur = 4
	ctx.lineWidth = 20
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(120.5, 130)
	ctx.quadraticCurveTo(150.8, 130, 160.6, 150.5)
	ctx.quadraticCurveTo(190, 250.0, 210.5, 160.5)
	ctx.quadraticCurveTo(240, 100.5, 290, 70.5)
	ctx.stroke()
	ctx.restore()
}

export function axis() {
	drawGird()
	drawAxis()
	drawOriginCircle()
	drawText()
	drawArrow()
	drawPolygon()
	drawQuadraticCurveTo()
}
