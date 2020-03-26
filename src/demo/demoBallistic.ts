import { Sprite } from '../core/sprite'
import { requestNextAnimationFrame } from '../core/requestNextAnimationFrame'

const canvasBallistic: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const ctxBallistic: CanvasRenderingContext2D = canvasBallistic.getContext('2d')
const scoreboard: HTMLDivElement = document.getElementById('scoreboard') as HTMLDivElement
const launchAngleOutput: HTMLOutputElement = document.getElementById(
	'launchAngleOutput'
) as HTMLOutputElement
const launchVelocityOutput: HTMLOutputElement = document.getElementById(
	'launchVelocityOutput'
) as HTMLOutputElement

let elapsedTime: number = 0 // #运行时间
let launchTime: number = 0 // !发射时间

let totalScore: number = 0 // %总得分
let lastScore: number = 0 // $几分球(3为三分球，2为二分球)
let lastMouse: { left: number; top: number } = {
	// -鼠标最后一次停下的信息
	left: 0,
	top: 0
}

let threePointer: boolean = false // ?三分球
let needInstructions: boolean = true // =需要说明

// &发射台信息
const LAUNCHPAD_X: number = 50
const LAUNCHPAD_Y: number = canvasBallistic.height - 50
const LAUNCHPAD_WIDTH: number = 50
const LAUNCHPAD_HEIGHT: number = 12
const BALL_RADIUS: number = 8
const ARENA_LENGTH_IN_METERS: number = 10
const INITIAL_LAUNCH_ANGLE: number = Math.PI / 4

let launchAngle: number = INITIAL_LAUNCH_ANGLE // %发射角度
let pixelPerMeters: number = canvasBallistic.width / ARENA_LENGTH_IN_METERS // $算出一米是多少像素

let deltaX: number = 0 // ! X 轴相差多少
let deltaY: number = 0 // * Y 轴相差多少

let launchVelocity: number = 0 // #发射速度

let loc: { x: number; y: number } = {
	x: 0,
	y: 0
}

let elapsedFrameTime: number = 0 // -运行帧时间

const launchPadPainter: {
	// &绘制发射台
	LAUNCHPAD_FILL_STYLE: string
	paint: (ledge: Sprite, context: CanvasRenderingContext2D) => void
} = {
	LAUNCHPAD_FILL_STYLE: 'rgb(100, 140, 230)',
	paint: function(ledge, context) {
		context.save()
		context.fillStyle = this.LAUNCHPAD_FILL_STYLE
		context.fillRect(LAUNCHPAD_X, LAUNCHPAD_Y, LAUNCHPAD_WIDTH, LAUNCHPAD_HEIGHT)
		context.restore()
	}
}

const launchPad: Sprite = new Sprite('launchPad', launchPadPainter) // $发射台精灵

const ballPainter: {
	// #绘制小球
	BALL_FILL_STYLE: string
	BALL_STROKE_STYLE: string
	paint: (ball: Sprite, context: CanvasRenderingContext2D) => void
} = {
	BALL_FILL_STYLE: 'rgb(255, 255, 0)',
	BALL_STROKE_STYLE: 'rgb(0, 0, 0, 0.4)',
	paint: function(ball, context) {
		context.save()
		context.shadowColor = undefined
		context.lineWidth = 2
		context.fillStyle = this.BALL_FILL_STYLE
		context.strokeStyle = this.BALL_STROKE_STYLE
		context.beginPath()
		context.arc(ball.left, ball.top, BALL_RADIUS, 0, Math.PI * 2, false)
		context.clip()
		context.fill()
		context.stroke()
		context.restore()
	}
}

const lob: {
	// %小球运行的逻辑
	lastTime: number
	GRAVITY_FORCE: number
	applyGravity: (elapsed: number) => void
	updateBallPosition: (updateDelta: number) => void
	checkForThreePointer: () => void
	checkBallBounds: () => void
	execute: (ball: Sprite, context: CanvasRenderingContext2D, time: number) => void
} = {
	lastTime: 0,
	GRAVITY_FORCE: 9.81,
	applyGravity: function(elapsed) {
		ball.velocityY = this.GRAVITY_FORCE * elapsed - launchVelocity * Math.sin(launchAngle)
	},
	updateBallPosition: function(updateDelta) {
		ball.left += ball.velocityX * updateDelta * pixelPerMeters // ?计算小球的横坐标(路程 = 速度 * 时间 * 每米的像素数)
		ball.top += ball.velocityY * updateDelta * pixelPerMeters // &计算小球的纵坐标(路程 = 速度 * 时间 * 每米的像素数)
	},
	checkForThreePointer: function() {
		// %检查是否是三分球(判断条件为小球的纵坐标是否超过了画布的上边距)
		if (ball.top < 0) {
			threePointer = true
		}
	},
	checkBallBounds: function() {
		// %检查小球界限
		if (ball.top > canvasBallistic.height || ball.left > canvasBallistic.width) {
			reset()
		}
	},
	execute: function(ball, context, time) {
		let elapsedFlightTime: number = 0
		if (ballInFlight) {
			elapsedFrameTime = (time - this.lastTime) / 1000 // %计算每帧的时间(单位：秒)
			elapsedFlightTime = (time - launchTime) / 1000 // =计算飞行的时间(单位：秒)
			this.applyGravity(elapsedFlightTime)
			this.updateBallPosition(elapsedFrameTime)
			this.checkForThreePointer()
			this.checkBallBounds()
		}
		this.lastTime = time
	}
}

const ball: Sprite = new Sprite('ball', ballPainter, [lob]) // *小球精灵

let ballInFlight: boolean = false // ?小球是否在飞行中

const catchBall: {
	// &桶接球
	ballInBucket: () => boolean
	adjustScore: () => void
	execute: (bucket: Sprite, context: CanvasRenderingContext2D, time: number) => void
} = {
	ballInBucket: function() {
		// %判断小球是否进入了桶中
		return (
			ball.left > bucket.left + bucket.width / 2 &&
			ball.left < bucket.left + bucket.width &&
			ball.top > bucket.top &&
			ball.top < bucket.top + bucket.height / 3
		)
	},
	adjustScore: function() {
		// #调整分数
		if (threePointer) {
			lastScore = 3
		} else {
			lastScore = 2
		}
		totalScore += lastScore
		scoreboard.innerText = `计分板: ${totalScore}`
	},
	execute: function(bucket, context, time) {
		if (ballInFlight && this.ballInBucket()) {
			reset()
			this.adjustScore()
		}
	}
}

// -桶的坐标信息
const BUCKET_X: number = 668
const BUCKET_Y: number = canvasBallistic.height - 100

let bucketImage: HTMLImageElement = new Image()

const bucket: Sprite = new Sprite(
	'bucket',
	{
		// ?桶精灵
		paint: function(sprite, context) {
			// =绘制桶
			context.drawImage(bucketImage, BUCKET_X, BUCKET_Y)
		}
	},
	[catchBall]
)

function windowToCanvas(x: number, y: number): { x: number; y: number } {
	const rect: DOMRect = canvasBallistic.getBoundingClientRect()
	return {
		x: x - rect.left * (canvasBallistic.width / rect.width),
		y: y - rect.top * (canvasBallistic.height / rect.height)
	}
}

function reset(): void {
	// ?重置
	ball.left = LAUNCHPAD_X + LAUNCHPAD_WIDTH / 2
	ball.top = LAUNCHPAD_Y - ball.height / 2
	ball.velocityX = 0
	ball.velocityY = 0
	ballInFlight = false
	needInstructions = false
	lastScore = 0
}

function showText(text: string): void {
	// $显示文本信息
	let metrics: undefined | TextMetrics
	ctxBallistic.font = '24px 苹方字体'
	metrics = ctxBallistic.measureText(text)
	ctxBallistic.save()
	ctxBallistic.shadowColor = undefined
	ctxBallistic.strokeStyle = 'rgb(80, 120, 210)'
	ctxBallistic.fillStyle = 'rgba(100, 140, 230, 0.5)'
	ctxBallistic.fillText(
		text,
		canvasBallistic.width / 2 - metrics.width / 2,
		canvasBallistic.height / 2
	)
	ctxBallistic.strokeText(
		text,
		canvasBallistic.width / 2 - metrics.width / 2,
		canvasBallistic.height / 2
	)
	ctxBallistic.restore()
}

function drawGuideWire(): void {
	// &绘制发射线
	ctxBallistic.moveTo(ball.left, ball.top)
	ctxBallistic.lineTo(lastMouse.left, lastMouse.top)
	ctxBallistic.stroke()
}

function updateBackgroundText(): void {
	// !更新背景文字
	if (lastScore === 3) {
		showText('Three pointer!')
	} else if (lastScore === 2) {
		showText('Nice shot!')
	} else if (needInstructions) {
		showText('Click to launch ball')
	}
}

function resetScoreLater(): void {
	// $重置几分球
	setTimeout(function() {
		lastScore = 0
	}, 1000)
}

function updateSprites(time: number): void {
	// ?更新所有精灵
	bucket.update(ctxBallistic, time)
	launchPad.update(ctxBallistic, time)
	ball.update(ctxBallistic, time)
}

function paintSprites(): void {
	// &绘制所有精灵
	launchPad.paint(ctxBallistic)
	bucket.paint(ctxBallistic)
	ball.paint(ctxBallistic)
}

canvasBallistic.onmousedown = (e: Event) => {
	e.preventDefault()
	if (!ballInFlight) {
		// %确保小球没有在飞行中
		ball.velocityX = launchVelocity * Math.cos(launchAngle)
		ball.velocityY = launchVelocity * Math.sin(launchAngle)
		ballInFlight = true
		threePointer = false
		launchTime = performance.now() || +new Date()
		// launchTime = undefined
	}
}

canvasBallistic.onmousemove = (e: Event) => {
	e.preventDefault()
	if (!ballInFlight) {
		loc = windowToCanvas((e as any).clientX, (e as any).clientY)
		lastMouse.left = loc.x
		lastMouse.top = loc.y
		// $计算鼠标位置和小球的初始位置的差值，这样就得到了一个直角三角形，然后就可以进行计算角度了
		deltaX = Math.abs(lastMouse.left - ball.left)
		deltaY = Math.abs(lastMouse.top - ball.top)
		// ?这里由于是在上面进行发射小球，所以用atan方法，区间为{ -π / 2, π / 2 }。(如果是四周旋转的话需要用atan2，区间在{ -π， π })
		// &Node: 角度是与X轴所产生的的夹角
		launchAngle = Math.atan(parseFloat(String(deltaY)) / parseFloat(String(deltaX)))
		// %这里乘以4是为了在发射线变长的时候希望速度也变快
		// #sinα = y / r -> r = deltaY / Math.sin(launchAngle) -> m(米) = r / pixelPerMeters
		launchVelocity = 4 * (deltaY / Math.sin(launchAngle) / pixelPerMeters)
		launchVelocityOutput.innerText = launchVelocity.toFixed(2)
		launchAngleOutput.innerText = ((launchAngle * 180) / Math.PI).toFixed(2)
	}
}

function animate(time: number): void {
	elapsedTime = (time - launchTime) / 1000
	ctxBallistic.clearRect(0, 0, canvasBallistic.width, canvasBallistic.height)
	if (!ballInFlight) {
		drawGuideWire()
		updateBackgroundText()
		if (lastScore !== 0) {
			resetScoreLater()
		}
	}
	updateSprites(time)
	paintSprites()
	requestNextAnimationFrame(animate)
}

ball.width = BALL_RADIUS * 2
ball.height = ball.width
ball.left = LAUNCHPAD_X + LAUNCHPAD_WIDTH / 2
ball.top = LAUNCHPAD_Y - ball.height / 2

ctxBallistic.lineWidth = 0.5
ctxBallistic.strokeStyle = 'rgba(0, 0, 0, 0.5)'
ctxBallistic.shadowColor = 'rgba(0, 0, 0, 0.5)'
ctxBallistic.shadowOffsetX = 2
ctxBallistic.shadowOffsetY = 2
ctxBallistic.shadowBlur = 4
ctxBallistic.stroke()

bucketImage.src = '../bucket.png'
bucketImage.onload = function() {
	bucket.left = BUCKET_X
	bucket.top = BUCKET_Y
	bucket.width = bucketImage.width
	bucket.height = bucketImage.height
}

requestNextAnimationFrame(animate)
