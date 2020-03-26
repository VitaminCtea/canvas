import { Sprite } from '../core/sprite'
import { SpriteSheetPainter } from '../core/spriteSheetPainter'
import { requestNextAnimationFrame } from '../core/requestNextAnimationFrame'

const canvasSprite: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const ctxSprite: CanvasRenderingContext2D = canvasSprite.getContext('2d')
const animateButton = document.getElementById('animateButton') as HTMLButtonElement
const spriteSheet: HTMLImageElement = new Image()
const runnerCells: Array<{ left: number; top: number; width: number; height: number }> = [
	{ left: 0, top: 0, width: 47, height: 64 },
	{ left: 55, top: 0, width: 44, height: 64 },
	{ left: 107, top: 0, width: 39, height: 64 },
	{ left: 150, top: 0, width: 46, height: 64 },
	{ left: 208, top: 0, width: 49, height: 64 },
	{ left: 265, top: 0, width: 46, height: 64 },
	{ left: 320, top: 0, width: 42, height: 64 },
	{ left: 380, top: 0, width: 35, height: 64 },
	{ left: 425, top: 0, width: 35, height: 64 }
]

const runInPlace: {
	lastAdvance: number
	ANIMATE_INTERVAL: number
	execute: (sprite: Sprite, context: CanvasRenderingContext2D, now: number) => void
} = {
	lastAdvance: 0,
	ANIMATE_INTERVAL: 100,
	execute: function(sprite, context, now): void {
		if (now - this.lastAdvance > this.ANIMATE_INTERVAL) {
			sprite.painter.advance()
			this.lastAdvance = now
		}
	}
}

const sprite: Sprite = new Sprite('runner', new SpriteSheetPainter(runnerCells, spriteSheet), [
	runInPlace
])

let paused: boolean = false

function pauseAnimation(): void {
	animateButton.value = 'Animate'
	paused = true
}

function startAnimation(): void {
	animateButton.value = 'Pause'
	paused = false
	requestNextAnimationFrame(animate)
}

animateButton.addEventListener(
	'click',
	() => {
		if (animateButton.value === 'Animate') {
			startAnimation()
		} else {
			pauseAnimation()
		}
	},
	false
)

// ?视差动画
const tree: HTMLImageElement = new Image()
const nearTree: HTMLImageElement = new Image()
const grass: HTMLImageElement = new Image()
const grass2: HTMLImageElement = new Image()
const sky: HTMLImageElement = new Image()

const TREE_VELOCITY: number = 20
const FAST_TREE_VELOCITY: number = 40
const SKY_VELOCITY: number = 8
const GRASS_VELOCITY: number = 75

let lastTime: number = 0
let fps: number = 60
let skyOffset: number = 0
let grassOffset: number = 0
let treeOffset: number = 0
let nearTreeOffset: number = 0

function erase(): void {
	ctxSprite.clearRect(0, 0, canvasSprite.width, canvasSprite.height)
}
function draw(): void {
	ctxSprite.save()
	skyOffset = skyOffset < canvasSprite.width ? skyOffset + SKY_VELOCITY / fps : 0
	grassOffset = grassOffset < canvasSprite.width ? grassOffset + GRASS_VELOCITY / fps : 0
	treeOffset = treeOffset < canvasSprite.width ? treeOffset + TREE_VELOCITY / fps : 0
	nearTreeOffset =
		nearTreeOffset < canvasSprite.width ? nearTreeOffset + FAST_TREE_VELOCITY / fps : 0
	ctxSprite.save()
	ctxSprite.translate(-skyOffset, 0)
	ctxSprite.drawImage(sky, 0, 0)
	ctxSprite.drawImage(sky, sky.width, 0)
	ctxSprite.restore()

	ctxSprite.save()
	ctxSprite.translate(treeOffset, 0)
	ctxSprite.drawImage(tree, -100, 240)
	ctxSprite.drawImage(tree, -1100, 240)
	ctxSprite.drawImage(tree, -400, 240)
	ctxSprite.drawImage(tree, -1400, 240)
	ctxSprite.drawImage(tree, -700, 240)
	ctxSprite.drawImage(tree, -1700, 240)
	ctxSprite.restore()

	ctxSprite.save()
	ctxSprite.translate(nearTreeOffset, 220)
	ctxSprite.drawImage(nearTree, 75, 0)
	ctxSprite.drawImage(nearTree, -nearTree.width, 0)
	ctxSprite.restore()

	ctxSprite.save()
	ctxSprite.translate(grassOffset, 0)
	ctxSprite.drawImage(grass, 0, canvasSprite.height - grass.height)
	ctxSprite.drawImage(grass, -grass.width, canvasSprite.height - grass.height)
	ctxSprite.drawImage(grass2, 0, canvasSprite.height - grass2.height)
	ctxSprite.drawImage(grass2, -grass2.width, canvasSprite.height - grass2.height)
	ctxSprite.restore()

	ctxSprite.restore()
}

function calculateFPS(now: number): number {
	let fps: number = 1000 / (now - lastTime)
	lastTime = now
	return fps
}

tree.src = '../smalltree.png'
nearTree.src = '../tree-twotrunks.png'
grass.src = '../grass.png'
grass2.src = '../grass2.png'
sky.src = '../sky.png'

let promise: Promise<boolean> // ?确保应该先加载背景的所有图片，然后再加载人物初始状态图片
sky.onload = function() {
	promise = new Promise(resolve => {
		draw()
		resolve(true)
	})
}

function animate(time: number): void {
	if (!paused) {
		erase()
		fps = calculateFPS(time)
		draw()
		ctxSprite.drawImage(
			spriteSheet,
			0,
			0,
			spriteSheet.width,
			spriteSheet.height,
			(canvasSprite.width - spriteSheet.width) / 2,
			0,
			spriteSheet.width,
			spriteSheet.height
		)
		sprite.update(ctxSprite, time)
		sprite.paint(ctxSprite)
		requestNextAnimationFrame(animate)
	}
}

spriteSheet.src = '../running-sprite-sheet.png'
spriteSheet.onload = function() {
	// tslint:disable-next-line: no-floating-promises
	promise.then((isBackgroundLoading: boolean) => {
		isBackgroundLoading &&
			ctxSprite.drawImage(
				spriteSheet,
				runnerCells[0].left,
				runnerCells[0].top,
				runnerCells[0].width,
				runnerCells[0].height,
				sprite.left,
				sprite.top,
				runnerCells[0].width,
				runnerCells[0].height
			)
	})
	ctxSprite.drawImage(
		spriteSheet,
		0,
		0,
		spriteSheet.width,
		spriteSheet.height,
		(canvasSprite.width - spriteSheet.width) / 2,
		0,
		spriteSheet.width,
		spriteSheet.height
	)
}

sprite.left = canvasSprite.width / 2 - 24
sprite.top = canvasSprite.height - 120
ctxSprite.strokeStyle = 'lightgray'
ctxSprite.lineWidth = 0.5
