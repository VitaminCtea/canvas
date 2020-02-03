// $坐标点
class Point {
	constructor(public x: number, public y: number) {
		this.x = x
		this.y = y
	}
	static create(x: number, y: number): Point {
		return new Point(x, y)
	}
}

// -多边形
export class Polygon {
	public x: number
	public y: number
	public radius: number
	public sides: number
	public startAngle: number
	public strokeStyle: string | CanvasGradient | CanvasPattern
	public fillStyle: string | CanvasGradient | CanvasPattern
	public filled: boolean
	constructor(
		centerX: number,
		centerY: number,
		radius: number,
		sides: number,
		startAngle: number,
		strokeStyle: string | CanvasGradient | CanvasPattern,
		fillStyle: string | CanvasGradient | CanvasPattern,
		filled: boolean
	) {
		this.x = centerX
		this.y = centerY
		this.radius = radius
		this.sides = sides
		this.startAngle = startAngle
		this.strokeStyle = strokeStyle
		this.fillStyle = fillStyle
		this.filled = filled
	}
	getPoints(): Array<Point> {
		const points: Array<Point> = []
		let angle: number = this.startAngle || 0
		for (let i: number = 0; i < this.sides; i++) {
			points.push(
				Point.create(
					this.x + this.radius * Math.sin(angle),
					this.y - this.radius * Math.cos(angle)
				)
			)
			angle += (2 * Math.PI) / this.sides
		}
		return points
	}
	createPath(context: CanvasRenderingContext2D): void {
		const points: Array<Point> = this.getPoints()
		context.beginPath()
		context.moveTo(points[0].x, points[0].y)
		for (let i: number = 1; i < this.sides; i++) {
			context.lineTo(points[i].x, points[i].y)
		}
		context.closePath()
	}
	stroke(context: CanvasRenderingContext2D): void {
		context.save()
		this.createPath(context)
		context.strokeStyle = this.strokeStyle
		context.stroke()
		context.restore()
	}
	fill(context: CanvasRenderingContext2D): void {
		context.save()
		this.createPath(context)
		context.fillStyle = this.fillStyle
		context.fill()
		context.restore()
	}
	move(x: number, y: number): void {
		this.x = x
		this.y = y
	}
}
