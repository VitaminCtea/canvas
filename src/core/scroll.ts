/**
 * 向下取整
 * @param {number} r
 * @return {number}
 */
const mathRound: Function = (r: number) => r >> 0

// ?Browser capabilities(浏览器检测)
const isPhone: boolean = /iphone|ipad|android/gi.test(navigator.appVersion)

// ?Detect if a feature is supported
const has3d: boolean = 'WebkitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()
const hasTouch: boolean = 'ontouchstart' in window && isPhone
const hasTransform: boolean = prefixStyle('transform') in document.documentElement.style
const hasTransition: boolean = prefixStyle('transition') in document.documentElement.style

// ?Compatible with RequestAnimationFrame
const nextFrame: Function = (function() {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		(window as any).mozRequestAnimationFrame ||
		(window as any).oRequestAnimationFrame ||
		(window as any).msRequestAnimationFrame ||
		function(callback: Function) {
			return setTimeout(callback, 17)
		}
	)
})()

const cancelFrame: Function = (function() {
	return (
		window.cancelAnimationFrame ||
		window.webkitCancelAnimationFrame ||
		(window as any).wekitCancelRequestAnimationFrame ||
		(window as any).mozCancelRequestAnimationFrame ||
		(window as any).oCancelRequestAnimationFrame ||
		(window as any).msCancelRequestAnimationFrame ||
		clearTimeout
	)
})()

// ?event
const RESIZE_EV: string = 'onorientationchange' in window ? 'orientationchange' : 'resize'
const START_EV: string = hasTouch ? 'touchstart' : 'mousedown'
const MOVE_EV: string = hasTouch ? 'touchmove' : 'mousemove'
const END_EV: string = hasTouch ? 'touchend' : 'mouseup'
const CANCEL_EV: string = hasTouch ? 'touchcancel' : 'mouseup'

// translate
const translateOpen: string = 'translate' + (has3d ? '3d(' : '(')
const translateClose: string = has3d ? ',0)' : ')'

// ?helper
/**
 * 获取父级中第一个满足可以滚动条件的元素
 * @param {Element} el
 * @return {Element}
 */

let extend: <T, U>(origin: T, target: U) => void = (origin, target): void =>
	Object.entries(origin).forEach(([key, value]) => (target[key] = value))

/**
 * 样式属性兼容处理函数
 * @param {string} property
 * @param {string} [isCSS=false]
 * @return {string}
 * ?转换某些属性(增加浏览器厂商前缀)
 */
function prefixStyle(property: string, isCSS: boolean = false): string {
	const has: string | boolean = getBrowserVendorCSS(property, isCSS)
	if (has === '') return property
	if (isCSS) return has + property
	return has + property.charAt(0).toUpperCase() + property.substring(1)
}

function getBrowserVendorCSS(property: string, isCSS: boolean = false): string {
	const doc: CSSStyleDeclaration = document.documentElement.style
	const vendors: string[] = ['webkit', 'moz', 'ms', 'o']
	let transformProperty: string = ''
	for (let i: number = 0; i < vendors.length; i++) {
		const p: string = vendors[i] + property.charAt(0).toUpperCase() + property.substring(1)
		if (p in doc) {
			if (isCSS) {
				transformProperty = `-${vendors[i]}-`
				break
			} else {
				transformProperty = vendors[i]
				break
			}
		}
	}
	return transformProperty
}

// Compatible with MouseEvent
function MouseEvent(mouseEventInitOptions: MouseEventOptions): ReturnInstance {
	const values: any[] = Object.values(mouseEventInitOptions)
	try {
		return new (MouseEvent.bind(MouseEvent, ...values))()
	} catch (e) {
		const MouseEventPolyFill: any = function() {
			const mouseEvent: MouseEvent = document.createEvent(
				mouseEventInitOptions['mouseEventType']
			) as any
			mouseEvent.initMouseEvent.apply(mouseEvent, values)
			return mouseEvent
		}
		MouseEventPolyFill.prototype = Event.prototype
		return new MouseEventPolyFill()
	}
}

let getTime: Function = Date.now || new Date().getTime.bind(Date)

// Pad zero
function padZero(date: number | string, len: number = 2): string {
	date += ''
	return '0000'.substr(0, len - (date as string).length) + date
}

function format(newMonth: number, type: string = DateSuffix.Month, isUTC: boolean = false): string {
	const specialMethod: Options<Required<MethodOptions>> = {
		FullYear: 'year',
		Date: 'day',
		Day: 'week'
	}
	const date: Date = new Date()
	const UTC: string = isUTC ? 'UTC' : ''
	setDate(date, type, newMonth, UTC)
	return formattingDate(generateDateObj(Object.keys(DateSuffix), date, specialMethod, UTC))
}

// Set date
const setDate: (date: Date, type: string, newMonth: number, UTC: string) => number = (
	date: Date,
	type: string,
	newMonth: number,
	UTC: string
): number => newMonth && Number.isInteger(newMonth) && date[`set${UTC}${type}`](newMonth)

function formattingDate(options: { [PropName: string]: number }): string {
	const dateTemplate: string = 'YYYY-MM-DD hh:mm:ss ww'
	const chinaWeek: string[] = ['日', '一', '二', '三', '四', '五', '六']
	const { year, month, day, hours, minutes, seconds, week } = options
	return dateTemplate
		.replace('YYYY', year + '')
		.replace('MM', padZero(month + 1))
		.replace('DD', padZero(day))
		.replace('hh', padZero(hours))
		.replace('mm', padZero(minutes))
		.replace('ss', padZero(seconds))
		.replace('ww', `星期${chinaWeek[week]}`)
}

const generateDateObj: Function = (
	methods: string[],
	date: Date,
	specialMethod: MethodOptions,
	utc: string
) =>
	methods.reduce((result, current) => {
		if (specialMethod.hasOwnProperty(current)) {
			result[specialMethod[current]] = date[`get${utc}${current}`]()
		} else {
			const convert: string = current.charAt(0).toLowerCase() + current.substring(1)
			result[convert] = date[`get${utc}${current}`]()
		}
		return result
	}, {})

// has class
function hasClassName(el: HTMLElement, className: string): boolean {
	const reg: RegExp = new RegExp('^|\\s' + className + '\\s|$')
	return reg.test(el.className)
}

// add class
function addClassName(el: HTMLElement, className: string): boolean {
	if (!hasClassName(el, className)) return false
	let isHasClassName: boolean = false
	const classNames: string[] = el.className.split(' ')
	if (!el.className.length) isHasClassName = true
	classNames.push(className)
	isHasClassName ? (el.className = classNames.join('')) : (el.className = classNames.join(' '))
	return true
}

// remove class
function removeClassName(el: HTMLElement, className: string): boolean {
	if (!hasClassName(el, className)) return false
	const classNames: string[] = el.className.split(' ')
	for (let i: number = 0; i < classNames.length; i++) {
		const name: string = classNames[i]
		if (name === className) {
			classNames.splice(i, 1)
			break
		}
	}
	el.className = classNames.join(' ')
	return true
}

// add text
function setContent(el: HTMLElement, content: string): boolean {
	if (typeof el.textContent !== 'undefined') {
		el.textContent = content
	} else {
		el.innerText = content
	}
	return true
}

// enum
enum DateSuffix {
	FullYear = 'FullYear',
	Month = 'Month',
	Date = 'Date',
	Hours = 'Hours',
	Minutes = 'Minutes',
	Seconds = 'Seconds',
	Day = 'Day'
}

// ?Interface
interface OptionsInterface {
	isHorizontalScroll: boolean
	isVerticalScroll: boolean
	horizontalScrollbar: boolean
	verticalScrollbar: boolean
	bounce: boolean
	bounceLock: boolean
	momentum: boolean
	lockDirection: boolean
	useTransform: boolean
	useTransition: boolean
	x: number
	y: number

	onRefresh: null | Function
	onBeforeScrollStart: null | Function
	onScrollStart: null | Function
	onBeforeScrollMove: null | Function
	onScrollMove: null | Function
	onBeforeScrollEnd: null | Function
	onScrollEnd: null | Function
	onTouchEnd: null | Function
	onDestroy: null | Function
	onAnimationEnd: null | Function
}

type Options<O> = { [K in keyof O]: O[K] }

interface MethodOptions {
	FullYear: string
	Date: string
	Day: string
}

interface MouseEventOptions {
	mouseEventType: string
	canBubble: boolean
	cancelable: boolean
	view: Window
	detail: number
	screenX: number
	screenY: number
	clientX: number
	clientY: number
	ctrlKey: boolean
	altKey: boolean
	shiftKey: boolean
	metaKey: boolean
	button: number
	relatedTarget?: EventTarget | null
}

interface ReturnInstance {
	new (): any
}

// CSS3兼容属性
const transform: string = prefixStyle('transform')
const transitionProperty: string = prefixStyle('transitionProperty')
const transitionDuration: string = prefixStyle('transitionDuration')
const transitionTimingFunction: string = prefixStyle('transitionTimingFunction')
const transformOrigin: string = prefixStyle('transformOrigin')

// ?Scroll构造函数
export class Scroll {
	private readonly wrapper: HTMLElement
	private readonly scroller: Element

	private readonly options: Options<OptionsInterface>

	private steps: Array<{ x: number; y: number; time: number; relative?: number }> = []

	private enabled: boolean = true
	private moved: boolean = false
	private animating: boolean = false
	private zoomed: boolean = false
	private isHorizontalScroll: boolean = false
	private isVerticalScroll: boolean = true
	private isInTransition: boolean = false

	private x: number = 0
	private y: number = 0
	private scale: number = 1
	private distanceX: number = 0
	private distanceY: number = 0
	private absDistX: number = 0
	private absDistY: number = 0
	private directionX: number = 0
	private directionY: number = 0
	private startX: number = 0
	private startY: number = 0
	private pointX: number = 0
	private pointY: number = 0
	private startTime: number = 0
	private aniTime: number = 0
	private maxScrollX: number = 0
	private maxScrollY: number = 0
	private wrapperW: number = 0
	private wrapperH: number = 0
	private scrollerW: number = 0
	private scrollerH: number = 0
	private wrapperOffsetLeft: number = 0
	private wrapperOffsetTop: number = 0
	private endTime: number = 0
	/**
	 * @constructor
	 * @param {Element} el
	 * @param {Object.<string, object>}
	 */
	constructor(el: any, options: { [PropName: string]: any }) {
		this.wrapper = typeof el === 'object' ? el : document.getElementById(el)
		const style: CSSStyleDeclaration = window.getComputedStyle(this.wrapper, null)
		if (!style.getPropertyValue('overflow')) {
			this.wrapper.style.overflow = 'hidden'
		}
		this.scroller = this.wrapper.querySelector('#move')
		this.options = {
			isHorizontalScroll: false, // 是否是横向滚动
			isVerticalScroll: true, // 是否是纵向滚动
			horizontalScrollbar: false, // 是否显示横向滚动条
			verticalScrollbar: true, // 是否显示纵向滚动条
			bounce: true, // 是否开启反弹
			bounceLock: false, // 是否设置反弹锁
			momentum: true, // 是否开启惯性
			lockDirection: true, // 是否开启方向锁
			useTransform: true, // 是否使用transform进行移动
			useTransition: true, // 是否使用transition过渡
			x: 0, // 横坐标
			y: 0, // 纵坐标
			/** @type {Event functions} */
			onRefresh: null,
			onBeforeScrollStart: null,
			onScrollStart: null,
			onBeforeScrollMove: null,
			onScrollMove: null,
			onBeforeScrollEnd: null,
			onScrollEnd: null,
			onTouchEnd: null,
			onAnimationEnd: null,
			onDestroy: null
		}
		extend(options, this.options)
		this.init()
	}
	getHeight(el: Element): number {
		return el.clientHeight
	}
	createNodes(nodeNums: number, isAddChild: boolean = false): boolean {
		if (this.getHeight(this.scroller) > this.getHeight(this.wrapper) / 2 && !isAddChild)
			return false
		const fragment: DocumentFragment = document.createDocumentFragment()
		for (let i: number = 0; i < nodeNums; i++) {
			const p: HTMLElement = document.createElement('p')
			addClassName(p, 'itemRow')
			fragment.appendChild(p)
		}
		this.scroller.appendChild(fragment)
		return true
	}
	init(): void {
		// 创建滚动节点
		this.createNodes(80, true)
		this.createNodes(20, true)
		// 初始化节点文本
		Array.from(this.scroller.children).forEach((child, index) =>
			setContent(child as HTMLElement, format(index))
		)

		this.initialization()
		// 初始化options
		this.options.horizontalScrollbar =
			this.options.isHorizontalScroll && this.options.horizontalScrollbar
		this.options.verticalScrollbar =
			this.options.isVerticalScroll && this.options.verticalScrollbar
		this.options.useTransform = hasTransform ? this.options.useTransform : false
		this.options.useTransition = hasTransition && this.options.useTransition

		// 设置一些默认样式
		const style: CSSStyleDeclaration = window.getComputedStyle(this.scroller, null)
		const property: string = style[transform]
		if (property === 'none') {
			;(this.scroller as HTMLElement).style[transform] = 'translate3d(0, 0, 0)'
		}

		;(this.scroller as HTMLElement).style[transitionProperty] =
			this.options.useTransform && prefixStyle('transform', true)
		;(this.scroller as HTMLElement).style[transitionDuration] = '0'
		;(this.scroller as HTMLElement).style[transformOrigin] = '0 0'

		if (this.options.useTransition) {
			;(this.scroller as HTMLElement).style[transitionTimingFunction] =
				'cubic-bezier(0.33, 0.66, 0.66, 1)'
		}
		if (this.options.useTransform) {
			;(this.scroller as HTMLElement).style[
				transform
			] = `${translateOpen}${this.x}px, ${this.y}px, ${translateClose}`
		} else {
			;(this
				.scroller as HTMLElement).style.cssText += `;position: absolute; top: ${this.y}px; left: ${this.x}px`
		}
		this.bind(RESIZE_EV, window as any)
		this.bind(START_EV)
		if (!hasTouch) this.bind('mouseout', this.wrapper)
	}
	initialization() {
		this.wrapperW = this.wrapper.clientWidth // 容器宽度
		this.wrapperH = this.wrapper.clientHeight // 容器高度
		this.scrollerW = (this.scroller as any).offsetWidth // 滚动列表的宽度
		this.scrollerH = (this.scroller as any).offsetHeight // 滚动列表的高度
		this.maxScrollX = this.wrapperW - this.scrollerW // 最大的横向滚动距离
		this.maxScrollY = this.wrapperH - this.scrollerH // 最大的纵向滚动距离
		this.directionX = 0 // 正反横向
		this.directionY = 0 // 正反纵向
		this.x = this.options.x // 横向坐标
		this.y = this.options.y // 纵向坐标
		this.isHorizontalScroll = this.options.isHorizontalScroll && this.maxScrollX < 0 // 是否是横向滚动
		this.isVerticalScroll =
			this.options.isVerticalScroll &&
			((!this.options.bounceLock && !this.isHorizontalScroll) ||
				(this.scrollerH > this.wrapperH && this.maxScrollY < 0)) // 是否是纵向滚动
		// 设置一个方向
		if (!this.isHorizontalScroll) {
			this.maxScrollX = 0
			this.scrollerW = this.wrapperW
		}
		if (!this.isVerticalScroll) {
			this.maxScrollY = 0
			this.scrollerH = this.wrapperH
		}
		this.moved = false
		let offset: { left: number; top: number } = this.offset(this.wrapper) // 容器元素相对文档的偏移位置
		this.wrapperOffsetLeft = -(offset as any).left // X
		this.wrapperOffsetTop = -(offset as any).top // Y
		;(this.scroller as any).style[transitionDuration] = '0' // 设置过渡时间
	}
	start(e: Event): void {
		const point: TouchList | Event = hasTouch ? (e as any).touches[0] : e
		const { offsetX, offsetY } = this.getComputedPosition()
		if (!this.enabled) return
		if (this.options.onBeforeScrollStart) this.options.onBeforeScrollStart.call(this, e)
		if (this.options.useTransition) this.setTransitionTime(0)
		this.moved = false
		this.animating = false // 是否在滚动
		this.zoomed = false // 是否变焦(放大, 缩小)
		this.distanceX = 0 // 鼠标最终的移动点与鼠标按下时的点的横向距离
		this.distanceY = 0 // 鼠标最终的移动点与鼠标按下时的点的纵向距离
		this.absDistX = 0 // 上面横向距离的绝对值
		this.absDistY = 0 // 上面纵向距离的绝对值
		this.directionX = 0 // 横向方向(-1代表往左滚动, 1表示往右滚动, 0表示没有动)
		this.directionY = 0 // 纵向方向(-1代表往上滚动, 1表示往下滚动, 0表示没有动)
		if (this.options.momentum) {
			// 如果没有进行滚动, 仅仅是点击了, 那么重置(解绑事件或者取消动画函数、动画信息数组、更新坐标)
			if (offsetX !== this.x || offsetY !== this.y) {
				// 如果信息不一致的话, 需要解除或重置一些操作
				if (this.options.useTransition) this.unbind('webkitTransitionEnd')
				else cancelFrame(this.aniTime)
				this.steps = []
				this.updatePosition(offsetX, offsetY)
				this.updateCoordinate(offsetX, offsetY)
			}
		}
		this.startX = this.x // 初始横坐标
		this.startY = this.y // 初始纵坐标
		this.pointX = (point as any).pageX // 第一次鼠标按下的TouchList对象(相对于文档偏移的横坐标)
		this.pointY = (point as any).pageY // 同上
		this.startTime = getTime() // 按下鼠标时候的时间
		if (this.options.useTransition && this.isInTransition) {
			this.isInTransition = false
			this.updatePosition(offsetX, offsetY)
			this.updateCoordinate(offsetX, offsetY)
		}
		if (this.options.onScrollStart) this.options.onScrollStart.call(this, e)
		// 绑定事件
		this.bind(MOVE_EV)
		this.bind(END_EV)
		this.bind(CANCEL_EV)
	}
	move(e: Event): void {
		const point: TouchList = hasTouch ? (e as any).touches[0] : e
		// 获取鼠标移动最终的点和鼠标起始落下的坐标
		let deltaX: number = (point as any).pageX - this.pointX
		let deltaY: number = (point as any).pageY - this.pointY
		const timeStamp: number = getTime()
		// 最终的坐标
		let newX: number = this.x + deltaX
		let newY: number = this.y + deltaY
		// 如果有生命周期钩子的话, 则调用它
		if (this.options.onBeforeScrollMove) this.options.onBeforeScrollMove.call(this, e)
		// 更新当时鼠标按下的坐标
		this.pointX = (point as any).pageX
		this.pointY = (point as any).pageY
		// 到达边界位置
		if (newX > 0 || newX < this.maxScrollX) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX
		}
		if (newY > 0 || newY < this.maxScrollY) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY
		}
		// 记录鼠标相差的距离
		this.distanceX += deltaX
		this.distanceY += deltaY
		// 记录正值的鼠标相差距离
		this.absDistX = Math.abs(this.distanceX)
		this.absDistY = Math.abs(this.distanceY)
		if (this.absDistX < 10 && this.absDistY < 10) return // 距离不能小于10
		if (this.options.lockDirection) {
			// 判断是往哪个方向进行移动, 取最小值
			// 如果在一个方向上的移动差值大于另一个方向的差值, 那么另一个方向设置为0
			if (this.absDistX > this.absDistY + 5) {
				newY = this.y
				deltaY = 0
			} else if (this.absDistY > this.absDistX + 5) {
				newX = this.x
				deltaX = 0
			}
		}
		this.moved = true // 开始移动
		this.updatePosition(newX, newY) // 移动滚动容器
		this.updateCoordinate(newX, newY) // 更新坐标
		// 判断滚动方向(-1代表向下滚动, 1代表向上滚动, 0代表没有方向)
		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0
		if (timeStamp - this.startTime > 300) {
			// 如果大于300ms的话, 说明不是惯性滚动
			this.startTime = timeStamp
			this.startX = this.x
			this.startY = this.y
		}
		// 调用生命周期钩子
		if (this.options.onScrollMove) this.options.onScrollMove.call(this, e)
	}
	end(e: Event): void {
		// 鼠标移动完成后并且抬起鼠标按键逻辑
		if (!this.enabled) return
		let target: Node & ParentNode
		let ev: any
		let momentumX: { destination: number; duration: number } = { destination: 0, duration: 0 }
		let momentumY: { destination: number; duration: number } = { destination: 0, duration: 0 }
		let newPosX: number = this.x
		let newPosY: number = this.y
		let newDuration: number
		const point: TouchList | Event = hasTouch ? (e as any).changedTouches[0] : e
		const duration: number = getTime() - this.startTime

		const mouseEventOptions: MouseEventOptions = {
			mouseEventType: 'MouseEvents',
			canBubble: true,
			cancelable: true,
			view: (e as any).view,
			detail: 1,
			screenX: (point as any).screenX,
			screenY: (point as any).screenY,
			clientX: (point as any).clientX,
			clientY: (point as any).clientY,
			ctrlKey: (e as any).ctrlKey,
			altKey: (e as any).altKey,
			shiftKey: (e as any).shiftKey,
			metaKey: (e as any).metaKey,
			button: 0,
			relatedTarget: null
		}
		this.endTime = getTime()

		this.unbind(MOVE_EV)
		this.unbind(END_EV)
		this.unbind(CANCEL_EV)
		if (this.options.onBeforeScrollEnd) this.options.onBeforeScrollEnd.call(this, e)
		if (!this.moved) {
			if (hasTouch) {
				target = (point as any).target
				while (target.nodeType !== 1) target = target.parentNode
				if (
					(target as HTMLElement).tagName !== 'SELECT' &&
					(target as HTMLElement).tagName !== 'INPUT' &&
					(target as HTMLElement).tagName !== 'TEXTAREA'
				) {
					ev = MouseEvent(mouseEventOptions)
					;(ev as any)._fake = true
					target.dispatchEvent(ev as any)
				}
			}
			this.resetPos(200)
			if (this.options.onTouchEnd) this.options.onTouchEnd.call(this, e)
			return
		}
		if (duration < 300 && this.options.momentum) {
			momentumX = this.isHorizontalScroll
				? this.momentum(
						this.x,
						this.startX,
						duration,
						this.maxScrollX,
						this.options.bounce ? this.wrapperW : 0
				  )
				: { destination: newPosX, duration: 0 }
			momentumY = this.isVerticalScroll
				? this.momentum(
						this.y,
						this.startY,
						duration,
						this.maxScrollY,
						this.options.bounce ? this.wrapperH : 0
				  )
				: { destination: newPosY, duration: 0 }
			newPosX = momentumX.destination
			newPosY = momentumY.destination
			if (
				(this.x > 0 && newPosX > 0) ||
				(this.x < this.maxScrollX && newPosX < this.maxScrollX)
			) {
				momentumX = { destination: 0, duration: 0 }
			}
			if (
				(this.y > 0 && newPosY > 0) ||
				(this.y < this.maxScrollY && newPosY < this.maxScrollY)
			) {
				momentumY = { destination: 0, duration: 0 }
			}
			this.isInTransition = true
		}
		if (momentumX.destination || momentumY.destination) {
			newDuration = Math.max(Math.max(momentumX.duration, momentumY.duration), 10)
			this.scrollTo(mathRound(newPosX), mathRound(newPosY), newDuration)
			if (this.options.onTouchEnd) this.options.onTouchEnd.call(this, e)
			return
		}
		this.resetPos(200)
		if (this.options.onTouchEnd) this.options.onTouchEnd.call(this, e)
	}
	getComputedPosition(): { offsetX: number; offsetY: number } {
		let matrix: any = window.getComputedStyle(this.scroller, null)
		const style: CSSStyleDeclaration = window.getComputedStyle(this.scroller, null)
		let offsetX: number
		let offsetY: number
		if (this.options.useTransform) {
			matrix = (style as any)[prefixStyle('transform')].replace(/[^0-9-.,]/g, '').split(',') // 提取矩阵的参数
			offsetX = matrix[4] * 1 // 水平方向的位移
			offsetY = matrix[5] * 1 // 竖直方向的位移
		} else {
			// 如果不适用transform进行移动的话, 退其次用定位
			offsetX = (style as any).left.replace(/[^0-9-]/g, '') * 1
			offsetY = (style as any).top.replace(/[^0-9-]/g, '') * 1
		}
		return { offsetX, offsetY }
	}
	resize(): void {
		// 尺寸变化的时候需要刷新
		this.refresh()
	}
	updatePosition(x: number, y: number): void {
		// 更新位置
		x = this.options.isHorizontalScroll ? x : 0
		y = this.options.isVerticalScroll ? y : 0
		if (this.options.useTransform) {
			;(this.scroller as HTMLElement).style[
				transform
			] = `${translateOpen}${x}px, ${y}px${translateClose} scale(${this.scale})`
		} else {
			x = mathRound(x)
			y = mathRound(y)
			;(this.scroller as HTMLElement).style.left = `${x}px`
			;(this.scroller as HTMLElement).style.top = `${y}px`
		}
	}
	updateCoordinate(x: number, y: number): void {
		// 更新坐标
		this.x = x
		this.y = y
	}
	resetPos(time: number): void {
		const resetX: number = this.x >= 0 ? 0 : this.x < this.maxScrollX ? this.maxScrollX : this.x
		const resetY: number =
			this.y >= 0 || this.maxScrollY > 0
				? 0
				: this.y < this.maxScrollY
				? this.maxScrollY
				: this.y
		if (resetX === this.x && resetY === this.y) {
			if (this.moved) {
				if (this.options.onScrollEnd) this.options.onScrollEnd.call(this)
				this.moved = false
			}
			return
		}
		this.scrollTo(resetX, resetY, time || 0)
	}
	momentum(
		current: number,
		start: number,
		time: number,
		lowerMargin: number,
		wrapperSize: number,
		deceleration?: number
	): { destination: number; duration: number } {
		let distance: number = current - start
		let speed: number = Math.abs(distance) / time
		let destination: number
		let duration: number
		/** @type {number} deceleration - 减速(默认值为0.0006)
		 * 	@type {number} destination - 目的地(终点)
		 */
		deceleration = deceleration === undefined ? 0.0026 : deceleration
		destination = current + ((speed * speed) / (2 * deceleration)) * (distance < 0 ? -1 : 1)
		duration = speed / deceleration
		if (destination < lowerMargin) {
			// 下边界(滚动超过正常的底部值)
			destination = wrapperSize
				? lowerMargin - (wrapperSize / 2.5) * (speed / 8)
				: lowerMargin
			distance = Math.abs(destination - current)
			duration = distance / speed
		} else if (destination > 0) {
			// 上边界(滚动超过正常的顶部值)
			destination = wrapperSize ? (wrapperSize / 2.5) * (speed / 8) : 0
			distance = Math.abs(current) + destination
			duration = distance / speed
		}
		return {
			destination: mathRound(destination),
			duration
		}
	}
	scrollTo(x: number, y: number, time: number, relative?: number): void {
		let step: number | Array<{ x: number; y: number; time: number; relative?: number }> = x
		this.stop()
		if (!(step as any).length) step = [{ x: x, y: y, time: time, relative: relative }]

		for (let i: number = 0; i < (step as any).length; i++) {
			if (step[i].relative) {
				step[i].x = this.x - step[i].x
				step[i].y = this.y - step[i].y
			}
			this.steps.push({
				x: step[i].x,
				y: step[i].y,
				time: step[i].time || 0
			})
		}
		this.startAnimate()
	}
	stop(): void {
		cancelFrame(this.aniTime)
		this.steps = []
		this.moved = false
		this.animating = false
	}

	startAnimate(): void {
		let startX: number = this.x
		let startY: number = this.y
		let startTime: number = getTime()
		let step: { x: number; y: number; time: number; relative?: number }
		let easeOut: number = 0
		let animate: Function
		if (this.animating) return
		if (!this.steps.length) {
			this.resetPos(400)
			return
		}
		step = this.steps.shift()
		if (step.x === startX && step.y === startY) step.time = 0
		this.animating = true
		this.moved = true
		animate = () => {
			let currentTime: number = getTime()
			let newX: number = 0
			let newY: number = 0
			if (currentTime - startTime > step.time) {
				this.updatePosition(step.x, step.y)
				this.updateCoordinate(step.x, step.y)
				this.animating = false
				if (this.options.onAnimationEnd) this.options.onAnimationEnd.call(this)
				this.startAnimate()
				return
			}
			currentTime = (currentTime - startTime) / step.time - 1
			easeOut = Math.sqrt(1 - currentTime * currentTime)
			newX = (step.x - startX) * easeOut + startX
			newY = (step.y - startY) * easeOut + startY
			this.updatePosition(newX, newY)
			this.updateCoordinate(newX, newY)
			if (this.animating) this.aniTime = nextFrame(animate)
		}
		animate()
	}
	offset(el: HTMLElement): { left: number; top: number } {
		let left: number = -(el as any).offsetLeft
		let top: number = -(el as any).offsetTop
		// tslint:disable-next-line:no-conditional-assignment
		while ((el = (el as any).offsetParent)) {
			left -= (el as any).offsetLeft
			top -= (el as any).offsetTop
		}
		return { left, top }
	}
	setTransitionTime(time: number): void {
		;(this.scroller as any).style[transitionDuration] = time + 'ms'
	}
	transitionEnd(e: Event): void {
		if (e.target !== this.scroller) return
		this.unbind('webkitTransitionEnd')
		this.isInTransition = false
		this.startAnimate()
	}
	mouseout(e: Event): void {
		let t: Node & ParentNode = (e as any).relatedTarget
		if (!t) {
			this.end(e)
			return
		}
		while (t) {
			if (t === this.wrapper) return
			t = t.parentNode
		}
		this.end(e)
	}
	refresh() {
		this.initialization()
		this.resetPos(200) // 初始位置
	}
	bind(type: string, el?: HTMLElement, bubble?: boolean): void {
		;(el || this.scroller).addEventListener(type, this, !!bubble)
	}
	unbind(type: string, el?: HTMLElement, bubble?: boolean): void {
		;(el || this.scroller).removeEventListener(type, this, !!bubble)
	}
	destroy(): void {
		;(this.scroller as HTMLElement).style[transform] = ''
		this.unbind(RESIZE_EV, window as any)
		const events: string[] = [START_EV, MOVE_EV, END_EV, CANCEL_EV]
		events.forEach(event => this.unbind(event))
		this.unbind('mouseout', this.wrapper)
		if (this.options.useTransition) this.unbind('webkitTransitionEnd')
		if (this.options.onDestroy) this.options.onDestroy.call(this)
	}
	enable(): void {
		this.enabled = true
	}
	disable(): void {
		this.stop()
		this.resetPos(0)
		this.enabled = false
		this.unbind(MOVE_EV)
		this.unbind(END_EV)
		this.unbind(CANCEL_EV)
	}
	scrollToElement(el: any, time?: number): void {
		let pos: { left: number; top: number }
		el = el.nodeType ? el : this.scroller.querySelector(el)
		if (!el) return
		pos = this.offset(el)
		pos.left += this.wrapperOffsetLeft
		pos.top += this.wrapperOffsetTop
		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left
		pos.top = pos.top > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top
		time = time === undefined ? Math.max(Math.abs(pos.left) * 2, Math.abs(pos.top) * 2) : time
		this.scrollTo(pos.left, pos.top, time)
	}
	handleEvent(e: Event): void {
		switch (e.type) {
			case START_EV:
				if (!hasTouch && (e as any).button !== 0) return
				this.start(e)
				break
			case MOVE_EV:
				this.move(e)
				break
			case END_EV:
			case CANCEL_EV:
				this.end(e)
				break
			case RESIZE_EV:
				this.resize()
				break
			case 'mouseout':
				this.mouseout(e)
				break
			case 'webkitTransitionEnd':
				this.transitionEnd(e)
				break
		}
	}
}
