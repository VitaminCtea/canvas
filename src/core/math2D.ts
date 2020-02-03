export class Vec2 {
	public values: Float32Array
	public constructor(x: number = 0, y: number = 0) {
		this.values = new Float32Array([x, y])
	}
	public toString(): string {
		return `[${this.values[0]}, ${this.values[1]}]`
	}
	public get x(): number {
		return this.values[0]
	}
	public set x(x: number) {
		this.values[0] = x
	}
	public get y(): number {
		return this.values[1]
	}
	public set y(y: number) {
		this.values[1] = y
	}
	public static create(x: number = 0, y: number = 0) {
		return new Vec2(x, y)
	}
}

export class Size {
	public values: Float32Array
	public constructor(w: number = 1, h: number = 1) {
		this.values = new Float32Array([w, h])
	}
	public set width(value: number) {
		this.values[0] = value
	}
	public get width(): number {
		return this.values[0]
	}
	public set height(value: number) {
		this.values[1] = value
	}
	public get height(): number {
		return this.values[1]
	}
	public static create(w: number = 1, h: number = 1): Size {
		return new Size(w, h)
	}
}

export class Rectangle {
	public origin: Vec2
	public size: Size
	public constructor(origin: Vec2 = new Vec2(), size: Size = new Size(1, 1)) {
		this.origin = origin
		this.size = size
	}
	public static create(x: number = 0, y: number = 0, w: number = 1, h: number = 1): Rectangle {
		let origin: Vec2 = new Vec2(x, y)
		let size: Size = new Size(w, h)
		return new Rectangle(origin, size)
	}
}

export class Math2D {
	public static toRadian(degree: number): number {
		return (degree / 180) * Math.PI
	}
	public static toDegree(radian: number): number {
		return (radian / Math.PI) * 180
	}
}
