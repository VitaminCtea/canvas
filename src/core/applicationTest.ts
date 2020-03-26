// import { Application } from './application'
// import { CanvasKeyBoardEvent } from './event/canvasKeyBoardEvent'
// import { CanvasMouseEvent } from './event/canvasMouseEvent'
// import { TestApplication } from './testApplication'
// import { Rectangle } from './math2D'
// import { axis } from './drawPolygon'
// import './scale'
// import './filter'
// import './demoSprite'
// import './algorithm'
// import './demoSpriteSheetPainter'
// import './spriteAnimator'
// import './demoGravity'
// import './demoBallistic'

// import './demoPendulum'
// import './demoGravityAddVelocity'
import { Scroll } from './scroll'
const scroll: Scroll = new Scroll('wrapper', {
	onBeforeScrollStart: function() {
		console.log('滚动准备之前')
	},
	onScrollStart: function() {
		console.log('滚动开始准备')
	},
	onBeforeScrollMove: function() {
		console.log('滚动即将开始滚动')
	},
	onScrollMove: function() {
		console.log('滚动中...')
	},
	onScrollEnd: function() {
		console.log('滚动结束...')
	}
})

// scroll.scrollToElement(document.getElementById('testID'))

import '../demo/demoTimeWarp'
/// <reference path="node.d.ts"/>
import * as URL from 'url'
const myURL = URL.parse('http://www.typescriptlang.com')
const nameObj = {
	name: 'FuLiu'
}

console.log(myURL)

const isURL: Function = (url: string): Boolean => {
	const reg: RegExp = /https?:\/\/(?:[A-Za-z]+:\w+@\w+)?\w+\.\w+\.(?:com|cn|net)(:\d+)?(?:(\/[A-Za-z]+)+)?(?:\?(&?[^\?=&]+=[^&#]+)+)?(?:#[^#]+)?/gi
	const match: any[] | null = reg.exec(url)
	return match ? match[0].length === url.length : false
}

function paramTransformObj(url: string = location.search): { [PropName: string]: any } | never {
	if (!isURL(url)) throw new TypeError('URL网址格式不合法，请检查网址!')
	if (url.indexOf('?') === -1) throw new TypeError('请在URL网址中添加参数!')
	let query: string = url.match(/(?:^|(?<=[?&]))(?:([^=?&]+=[^&#=]+&?)+)/g)[0]

	return query.split('&').reduce((initial: { [PropName: string]: any }, current: string) => {
		const [key, value] = current.split('=')
		return (initial[key] = value) && initial
	}, Object.create(null))
}

console.log(
	paramTransformObj(
		'https://www.baidu.com/s?wd=exec&rsv_spt=1&rsv_iqid=0x89782f3c0002a39a&issp=1&f=8&rsv_bp=1&rsv_idx=2&ie=utf-8&rqlang=cn&tn=baiduhome_pg&rsv_enter=1&rsv_dl=tb&oq=URL%25E8%25AF%25AD%25E6%25B3%2595%25E6%25A0%25BC%25E5%25BC%258F&inputT=3530&rsv_t=541dhTuQlz7bmiJ4flwT0SryfYsggW86QGQpTtQcuErMyGxlBfHQf4P35YnUMZxMmFTs&rsv_pq=99a4a0000001297c&rsv_sug3=165&rsv_sug1=97&rsv_sug7=100&rsv_sug2=0&rsv_sug4=3530'
	)
)

// 无重复字符的最长字串
// abcabcabc
function getNoRepeatStr(str: string): string | number {
	if (typeof str !== 'string') return 0
	if (str.length < 2) return str.length
	const map: Map<string, number> = new Map()
	let len: number = 0
	// tslint:disable-next-line:one-variable-per-declaration
	for (let start: number = 0, end: number = 0; end < str.length; end++) {
		const char: string = str[end]
		if (map.get(char)) {
			start = Math.max(map.get(char), start)
		}
		len = Math.max(len, end - start + 1)
		map.set(char, end + 1)
	}
	return len
}

console.time('rr')
console.log(getNoRepeatStr('jslojs'))
console.timeEnd('rr')

// {1,2,3,4,5,7,6,1,8},k=2
function getMax(array: number[], k: number): number {
	let left: number = 0
	let max: number = 0
	for (let i = 0; i < k; i++) {
		max += array[i]
	}
	let total = max
	while (left + k < array.length) {
		total = total - array[left] + array[left + k]
		left++
		max = Math.max(max, total)
	}
	return max
}
console.log(getMax([1, 2, 3, 4, 5, 7, 6, 1, 8], 2))

type PromiseType = Array<Promise<{ item: number; index: number } | number>>
type returnPromiseType = Promise<{ item: number; index: number } | number>

function requestLimit(
	requestArray: any[],
	limit: number,
	asyncHandle: (data: number, index: number) => returnPromiseType
): Promise<Array<{ item: number; index: number } | number>> {
	return new Promise(resolve => {
		let recordList: (number | { item: number; index: number })[] = []
		let index: number = 0
		let listCopy: number[] = [].concat(requestArray)
		function asyncFunc() {
			let _limit: number = limit
			let asyncList: PromiseType = []
			while (_limit--) {
				const data: number = listCopy.shift()
				data && asyncList.push(asyncHandle(data, index++))
			}
			Promise.all(asyncList).then(response => {
				recordList = recordList.concat(response)
				if (listCopy.length !== 0) asyncFunc()
				else resolve(recordList)
			})
		}
		asyncFunc()
	})
}

const dataList: number[] = [1, 2, 3, 4, 5, 6, 7, 8]

let isArray = (list: any): list is Array<any> =>
	Array.isArray ? Array.isArray(list) : Object.prototype.toString.call(list) === '[object Array]'

function getRandom(...rest): number {
	let lowerValue: number = 0
	let highValue: number = 0
	if (rest.length === 1 && isArray(rest[0])) {
		lowerValue = Math.min.apply(null, rest[0])
		highValue = Math.max.apply(null, rest[0])
	} else {
		const [first, second] = rest
		lowerValue = first > second ? second : first < second ? first : 1
		highValue = first > second ? first : first < second ? second : rest.length
	}
	const choices: number = highValue - lowerValue + 1
	return Math.floor(Math.random() * choices + lowerValue)
}

requestLimit(dataList, 3, (item, index) => {
	return new Promise(resolve => {
		setTimeout(() => {
			console.log('执行任务: ' + index)
			if ((item & 1) === 0) resolve(dataList[getRandom(dataList)])
			else resolve({ item, index })
		}, 5000)
	})
}).then(response => {
	console.log('finish', response)
})

function pluck<T, K extends keyof T>(obj: T, array: K[]): T[K][] {
	return array.map(item => obj[item])
}

// ?返回一个可选的属性，但必须包含一个newMember属性并且为布尔类型
type PartialWithNewMember<T> = { [P in keyof T]?: T[P] } & { newMember: boolean }

// !返回一个在接口中是function, 并且是这个属性是接口其中符合函数类型的属性
type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
type Foo<T> = T extends { a: infer U; b: infer U } ? U : never // ?返回一个字符串类型(infer是推断变量类型)
type T10 = Foo<{ a: string; b: string }>

const partial: PartialWithNewMember<{}> = {
	newMember: false
}

interface Part {
	id: number
	name: string
	subParts: Part[]
	updatePart(newName: string): void
}

const updatePart: FunctionPropertyNames<Part> = 'updatePart'
const functionProperty = {
	[updatePart]: function() {
		console.log('函数名字为: ' + updatePart)
	}
}
functionProperty[updatePart]()

const obj = {
	name: 'FuLiu',
	age: '22',
	job: '前端会吟狮'
}
console.log(pluck(obj, ['name', 'age', 'job']))

// require('./polygonProgram')
// %绘制坐标系和二次贝塞尔曲线
// axis()

// class ApplicationTest extends Application {
// 	protected dispatchKeyDown(evt: CanvasKeyBoardEvent): void {
// 		console.log('key: ' + evt.key + ' is down')
// 	}
// 	protected dispatchMouseDown(evt: CanvasMouseEvent): void {
// 		console.log('canvasPosition: ' + evt.canvasPosition)
// 	}
// 	public update(elapsedMsec: number, intervalSec: number): void {
// 		console.log('elapsedMsec: ' + elapsedMsec + ' intervalSec: ' + intervalSec)
// 	}
// 	public render() {
// 		console.log('调用render方法')
// 	}
// }

// let canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
// let app: Application = new ApplicationTest(canvas)

// // tslint:disable-next-line: no-unused-expression
// let app1 = new TestApplication(canvas)

// // app1.testCanvas2DTextLayout()
// // app1.fillPatternRect(10, 10, canvas.width - 10, canvas.height - 10, '../images/test.jpg')
// let image = new Image()

// image.onload = function () {
// 	// app1.drawImage(image, Rectangle.create(0, 0, 256, 192), Rectangle.create(0, 0, app1.width, app1.height), 'repeat', 'transparent')
// }
// image.src = '../images/test.jpg'

// app1.testChangePartCanvasImageData()

// app1.start()

// app1.testFillLocalRectWithTitle()

// app1.testFillLocalRectWithTitleUV()

// function timerCallback(id: number, data: string): void {
// 	console.log('当前调用的Timer的id: ' + id + ' data: ' + data)
// }

// let timer0: number = app.addTimer(timerCallback, 3, true, 'data是timeCallback的数据')
// let timer1: number = app.addTimer(timerCallback, 5, false, 'data是timeCallback的数据')

// app.update(0, 0)
// app.render()

// let startButton: HTMLButtonElement = document.getElementById('start') as HTMLButtonElement
// let stopButton: HTMLButtonElement = document.getElementById('stop') as HTMLButtonElement
// let clearButton: HTMLButtonElement = document.getElementById('clear') as HTMLButtonElement

// startButton.onclick = (ev: MouseEvent): void => {
// 	app.start()
// }
// stopButton.onclick = (ev: MouseEvent): void => {
// 	app.stop()
// 	app.removeTimer(timer1)
// 	console.log(app.timers.length)
// 	let id: number = app.addTimer(timerCallback, 10, true, 'data是timeCallback的数据')
// 	console.log(id === 1)
// }
// clearButton.onclick = (ev: MouseEvent): void => {
// 	app.clearConsole()
// }
