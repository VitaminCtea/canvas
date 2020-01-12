import { CanvasMouseEvent } from './event/canvasMouseEvent'
import { CanvasKeyBoardEvent } from './event/canvasKeyBoardEvent'
import { EventListenerObject, TimerCallback } from '../types'
import { Vec2 } from './math2D'
import { Timer } from './timer'

export class Application implements EventListenerObject {
	protected _start: boolean = false
	protected _requestId: number = -1
	protected _lastTime: number = -1
	protected _startTime: number = -1
	protected _isMouseDown: boolean
	public isSupportMouseMove: boolean
	public canvas: HTMLCanvasElement
	public timers: Timer[] = []
	public _timeId: number = -1
	private _fps: number = 0

	public constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas

		this.canvas.addEventListener('mousedown', this.handleEvent.bind(this), false)
		this.canvas.addEventListener('mousemove', this.handleEvent.bind(this), false)
		this.canvas.addEventListener('mouseup', this.handleEvent.bind(this), false)

		window.addEventListener('keydown', this.handleEvent.bind(this), false)
		window.addEventListener('keypress', this.handleEvent.bind(this), false)
		window.addEventListener('keyup', this.handleEvent.bind(this), false)

		this._isMouseDown = false
		this.isSupportMouseMove = false
	}
	public start(): void {
		if (!this._start) {
			this._start = true
			this._requestId = -1
			this._lastTime = -1
			this._startTime = -1
			window.requestAnimationFrame((elapsedTime: number) => {
				this.step(elapsedTime)
			})
		}
	}
	public stop(): void {
		if (this._start) {
			window.cancelAnimationFrame(this._requestId)
			this._requestId = -1
			this._lastTime = -1
			this._startTime = -1
			this._start = false
		}
	}
	public isRunning(): boolean {
		return this._start
	}
	protected step(timeStamp: number): void {
		if (this._startTime === -1) this._startTime = timeStamp
		if (this._lastTime === -1) this._lastTime = timeStamp

		let elapsedMsec: number = timeStamp - this._startTime
		let intervalSec: number = timeStamp - this._lastTime

		if (intervalSec !== 0) {
			this._fps = 1000.0 / intervalSec
		}
		intervalSec /= 1000.0

		this._lastTime = timeStamp
		// console.log('elapsedTime = ' + elapsedMsec + ' intervalSec = ' + intervalSec)

		this._handleTimers(intervalSec)

		this.update(elapsedMsec, intervalSec)
		this.render()

		this._requestId = window.requestAnimationFrame((elapsedMsec: number): void => {
			this.step(elapsedMsec)
		})
	}
	public removeUnit(attrValue: string, scale: number = 10) {
		return parseInt(attrValue, scale)
	}
	public getCSSStyleDeclaration(target: HTMLElement) {
		return window.getComputedStyle(target, null) || (target as any).currentStyle
	}
	// 转换canvas坐标
	public _viewportToCanvasCoordinate(evt: MouseEvent): Vec2 {
		if (this.canvas) {
			let rect: ClientRect = this.canvas.getBoundingClientRect()
			let { left, top } = rect
			if (evt.type === 'mousedown') {
				console.log('boundingClientRect: ' + JSON.stringify(rect))
				console.log('clientX: ' + evt.clientX + ' clientY: ' + evt.clientY)
			}
			if (evt.target) {
				let borderLeft: number = 0 // -返回border左侧离margin得宽度
				let borderTop: number = 0 // =返回border上侧离margin得宽度
				let padLeft: number = 0 // $返回padding相对border(border存在的话)左偏移
				let padTop: number = 0 // ?返回padding相对border(border存在的话)上偏移

				let {
					borderLeftWidth,
					borderTopWidth,
					paddingLeft,
					paddingTop
				} = this.getCSSStyleDeclaration(evt.target as HTMLElement)

				// !如果为空串的话，那么不必转换
				if (typeof borderLeftWidth === 'string' && borderLeftWidth.length > 0) {
					borderLeft = this.removeUnit(borderLeftWidth)
					borderTop = this.removeUnit(borderTopWidth)
					padLeft = this.removeUnit(paddingLeft)
					padTop = this.removeUnit(paddingTop)
				}

				// &如果不是可以转换为数值的值，那么需要处理(是NaN的话，那么就设置为0)
				let x: number = evt.clientX - left - borderLeft - padLeft
				let y: number = evt.clientY - top - borderTop - padTop

				let pos: Vec2 = Vec2.create(x, y)

				if (evt.type === 'mousedown') {
					console.log(
						'borderLeftWidth: ' + borderLeftWidth + ' borderTopWith: ' + borderTopWidth
					)
					console.log('paddingLeft: ' + paddingLeft + ' paddingTop: ' + paddingTop)
					console.log('变换后的canvasPosition: ' + pos.toString())
				}
				return pos
			}
			throw new Error('canvas为null!!')
		}
		throw new Error('evt.target为null!!')
	}
	// 获取鼠标事件详细对象
	public _toCanvasMouseEvent(evt: Event): CanvasMouseEvent {
		let event: MouseEvent = evt as MouseEvent
		let { button, altKey, ctrlKey, shiftKey } = event
		let mousePosition: Vec2 = this._viewportToCanvasCoordinate(event)
		let canvasMouseEvent: CanvasMouseEvent = new CanvasMouseEvent(
			mousePosition,
			button,
			altKey,
			ctrlKey,
			shiftKey
		)
		return canvasMouseEvent
	}
	// 获取键盘事件详细对象
	public _toCanvasKeyBoardEvent(evt: Event): CanvasKeyBoardEvent {
		let event: KeyboardEvent = evt as KeyboardEvent
		// tslint:disable-next-line: deprecation
		let { key, keyCode, repeat, altKey, ctrlKey, shiftKey } = event
		let canvasKeyBoardEvent: CanvasKeyBoardEvent = new CanvasKeyBoardEvent(
			key,
			keyCode,
			repeat,
			altKey,
			ctrlKey,
			shiftKey
		)
		return canvasKeyBoardEvent
	}
	public handleEvent(evt: Event): void {
		switch (evt.type) {
			case 'mousedown':
				this._isMouseDown = true
				this.dispatchMouseDown(this._toCanvasMouseEvent(evt))
				break
			case 'mouseup':
				this._isMouseDown = false
				this.dispatchMouseUp(this._toCanvasMouseEvent(evt))
				break
			case 'mousemove':
				if (this.isSupportMouseMove) {
					this.dispatchMouseMove(this._toCanvasMouseEvent(evt))
				}
				if (this._isMouseDown) {
					this.dispatchMouseDrag(this._toCanvasMouseEvent(evt))
				}
				break
			case 'keypress':
				this.dispatchKeyPress(this._toCanvasKeyBoardEvent(evt))
				break
			case 'keydown':
				this.dispatchKeyDown(this._toCanvasKeyBoardEvent(evt))
				break
			case 'keyup':
				this.dispatchKeyUp(this._toCanvasKeyBoardEvent(evt))
				break
		}
	}
	protected dispatchMouseDown(canvasMouseEvent: CanvasMouseEvent): void {
		// doSomething
	}
	protected dispatchMouseUp(canvasMouseEvent: CanvasMouseEvent): void {
		// doSomething
	}
	protected dispatchMouseMove(canvasMouseEvent: CanvasMouseEvent): void {
		// doSomething
	}
	protected dispatchMouseDrag(canvasMouseEvent: CanvasMouseEvent): void {
		// doSomething
	}
	protected dispatchKeyPress(canvasKeyBoardEvent: CanvasKeyBoardEvent): void {
		// doSomething
	}
	protected dispatchKeyDown(canvasKeyBoardEvent: CanvasKeyBoardEvent): void {
		// doSomething
	}
	protected dispatchKeyUp(canvasKeyBoardEvent: CanvasKeyBoardEvent): void {
		// doSomething
	}
	public clearConsole() {
		console.clear()
	}
	public update(elapsedMsec: number, intervalSec: number): void {
		// doSomething
	}
	public render(): void {
		// doSomething
	}
	public removeTimer(id: number): boolean {
		let found: boolean = false
		for (let i = 0; i < this.timers.length; i++) {
			if (this.timers[i].id === id) {
				let timer: Timer = this.timers[i]
				timer.enabled = false
				found = true
				break
			}
		}
		return found
	}
	public setObjectAttr(
		timer: Timer,
		timeout: number = 1.0,
		onlyOnce: boolean = false,
		data: any = undefined
	): Timer {
		timer.timeout = timeout
		timer.countDown = timeout
		timer.enabled = true
		timer.onlyOnce = onlyOnce
		timer.callbackData = data
		return timer
	}
	public addTimer(
		callback: TimerCallback,
		timeout: number = 1.0,
		onlyOnce: boolean = false,
		data: any = ''
	): number {
		let timer: Timer
		for (let i = 0; i < this.timers.length; i++) {
			let timer: Timer = this.timers[i]
			if (!timer.enabled) {
				timer = this.setObjectAttr.call(this, timer, timeout, onlyOnce, data)
				timer.callback = callback
				return timer.id
			}
		}
		timer = this.setObjectAttr.call(this, new Timer(callback), timeout, onlyOnce, data)
		timer.id = ++this._timeId
		this.timers.push(timer)
		return timer.id
	}
	private _handleTimers(intervalSec: number): void {
		for (let i = 0; i < this.timers.length; i++) {
			let timer: Timer = this.timers[i]
			if (!timer.enabled) continue
			timer.countDown -= intervalSec
			if (timer.countDown < 0.0) {
				timer.callback(timer.id, timer.callbackData)
				if (!timer.onlyOnce) {
					timer.countDown = timer.timeout
				} else this.removeTimer(timer.id)
			}
		}
	}
	public get fps() {
		return this._fps
	}
}
