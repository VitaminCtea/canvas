export class Sprite {
	public top: number = 0
	public left: number = 0
	public width: number = 10
	public height: number = 10
	public velocityX: number = 0
	public velocityY: number = 0
	public visible: boolean = true
	public animating: boolean = false
	constructor(
		public name: string,
		public painter?: {
			paint: (sprite: Sprite, context: CanvasRenderingContext2D, color?: string) => void
			[PropName: string]: any
		},
		public behaviors: any[] = []
	) {
		this.name = name
		this.painter = painter
	}

	paint(context: CanvasRenderingContext2D, color?: string): void {
		if (this.painter !== undefined && this.visible) {
			this.painter.paint(this, context, color)
		}
	}

	update(context: CanvasRenderingContext2D, time: number): void {
		for (let i: number = 0; i < this.behaviors.length; i++) {
			this.behaviors[i].execute(this, context, time)
		}
	}
}

export class ImagePainter {
	public image: HTMLImageElement
	public width: number
	public height: number

	constructor(imageURL: string) {
		this.image = new Image()
		this.image.src = imageURL
		this.width = this.image.width
		this.height = this.image.height
	}

	paint(sprite: Sprite, context: CanvasRenderingContext2D): void {
		if (this.image.complete) {
			context.drawImage(this.image, sprite.left, sprite.top, sprite.width, sprite.height)
		}
	}
}
