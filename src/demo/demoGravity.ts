import { Sprite } from '../core/sprite'
import { AnimationTimer } from '../core/animationTimer'
import { requestNextAnimationFrame } from '../core/requestNextAnimationFrame'

const canvasGravity: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const ctxGravity: CanvasRenderingContext2D = canvasGravity.getContext('2d')
const thrusterCanvas: HTMLCanvasElement = document.getElementById(
	'thrusterCanvas'
) as HTMLCanvasElement
const thrusterContext: CanvasRenderingContext2D = thrusterCanvas.getContext('2d')

const RIGHT: number = 1
const LEFT: number = 2
const ARROW_MARGIN: number = 10
const BALL_RADIUS: number = 23
// ?横板左、上、宽度值
const LEDGE_LEFT: number = 280
const LEDGE_TOP: number = 55
const LEDGE_WIDTH: number = 50
// &重力系数
const GRAVITY_FORCE: number = 9.81

let lastTime: number = 0
let fps: number = 60
let arrow: number = LEFT

const PLATFORM_HEIGHT_IN_METERS: number = 10
let pixelsPerMeter: number = (canvasGravity.height - LEDGE_TOP) / PLATFORM_HEIGHT_IN_METERS

// #Small ball behavior...
const moveBall: {
	lastFrameTime: undefined | number
	execute: (sprite: Sprite, context: CanvasRenderingContext2D, time: number) => void
} = {
	lastFrameTime: undefined,
	execute: function(sprite, context, time): void {
		const now: number = +new Date()
		if (this.lastFrameTime === undefined) {
			this.lastFrameTime = now
			return
		}
		if (pushAnimationTimer.isRunning()) {
			// $横坐标移动小球(也就是小球在横板上的时候需要左右移动，当超过了横板的宽度时，进行加速度动画)
			if (arrow === LEFT) {
				sprite.left -= sprite.velocityX / fps
			} else {
				sprite.left += sprite.velocityX / fps
			}
			if (isBallOnLedge()) {
				if (pushAnimationTimer.getElapsedTime() > 200) {
					pushAnimationTimer.stop()
				}
			} else if (!fallingAnimationTimer.isRunning()) {
				startFalling()
				this.lastFrameTime = now
			}
		}
		if (fallingAnimationTimer.isRunning()) {
			sprite.top += sprite.velocityY / fps
			// %加速度 v = gt(g为重力系数，t为当前时间距离上一时间段的差值除以1000，得到当前帧所用的时间)，之后乘以pixelsPerMeter，将米转换为像素
			sprite.velocityY =
				GRAVITY_FORCE * (fallingAnimationTimer.getElapsedTime() / 1000) * pixelsPerMeter
			if (sprite.top > canvasGravity.height) {
				// -如果小球的高度大于画布的高度的话，也就没必要继续运行了，因为在不可见的运行着，所以停止动画
				stopFalling()
			}
		}
	}
}

// -Animation timer...
const pushAnimationTimer: AnimationTimer = new AnimationTimer()
const fallingAnimationTimer: AnimationTimer = new AnimationTimer()

// =Sprite...

// ?小球精灵
const ball: Sprite = new Sprite(
	'ball',
	{
		paint: function(sprite, context) {
			// &绘制小球
			context.save()
			context.beginPath()
			context.arc(
				sprite.left + sprite.width / 2,
				sprite.top + sprite.height / 2,
				BALL_RADIUS,
				0,
				Math.PI * 2,
				false
			)
			context.clip()

			shadowStyle(context, 'rgba(0, 0, 255, 0.7)')

			context.lineWidth = 2
			context.strokeStyle = 'rgba(100, 100, 195, 0.8)'
			context.stroke()

			context.beginPath()
			context.arc(
				sprite.left + sprite.width / 2,
				sprite.top + sprite.height / 2,
				BALL_RADIUS / 2,
				0,
				Math.PI * 2,
				false
			)
			context.clip()

			shadowStyle(context, 'rgba(255, 255, 0, 1.0)')

			context.stroke()
			context.restore()
		}
	},
	[moveBall]
)

const ledge: Sprite = new Sprite('ledge', {
	paint: function(sprite, context) {
		// #绘制横板
		context.save()
		shadowStyle(context, 'rgba(0, 0, 0, 0.5)', 2, 2)
		context.fillStyle = 'rgba(255, 255, 0, 0.6)'
		context.strokeStyle = 'rgba(0, 0, 0, 0.6)'
		context.beginPath()
		context.rect(sprite.left, sprite.top, sprite.width, sprite.height)
		context.fill()
		context.stroke()
		context.restore()
	}
})

// $Functions...
// =封装canvas的阴影样式
function shadowStyle(
	context: CanvasRenderingContext2D,
	color: string,
	offsetX: number = -4,
	offsetY: number = -4,
	blur: number = 8
): void {
	context.shadowColor = color
	context.shadowOffsetX = offsetX
	context.shadowOffsetY = offsetY
	context.shadowBlur = blur
}

function pushBall(direction: number): void {
	// &把小球放到横板上
	if (pushAnimationTimer.isRunning()) {
		pushAnimationTimer.stop()
	}
	arrow = direction
	pushAnimationTimer.start()
}

function pushBallLeft(): void {
	// !把小球放在横板的左边
	pushBall(LEFT)
}

function pushBallRight(): void {
	// $把小球放在横板的右边
	pushBall(RIGHT)
}

function startFalling(): void {
	// ?小球开始降落
	fallingAnimationTimer.start() // &开启小球降落动画
	console.log('小球降落动画运行中...')
	ball.velocityY = 0 // %小球下降的初始速度为0
}

function stopFalling(): void {
	// *小球停止降落
	fallingAnimationTimer.stop() // $小球降落动画关闭
	pushAnimationTimer.stop() // =放入小球动画关闭
	ball.left = LEDGE_LEFT + LEDGE_WIDTH / 2 - BALL_RADIUS // %矫正小球的横坐标
	ball.top = LEDGE_TOP - BALL_RADIUS * 2 // &矫正小球的纵坐标
	ball.velocityY = 0 // -重置小球的降落速度
	console.log('小球回到原点处了, 点击三角形继续运行动画...')
}

function isBallOnLedge(): boolean {
	// ?判断小球是否在横板上
	return ball.left + BALL_RADIUS > LEDGE_LEFT && ball.left < LEDGE_LEFT + LEDGE_WIDTH
}

function paintThruster(): void {
	// %三角形的样式
	thrusterContext.clearRect(0, 0, thrusterCanvas.width, thrusterCanvas.height)
	if (pushAnimationTimer.isRunning()) {
		// &如果小球在横板上进行移动的话，那么样式为黄色，否则在降落的过程中小球为淡蓝色
		thrusterContext.fillStyle = 'rgba(255, 255, 0, 0.5)'
	} else {
		thrusterContext.fillStyle = 'rgba(100, 140, 255, 0.5)'
	}
	paintLeftArrow(thrusterContext) // $绘制箭头
}

function paintLeftArrow(context: CanvasRenderingContext2D): void {
	paintArrow(context)
}

function paintArrow(context: CanvasRenderingContext2D): void {
	context.save()
	context.beginPath()
	context.moveTo(thrusterCanvas.width - ARROW_MARGIN / 2, ARROW_MARGIN / 2)
	context.lineTo(thrusterCanvas.width - ARROW_MARGIN / 2, thrusterCanvas.height - ARROW_MARGIN)
	/**
	 * &quadraticCurveTo()方法通过使用表示二次贝塞尔曲线的指定控制点，向当前路径添加一个点。
	 * ?Note：二次贝塞尔曲线需要两个点。第一个点是用于二次贝塞尔计算中的控制点，第二个点是曲线的结束点。曲线的开始点是当前路径中最后一个点。
	 * =语法：
	 * -context.quadraticCurveTo(cpx,cpy,x,y)
	 * #cpx: 贝塞尔控制点的 x 坐标
	 * *cpy: 贝塞尔控制点的 y 坐标
	 * $x: 结束点的 x 坐标
	 * !y: 结束点的 y 坐标
	 */
	context.quadraticCurveTo(
		thrusterCanvas.width - ARROW_MARGIN / 2,
		thrusterCanvas.height - ARROW_MARGIN / 2,
		thrusterCanvas.width - ARROW_MARGIN,
		thrusterCanvas.height - ARROW_MARGIN / 2
	)
	context.lineTo(ARROW_MARGIN / 2, thrusterCanvas.height / 2 + ARROW_MARGIN / 2)
	context.quadraticCurveTo(
		ARROW_MARGIN / 2 - 6,
		thrusterCanvas.height / 2,
		ARROW_MARGIN,
		thrusterCanvas.height / 2 - ARROW_MARGIN / 2
	)
	context.lineTo(thrusterCanvas.width - ARROW_MARGIN, ARROW_MARGIN / 2)
	context.quadraticCurveTo(
		thrusterCanvas.width - ARROW_MARGIN,
		ARROW_MARGIN / 2,
		thrusterCanvas.width - ARROW_MARGIN / 2,
		ARROW_MARGIN / 2
	)
	context.fill()
	shadowStyle(context, 'rgba(0, 0, 0, 1.0)', 4, 4)
	context.stroke()
	context.restore()
}

function calculateFPS(time: number): number {
	// -计算FPS
	const fps: number = 1000 / (time - lastTime)
	lastTime = time
	return fps
}

function animate(time: number): void {
	fps = calculateFPS(time)
	ctxGravity.clearRect(0, 0, canvasGravity.width, canvasGravity.height)
	drawGrid('lightgray')
	ball.update(ctxGravity, time) // ?调用小球的行为方法->moveBall(在横板上移动小球和小球降落的动画)

	ledge.paint(ctxGravity) // $绘制横板
	ball.paint(ctxGravity) // &绘制小球

	paintThruster() // -箭头变色
	requestNextAnimationFrame(animate)
}

thrusterCanvas.onmousedown = function canvasMouseDown(e: Event) {
	e.preventDefault()
	e.stopPropagation()
	pushBallLeft()
}

function drawGrid(color: string, stepX: number = 10, stepY: number = 10) {
	// =绘制网格
	ctxGravity.save()

	shadowStyle(ctxGravity, undefined, 0, 0, 0)

	ctxGravity.strokeStyle = color
	ctxGravity.fillStyle = '#ffffff'
	ctxGravity.lineWidth = 0.5
	ctxGravity.fillRect(0, 0, ctxGravity.canvas.width, ctxGravity.canvas.height)

	for (let i: number = stepX + 0.5; i < ctxGravity.canvas.width; i += stepX) {
		ctxGravity.beginPath()
		ctxGravity.moveTo(i, 0)
		ctxGravity.lineTo(i, ctxGravity.canvas.height)
		ctxGravity.stroke()
	}

	for (let i: number = stepY + 0.5; i < ctxGravity.canvas.height; i += stepY) {
		ctxGravity.beginPath()
		ctxGravity.moveTo(0, i)
		ctxGravity.lineTo(ctxGravity.canvas.width, i)
		ctxGravity.stroke()
	}

	ctxGravity.restore()
}

// !initialization...

thrusterContext.strokeStyle = 'rgba(100,140,230,0.6)'
shadowStyle(thrusterContext, 'rgba(0,0,0,0.3)', 4, 4, 6)

ball.left = LEDGE_LEFT + LEDGE_WIDTH / 2 - BALL_RADIUS
ball.top = LEDGE_TOP - BALL_RADIUS * 2
ball.width = BALL_RADIUS * 2
ball.height = BALL_RADIUS * 2

ball.velocityX = 110
ball.velocityY = 0

ledge.left = LEDGE_LEFT
ledge.top = LEDGE_TOP
ledge.width = LEDGE_WIDTH

requestNextAnimationFrame(animate)
