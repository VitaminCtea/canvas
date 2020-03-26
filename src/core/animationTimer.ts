class StopWatch {
	public startTime: number = 0
	public running: boolean = false
	public elapsed: undefined | number
	public start(): void {
		this.startTime = this.now
		this.elapsed = undefined
		this.running = true
	}
	public stop(): void {
		this.elapsed = this.now - this.startTime
		this.running = false
	}
	public getElapsedTime(): number | undefined {
		if (this.running) {
			return this.now - this.startTime
		}
		return this.elapsed
	}
	public isRunning(): boolean {
		return this.running
	}
	public reset(): void {
		this.elapsed = 0
	}
	get now(): number {
		if (performance.now && typeof performance.now === 'function') {
			return performance.now()
		}
		return +new Date()
	}
}

export class AnimationTimer {
	public stopWatch: StopWatch = new StopWatch()
	static DEFAULT_ELASTIC_PASSES: number = 3
	constructor(public duration: number = undefined, public timeWarp?: Function) {
		this.duration = duration
		this.timeWarp = timeWarp
	}
	public start(): void {
		this.stopWatch.start()
	}
	public stop(): void {
		this.stopWatch.stop()
	}
	public getElapsedTime(): undefined | number {
		const elapsedTime: number | undefined = this.stopWatch.getElapsedTime()
		const percentComplete: number = elapsedTime / this.duration
		// console.log(`最终值为: ${ elapsedTime * (this.timeWarp(percentComplete) / percentComplete) }`)
		// console.log(`distance值为: ${ elapsedTime }`)
		// console.log(`时间占比为: ${ percentComplete }`)
		if (!this.stopWatch.running) return undefined
		if (this.timeWarp === undefined) return elapsedTime
		return elapsedTime * (this.timeWarp(percentComplete) / percentComplete)
	}
	public isRunning(): boolean {
		return this.stopWatch.isRunning()
	}
	public isOver(): boolean {
		return this.stopWatch.getElapsedTime() > this.duration
	}
	// ?时间轴扭曲函数
	public static makeEaseIn(strength: number): Function {
		return function(percentComplete: number): number {
			return Math.pow(percentComplete, strength * 2)
		}
	}
	public static makeEaseOut(strength: number): Function {
		return function(percentComplete: number): number {
			return 1 - Math.pow(1 - percentComplete, strength * 2)
		}
	}
	public static makeEaseInOut(): Function {
		return function(percentComplete: number): number {
			return percentComplete - Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI)
		}
	}
	public static makeElastic(passes: number = AnimationTimer.DEFAULT_ELASTIC_PASSES): Function {
		return function(percentComplete: number): number {
			return (
				(1 - Math.cos(percentComplete * Math.PI * passes)) * (1 - percentComplete) +
				percentComplete
			)
		}
	}
	public static makeBounce(bounces: number): Function {
		const fn: Function = AnimationTimer.makeElastic(bounces)
		return function(percentComplete: number): number {
			const copyPercentComplete: number = fn(percentComplete)
			return copyPercentComplete <= 1 ? copyPercentComplete : 2 - copyPercentComplete
		}
	}
	public static makeLinear(): Function {
		return function(percentComplete: number): number {
			return percentComplete
		}
	}
}
