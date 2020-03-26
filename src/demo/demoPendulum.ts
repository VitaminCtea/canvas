import { Sprite } from '../core/sprite'
import { requestNextAnimationFrame } from '../core/requestNextAnimationFrame'

const canvasPendulum: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const ctxPendulum: CanvasRenderingContext2D = canvasPendulum.getContext('2d')

let startTime: number = 0

const PIVOT_Y: number = 20 // ?悬挂点的纵坐标值
const PIVOT_RADIUS: number = 7 // &悬挂点半径
const WEIGHT_RADIUS: number = 25 // $摆锤的半径
const INITIAL_ANGLE: number = Math.PI / 5 // %初始角度
const ROD_LENGTH_IN_PIXELS: number = 300 // -杆长(像素)

const pendulumPainter: {
	// !绘制所需要的物体(悬挂点、钟摆线、钟摆)
	PIVOT_FILL_STYLE: string
	WEIGHT_SHADOW_COLOR: string
	PIVOT_SHADOW_COLOR: string
	STROKE_COLOR: string
	paint: (pendulum: Sprite, context) => void
	drawPivot: (pendulum: Sprite) => void
	drawRod: (pendulum: Sprite) => void
	drawWeight: (pendulum: Sprite, context: CanvasRenderingContext2D) => void
} = {
	PIVOT_FILL_STYLE: 'rgba(0, 0, 0, 0.2)',
	WEIGHT_SHADOW_COLOR: 'rgb(0, 0, 0)',
	PIVOT_SHADOW_COLOR: 'rgb(255, 255, 0)',
	STROKE_COLOR: 'rgb(100, 100, 195)',
	paint: function(pendulum, context) {
		this.drawPivot(pendulum)
		this.drawRod(pendulum)
		this.drawWeight(pendulum, context)
	},
	drawPivot: function(pendulum) {
		// =绘制悬挂点
		ctxPendulum.save()
		ctxPendulum.beginPath()
		ctxPendulum.shadowColor = undefined
		ctxPendulum.shadowBlur = undefined
		ctxPendulum.shadowOffsetX = 0
		ctxPendulum.shadowOffsetY = 0
		ctxPendulum.fillStyle = 'white'
		ctxPendulum.arc(
			(pendulum as any).x + (pendulum as any).pivotRadius,
			(pendulum as any).y,
			(pendulum as any).pivotRadius / 2,
			0,
			Math.PI * 2,
			false
		)
		ctxPendulum.fill()
		ctxPendulum.stroke()
		ctxPendulum.beginPath()
		ctxPendulum.fillStyle = this.PIVOT_FILL_STYLE
		ctxPendulum.arc(
			(pendulum as any).x + (pendulum as any).pivotRadius,
			(pendulum as any).y,
			(pendulum as any).pivotRadius,
			0,
			Math.PI * 2,
			false
		)
		ctxPendulum.fill()
		ctxPendulum.stroke()
		ctxPendulum.restore()
	},
	drawRod: function(pendulum) {
		// #绘制钟摆线
		ctxPendulum.beginPath()
		ctxPendulum.moveTo(
			(pendulum as any).x +
				(pendulum as any).pivotRadius +
				(pendulum as any).pivotRadius * Math.sin((pendulum as any).angle),
			(pendulum as any).y + (pendulum as any).pivotRadius * Math.cos((pendulum as any).angle)
		)
		ctxPendulum.lineTo(
			(pendulum as any).weightX -
				(pendulum as any).weightRadius * Math.sin((pendulum as any).angle),
			(pendulum as any).weightY -
				(pendulum as any).weightRadius * Math.cos((pendulum as any).angle)
		)
		ctxPendulum.stroke()
	},
	drawWeight: function(pendulum, context) {
		// ?绘制摆锤
		ctxPendulum.save()
		ctxPendulum.beginPath()
		ctxPendulum.arc(
			(pendulum as any).weightX,
			(pendulum as any).weightY,
			(pendulum as any).weightRadius,
			0,
			Math.PI * 2,
			false
		)
		ctxPendulum.clip()
		ctxPendulum.shadowColor = this.WEIGHT_SHADOW_COLOR
		ctxPendulum.shadowOffsetX = -4
		ctxPendulum.shadowOffsetY = -4
		ctxPendulum.shadowBlur = 8
		ctxPendulum.lineWidth = 2
		ctxPendulum.strokeStyle = this.STROKE_COLOR
		ctxPendulum.stroke()
		ctxPendulum.beginPath()
		ctxPendulum.arc(
			(pendulum as any).weightX,
			(pendulum as any).weightY,
			(pendulum as any).weightRadius / 2,
			0,
			Math.PI * 2,
			false
		)
		ctxPendulum.clip()
		ctxPendulum.shadowColor = this.PIVOT_SHADOW_COLOR
		ctxPendulum.shadowOffsetX = -4
		ctxPendulum.shadowOffsetY = -4
		ctxPendulum.shadowBlur = 8
		ctxPendulum.stroke()
		ctxPendulum.restore()
	}
}

const swing: {
	// &摇摆动作
	GRAVITY_FORCE: number
	ROD_LENGTH: number
	execute: (pendulum: Sprite, context: CanvasRenderingContext2D, time: number) => void
} = {
	GRAVITY_FORCE: 9.81,
	ROD_LENGTH: 0.8,
	execute: function(pendulum, context, time) {
		let elapsedTime: number = (time - startTime) / 1000
		;(pendulum as any).angle =
			(pendulum as any).initialAngle *
			Math.cos(Math.sqrt(this.GRAVITY_FORCE / this.ROD_LENGTH) * elapsedTime)
		;(pendulum as any).weightX =
			(pendulum as any).x + Math.sin((pendulum as any).angle) * (pendulum as any).rodLength
		;(pendulum as any).weightY =
			(pendulum as any).y + Math.cos((pendulum as any).angle) * (pendulum as any).rodLength
	}
}

const pendulum: Sprite = new Sprite('pendulum', pendulumPainter, [swing])

function animate(time) {
	ctxPendulum.clearRect(0, 0, canvasPendulum.width, canvasPendulum.height)
	drawGrid()
	pendulum.update(ctxPendulum, time)
	pendulum.paint(ctxPendulum)
	requestNextAnimationFrame(animate)
}

function drawGrid(color: string = 'lightgray', stepX: number = 10, stepY: number = 10) {
	// -绘制网格
	ctxPendulum.save()
	ctxPendulum.shadowColor = undefined
	ctxPendulum.shadowBlur = 0
	ctxPendulum.shadowOffsetX = 0
	ctxPendulum.shadowOffsetY = 0

	ctxPendulum.strokeStyle = color
	ctxPendulum.fillStyle = '#ffffff'
	ctxPendulum.shadowOffsetX = 0
	ctxPendulum.shadowOffsetY = 0

	ctxPendulum.strokeStyle = color
	ctxPendulum.fillStyle = '#ffffff'
	ctxPendulum.lineWidth = 0.5
	ctxPendulum.fillRect(0, 0, ctxPendulum.canvas.width, ctxPendulum.canvas.height)

	for (let i: number = stepX + 0.5; i < ctxPendulum.canvas.width; i += stepX) {
		ctxPendulum.beginPath()
		ctxPendulum.moveTo(i, 0)
		ctxPendulum.lineTo(i, ctxPendulum.canvas.height)
		ctxPendulum.stroke()
	}

	for (let i: number = stepY + 0.5; i < ctxPendulum.canvas.height; i += stepY) {
		ctxPendulum.beginPath()
		ctxPendulum.moveTo(0, i)
		ctxPendulum.lineTo(ctxPendulum.canvas.width, i)
		ctxPendulum.stroke()
	}

	ctxPendulum.restore()
}

// %初始化
;(pendulum as any).x = canvasPendulum.width / 2
;(pendulum as any).y = PIVOT_Y
;(pendulum as any).weightRadius = WEIGHT_RADIUS
;(pendulum as any).pivotRadius = PIVOT_RADIUS
;(pendulum as any).initialAngle = INITIAL_ANGLE
;(pendulum as any).angle = INITIAL_ANGLE
;(pendulum as any).rodLength = ROD_LENGTH_IN_PIXELS

ctxPendulum.lineWidth = 0.5
ctxPendulum.strokeStyle = 'rgba(0, 0, 0, 0.5)'
if (navigator.userAgent.indexOf('Opera') === -1) {
	ctxPendulum.shadowColor = 'rgba(0,0,0,0.5)'
}
ctxPendulum.shadowOffsetX = 2
ctxPendulum.shadowOffsetY = 2
ctxPendulum.shadowBlur = 4
ctxPendulum.stroke()
startTime = performance.now() || +new Date()

animate(startTime)
drawGrid()
