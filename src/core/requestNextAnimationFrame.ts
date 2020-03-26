function isChrome10(userAgent: string): boolean {
	const browserName: string = 'Chrome'
	let chromeInfo = userAgent.match(/Chrome\/((\d+\.|\d+)+)/)
	let chromeFullVersion = chromeInfo[1].match(/^\b(\d+?\.\d)/g)
	let extractVersion: string
	if (chromeFullVersion) {
		extractVersion = chromeFullVersion.join('')
	}
	let afterVersion: string = extractVersion.substring(extractVersion.indexOf('.') + 1)
	return extractVersion === `10.${afterVersion}` && chromeInfo[0] === browserName ? true : false
}

export let requestNextAnimationFrame = (function() {
	let originalWebkitMethod: any
	let wrapper: (time: any) => void
	let geckoVersion: string
	let userAgent: string = navigator.userAgent
	let index: number = 0
	let self: Window = this
	// ?webkit是谷歌专有内核，只从这个判断如果在Chrome中的话，会用这里所修复的方法，然而书上提到只有Chrome 10版本的time参数有bug，
	// &所以这里检测了是不是Chrome 10版本，如果是的话，修复这个bug，
	// %否则的话直接用Chrome内核的webkitRequestAnimationFrame或RequestAnimationFrame，以减少不必要的操作
	if (window.webkitRequestAnimationFrame) {
		wrapper = (time: number) => {
			if (time === undefined) {
				time = +new Date()
			}
			;(self as any).callback(time)
		}
		originalWebkitMethod = window.webkitRequestAnimationFrame
		;(window as any).webkitRequestAnimationFrame = function(
			callback: Function,
			element: HTMLElement
		): void {
			;(self as any).callback = callback
			originalWebkitMethod.call(null, wrapper, element)
		}
	}
	if ((window as any).mozRequestAnimationFrame) {
		index = userAgent.indexOf('rv:')
		if (userAgent.indexOf('Gecko') !== -1) {
			geckoVersion = userAgent.substr(index + 3, 3)
			if (geckoVersion === '2.0') {
				;(window as any).mozRequestAnimationFrame = undefined
			}
		}
	}
	return (
		window.requestAnimationFrame ||
		(window as any).webkitRequestAnimationFrame ||
		(window as any).mozRequestAnimationFrame ||
		(window as any).oRequestAnimationFrame ||
		(window as any).msRequestAnimationFrame ||
		function(callback: Function): void {
			let start: number = 0
			let finish: number = 0
			window.setTimeout(function() {
				start = +new Date()
				callback(start)
				finish = +new Date()
				;(self as any).timeout = 1000 / 60 - (finish - start)
			}, (self as any).timeout)
		}
	)
})()
