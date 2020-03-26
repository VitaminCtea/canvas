import { AnimationTimer } from '../core/animationTimer'
import { Sprite } from '../core/sprite'
import { requestNextAnimationFrame } from '../core/requestNextAnimationFrame'

const canvasTimeWarp: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const ctxTimeWarp: CanvasRenderingContext2D = canvasTimeWarp.getContext('2d')

// &缓动函数
const linearCheckbox: HTMLInputElement = document.getElementById(
	'linearCheckbox'
) as HTMLInputElement
const easeInCheckbox: HTMLInputElement = document.getElementById(
	'easeInCheckbox'
) as HTMLInputElement
const easeOutCheckbox: HTMLInputElement = document.getElementById(
	'easeOutCheckbox'
) as HTMLInputElement
const easeInOutCheckbox: HTMLInputElement = document.getElementById(
	'easeInOutCheckbox'
) as HTMLInputElement
const elasticCheckbox: HTMLInputElement = document.getElementById(
	'elasticCheckbox'
) as HTMLInputElement
const bounceCheckbox: HTMLInputElement = document.getElementById(
	'bounceCheckbox'
) as HTMLInputElement

// %推进器画布(控制小球移动的三角形)
const thrustersCanvas: HTMLCanvasElement = document.getElementById(
	'thrusterCanvas'
) as HTMLCanvasElement
const thrustersContext: CanvasRenderingContext2D = thrustersCanvas.getContext('2d')

// =判断小球向左移动还是向右移动
const RIGHT: number = 1
const LEFT: number = 2

const ARROW_MARGIN: number = 10 // ?箭头边距
const BALL_RADIUS: number = 25 // !小球半径

// -跑道位置、几何信息
const RUNWAY_LEFT: number = 62
const RUNWAY_TOP: number = 275
const RUNWAY_WIDTH: number = canvasTimeWarp.width - RUNWAY_LEFT * 2
const RUNWAY_HEIGHT: number = 12

const PUSH_ANIMATION_DURATION: number = 3600 // -推动动画时间

const THRUSTER_FILL_STYLE: string = 'rgba(100, 140, 230, 0.8)' // %推进器填充颜色
const THRUSTER_FIRING_FILL_STYLE: string = 'rgba(255, 255, 0, 0.8)' // $小球运行时的填充颜色

let lastTime: number = 0 // &最后运行的时间
let arrow: number = LEFT // *默认为向左移动

// &缓动算法
const linear: Function = AnimationTimer.makeLinear()
const easeIn: Function = AnimationTimer.makeEaseIn(1)
const easeOut: Function = AnimationTimer.makeEaseOut(1)
const easeInOut: Function = AnimationTimer.makeEaseInOut()
const elastic: Function = AnimationTimer.makeElastic()
const bounce: Function = AnimationTimer.makeBounce(5)

const pushAnimationTimer: AnimationTimer = new AnimationTimer(PUSH_ANIMATION_DURATION) // ?推动动画计时器

let fps: number = 0 // -帧率

const moveBall: {
	// $小球移动逻辑
	lastTime: undefined | number
	resetBall: Function
	updateBallPosition: (elapsed: number) => void
	execute: (ball: Sprite, context: CanvasRenderingContext2D, time: number) => void
} = {
	lastTime: undefined,
	resetBall: function() {
		// %重置小球位置
		ball.left = RUNWAY_LEFT - BALL_RADIUS
		ball.top = RUNWAY_TOP - BALL_RADIUS * 2
	},
	updateBallPosition: function(elapsed) {
		// &更新小球位置
		if (arrow === LEFT) {
			ball.left -= ball.velocityX * (elapsed / 1000)
		} else {
			ball.left += ball.velocityX * (elapsed / 1000)
		}
	},
	execute: function(ball, context, time) {
		let animationElapsed: number
		let elapsed: number
		if (pushAnimationTimer.isRunning()) {
			// #如果动画正在运行的话
			animationElapsed = pushAnimationTimer.getElapsedTime() // ?获取当前时间距离开始时间的差值
			if (this.lastTime !== undefined) {
				// &如果lastTime有值的话，说明已经运行结束(这时最后一次的时间为startTime)
				elapsed = animationElapsed - this.lastTime // $这时应该是再一次点击了箭头推动器，继续计算时间差
				this.updateBallPosition(elapsed) // -更新一下小球的位置
				if (isBallOnLedge()) {
					// %如果在跑道上
					if (pushAnimationTimer.isOver()) {
						// !如果当前时间大于总时间的话，说明动画已经运行结束
						pushAnimationTimer.stop() // =动画结束
					}
				} else {
					// *否则不在跑道上的话
					pushAnimationTimer.stop() // ?也需要停止动画
					this.resetBall() // #重置小球位置
				}
			}
		}
		this.lastTime = animationElapsed // $记录小球停止的时间(每次停止都会进行记录)
	}
}

const ball: Sprite = new Sprite(
	'ball',
	{
		// &绘制小球
		paint: function(sprite, context) {
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
			context.shadowColor = 'rgb(0, 0, 255)'
			context.shadowOffsetX = -4
			context.shadowOffsetY = -4
			context.shadowBlur = 8
			context.lineWidth = 2
			context.strokeStyle = 'rgb(100, 100, 195)'
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
			context.clip() // ?设置裁剪路径，设置完成后所有效果都将在这个路径里展示
			context.shadowColor = 'rgb(255, 255, 0)'
			context.shadowOffsetX = -4
			context.shadowOffsetY = -4
			context.shadowBlur = 8
			context.stroke()
			context.restore()
		}
	},
	[moveBall]
)

const runWay: Sprite = new Sprite('ledge', {
	// $绘制跑道
	paint: function(sprite, context) {
		context.save()
		context.shadowColor = 'rgba(0, 0, 0, 0.8)'
		context.shadowBlur = 8
		context.shadowOffsetX = 4
		context.shadowOffsetY = 4
		context.fillStyle = 'rgba(255, 255, 0, 0.6)'
		context.fillRect(sprite.left, sprite.top, sprite.width, sprite.height)
		context.restore()
	}
})

function restartAnimationTimer(): void {
	// =重新开始动画
	if (pushAnimationTimer.isRunning()) {
		// !如果动画正在运行的情况下点击了推动器
		pushAnimationTimer.stop() // ?则停止之后再启动动画(根据需求决定要不要停止，即回到初始位置)
	}
	pushAnimationTimer.start()
}

function pushBallLeft(): void {
	// &小球往左移动
	arrow = LEFT
	restartAnimationTimer() // &开始动画
}

function pushBallRight(): void {
	// $小球向右移动
	arrow = RIGHT
	restartAnimationTimer() // $开始动画
}

// !判断小球是否在跑道上
let isBallOnLedge: Function = (): boolean =>
	ball.left + 2 * BALL_RADIUS > RUNWAY_LEFT && ball.left < RUNWAY_LEFT + RUNWAY_WIDTH

function paintThrusters(): void {
	// -绘制推进器(三角形)
	thrustersContext.clearRect(0, 0, thrustersCanvas.width, thrustersCanvas.height)
	if (arrow === LEFT) {
		// *左推进器在小球移动时候的填充样式
		thrustersContext.fillStyle = pushAnimationTimer.isRunning()
			? THRUSTER_FIRING_FILL_STYLE
			: THRUSTER_FILL_STYLE
		paintLeftArrow(thrustersContext)
		thrustersContext.fillStyle = THRUSTER_FILL_STYLE
		paintRightArrow(thrustersContext)
	} else {
		// #右推进器在小球移动时候的填充样式
		thrustersContext.fillStyle = pushAnimationTimer.isRunning()
			? THRUSTER_FIRING_FILL_STYLE
			: THRUSTER_FILL_STYLE
		paintRightArrow(thrustersContext)
		thrustersContext.fillStyle = THRUSTER_FILL_STYLE
		paintLeftArrow(thrustersContext)
	}
}

function paintRightArrow(context: CanvasRenderingContext2D): void {
	// !绘制右推进器
	thrustersContext.save()
	thrustersContext.translate(thrustersCanvas.width, 0)
	thrustersContext.scale(-1, 1)
	paintArrow(context)
	thrustersContext.restore()
}

function paintLeftArrow(context: CanvasRenderingContext2D): void {
	// &绘制左推进器
	paintArrow(context)
}

function paintArrow(context: CanvasRenderingContext2D): void {
	// ?绘制推进器的主函数
	context.beginPath()
	context.moveTo(thrustersCanvas.width / 2 - ARROW_MARGIN / 2, ARROW_MARGIN / 2)
	context.lineTo(
		thrustersCanvas.width / 2 - ARROW_MARGIN / 2,
		thrustersCanvas.height - ARROW_MARGIN
	)
	context.quadraticCurveTo(
		thrustersCanvas.width / 2 - ARROW_MARGIN / 2,
		thrustersCanvas.height - ARROW_MARGIN / 2,
		thrustersCanvas.width / 2 - ARROW_MARGIN,
		thrustersCanvas.height - ARROW_MARGIN / 2
	)
	context.lineTo(ARROW_MARGIN, thrustersCanvas.height / 2 + ARROW_MARGIN / 2)
	context.quadraticCurveTo(
		ARROW_MARGIN - 3,
		thrustersCanvas.height / 2,
		ARROW_MARGIN,
		thrustersCanvas.height / 2 - ARROW_MARGIN / 2
	)
	context.lineTo(thrustersCanvas.width / 2 - ARROW_MARGIN, ARROW_MARGIN / 2)
	context.quadraticCurveTo(
		thrustersCanvas.width / 2 - ARROW_MARGIN,
		ARROW_MARGIN / 2,
		thrustersCanvas.width / 2 - ARROW_MARGIN / 2,
		ARROW_MARGIN / 2
	)
	context.fill()
	context.stroke()
}

function getThrustersAbscissa(e: Event, el: HTMLCanvasElement): Function {
	let result: number = 0
	return function() {
		const rect: DOMRect = el.getBoundingClientRect()
		// ?getBoundingClientRect方法返回的width和height包含元素的padding值(相当于content-box效果)
		// &为了和canvas.width或canvas.height的值一致，则需要把padding值刨出去.
		return (
			result ||
			(result =
				(e as any).clientX -
				rect.left * (thrustersCanvas.width / (rect.width - getPaddingLRValue(el))))
		)
	}
}

function getPaddingLRValue(el: HTMLElement): number {
	const { paddingLeft, paddingRight } = window.getComputedStyle(el, null)
	return calcTotalVal(paddingLeft, paddingRight)
}

let calcTotalVal: Function = (...padding): number =>
	padding.reduce((initial: number, current: string) => initial + removeUnit(current), 0)

let removeUnit: Function = (value: string): number => window.parseInt(value, 10)

thrustersCanvas.onmousedown = function canvasMouseDown(e: Event) {
	const abscissaX: Function = getThrustersAbscissa(e, thrustersCanvas)
	e.preventDefault()
	e.stopPropagation()
	if (abscissaX() > thrustersCanvas.width / 2) {
		// ?区分左右箭头
		pushBallRight()
	} else {
		pushBallLeft()
	}
}

linearCheckbox.onchange = function() {
	pushAnimationTimer.timeWarp = linear
}

easeInCheckbox.onchange = function() {
	pushAnimationTimer.timeWarp = easeIn
}

easeOutCheckbox.onchange = function() {
	pushAnimationTimer.timeWarp = easeOut
}

elasticCheckbox.onchange = function() {
	pushAnimationTimer.timeWarp = elastic
	ball.left = RUNWAY_LEFT - BALL_RADIUS
	ball.top = RUNWAY_TOP - BALL_RADIUS * 2
}

bounceCheckbox.onchange = function() {
	pushAnimationTimer.timeWarp = bounce
	ball.left = RUNWAY_LEFT - BALL_RADIUS
	ball.top = RUNWAY_TOP - BALL_RADIUS * 2
}

easeInOutCheckbox.onchange = function() {
	pushAnimationTimer.timeWarp = easeInOut
}

function calculateFPS(time: number): number {
	// #计算帧率
	const fps: number = 1000 / (time - lastTime)
	lastTime = time
	return fps
}

function animate(time: number) {
	fps = calculateFPS(time)
	ctxTimeWarp.clearRect(0, 0, canvasTimeWarp.width, canvasTimeWarp.height)
	ball.update(ctxTimeWarp, time) // %执行小球行为方法
	ball.paint(ctxTimeWarp) // -绘制小球
	runWay.paint(ctxTimeWarp) // *绘制跑道
	paintThrusters() // ?绘制推进器(因为小球移动的过程中推进器要变色，所以动画里也要反复绘制推进器)
	requestNextAnimationFrame(animate)
}

// !initialization
thrustersContext.strokeStyle = 'rgba(100, 140, 230, 0.6)'
thrustersContext.shadowColor = 'rgba(0, 0, 0, 0.3)'
thrustersContext.shadowBlur = 6
thrustersContext.shadowOffsetX = 4
thrustersContext.shadowOffsetY = 4

requestNextAnimationFrame(animate)

// =小球初始化
ball.left = RUNWAY_LEFT - BALL_RADIUS
ball.top = RUNWAY_TOP - BALL_RADIUS * 2
ball.width = BALL_RADIUS * 2
ball.height = BALL_RADIUS * 2
ball.velocityX = 100
ball.velocityY = 0

// #跑道初始化
runWay.left = RUNWAY_LEFT
runWay.top = RUNWAY_TOP
runWay.width = RUNWAY_WIDTH
runWay.height = RUNWAY_HEIGHT
