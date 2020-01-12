import { Application } from './application'
import { CanvasKeyBoardEvent } from './event/canvasKeyBoardEvent'
import { CanvasMouseEvent } from './event/canvasMouseEvent'
import { TestApplication } from './testApplication'

class ApplicationTest extends Application {
	protected dispatchKeyDown(evt: CanvasKeyBoardEvent): void {
		console.log('key: ' + evt.key + ' is down')
	}
	protected dispatchMouseDown(evt: CanvasMouseEvent): void {
		console.log('canvasPosition: ' + evt.canvasPosition)
	}
	public update(elapsedMsec: number, intervalSec: number): void {
		console.log('elapsedMsec: ' + elapsedMsec + ' intervalSec: ' + intervalSec)
	}
	public render() {
		console.log('调用render方法')
	}
}

let canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
let app: Application = new ApplicationTest(canvas)

// tslint:disable-next-line: no-unused-expression
let app1 = new TestApplication(canvas)

// app1.strokeGrid()
app1.strokeGrid()
app1.testCanvas2DTextLayout()
// app1.fillPatternRect(10, 10, canvas.width - 10, canvas.height - 10, '../images/test.jpg')

function timerCallback(id: number, data: string): void {
	console.log('当前调用的Timer的id: ' + id + ' data: ' + data)
}

let timer0: number = app.addTimer(timerCallback, 3, true, 'data是timeCallback的数据')
let timer1: number = app.addTimer(timerCallback, 5, false, 'data是timeCallback的数据')

app.update(0, 0)
app.render()

let startButton: HTMLButtonElement = document.getElementById('start') as HTMLButtonElement
let stopButton: HTMLButtonElement = document.getElementById('stop') as HTMLButtonElement
let clearButton: HTMLButtonElement = document.getElementById('clear') as HTMLButtonElement

startButton.onclick = (ev: MouseEvent): void => {
	app.start()
}
stopButton.onclick = (ev: MouseEvent): void => {
	app.stop()
	app.removeTimer(timer1)
	console.log(app.timers.length)
	let id: number = app.addTimer(timerCallback, 10, true, 'data是timeCallback的数据')
	console.log(id === 1)
}
clearButton.onclick = (ev: MouseEvent): void => {
	app.clearConsole()
}
