import { requestNextAnimationFrame } from '../core/requestNextAnimationFrame'

const canvass: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const ctxs: CanvasRenderingContext2D = canvas.getContext('2d')

const gravity = 0.1
const bounce = -0.7
let startTime = 0
class Ball {
	public x: number = canvas.width / 2
	public radius: number = 20
	public y: number = this.radius * 2
	public speedY: number = 6
	draw(context) {
		context.save()
		context.fillStyle = 'skyblue'
		context.strokeStyle = '#000'
		context.beginPath()
		context.arc(this.x - this.radius, this.y, this.radius, 0, Math.PI * 2, false)
		context.fill()
		context.stroke()
	}
}

const ball: Ball = new Ball()
ball.draw(ctxs)

canvass.onmousedown = function() {
	animate(startTime)
}

function animate(time) {
	ctxs.clearRect(0, 0, canvass.width, canvass.height)
	ball.draw(ctxs)
	if (ball.y >= canvass.height - ball.radius) {
		ball.y = canvass.height - ball.radius
		ball.speedY *= bounce
	}
	ball.speedY += gravity
	ball.y += ball.speedY
	requestNextAnimationFrame(animate)
}
