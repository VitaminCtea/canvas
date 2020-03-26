import { Sprite, ImagePainter } from './sprite'
import { requestNextAnimationFrame } from './requestNextAnimationFrame'

class SpriteAnimator {
	public painters: any[] = []
	public elapsedCallback: Function
	public duration: number = 1000
	public startTime: number = 0
	public index: number = 0
	constructor(painters: any[], elapsedCallback: Function) {
		this.painters = painters
		this.elapsedCallback = elapsedCallback
	}
	end(sprite: Sprite, originalPainter: any): void {
		sprite.animating = false
		if (this.elapsedCallback) {
			this.elapsedCallback(sprite)
		} else {
			sprite.painter = originalPainter
		}
	}
	start(sprite: Sprite, duration: number): void {
		const endTime: number = +new Date() + duration
		const period: number = duration / this.painters.length
		const animator: SpriteAnimator = this
		const originalPainter: any = sprite.painter
		let interval: any
		this.index = 0
		sprite.animating = true
		sprite.painter = this.painters[this.index]
		interval = setInterval(function() {
			if (+new Date() < endTime) {
				sprite.painter = animator.painters[++animator.index]
			} else {
				animator.end(sprite, originalPainter)
				clearInterval(interval)
			}
		}, period)
	}
}

const canvasSpriteAnimator: HTMLCanvasElement = document.getElementById(
	'canvas'
) as HTMLCanvasElement
canvasSpriteAnimator.style.backgroundColor = 'lightskyblue'
const ctxSpriteAnimator: CanvasRenderingContext2D = canvasSpriteAnimator.getContext('2d')
const explosionButton: HTMLButtonElement = document.getElementById(
	'explosionButton'
) as HTMLButtonElement
const BOMB_LEFT: number = canvasSpriteAnimator.width / 2 - 190 / 2
const BOMB_TOP: number = canvasSpriteAnimator.height / 2 - 130 / 2
const BOMB_WIDTH: number = 180
const BOMB_HEIGHT: number = 130
const NUM_EXPLOSION_PAINTERS: number = 9
const NUM_FUSE_PAINTERS: number = 9
const bombPainter: ImagePainter = new ImagePainter('../bombImage/bomb.png')
const bombNoFusePainter: ImagePainter = new ImagePainter('../bombImage/bomb-no-fuse.png')
const fuseBurningPainters: any[] = []
const explosionPainters: any[] = []

const fuseBurningAnimator: SpriteAnimator = new SpriteAnimator(fuseBurningPainters, function(bomb) {
	bomb.painter = bombNoFusePainter
})
const explosionAnimator: SpriteAnimator = new SpriteAnimator(explosionPainters, function(bomb) {
	bomb.painter = bombPainter
})
const bomb: Sprite = new Sprite('bomb', bombPainter)

explosionButton.onclick = () => {
	if (bomb.animating) {
		return
	}
	fuseBurningAnimator.start(bomb, 2000)
	setTimeout(function() {
		explosionAnimator.start(bomb, 1000)
	}, 2000)
}
function animate(now: number): void {
	ctxSpriteAnimator.clearRect(0, 0, canvasSpriteAnimator.width, canvasSpriteAnimator.height)
	bomb.paint(ctxSpriteAnimator)
	requestNextAnimationFrame(animate)
}

bomb.left = BOMB_LEFT
bomb.top = BOMB_TOP
bomb.width = BOMB_WIDTH
bomb.height = BOMB_HEIGHT

for (let i: number = 0; i < NUM_FUSE_PAINTERS; i++) {
	fuseBurningPainters.push(new ImagePainter('../bombImage/fuse-0' + i + '.png'))
}

for (let i: number = 0; i < NUM_EXPLOSION_PAINTERS; i++) {
	explosionPainters.push(new ImagePainter('../bombImage/explosion-0' + i + '.png'))
}

requestNextAnimationFrame(animate)
