import { TimerCallback } from '../types'

export class Timer {
	public id: number = -1
	public enabled: boolean = false
	public callback: TimerCallback
	public callbackData: any = undefined
	public timeout: number = 0
	public countDown: number = 0
	public onlyOnce: boolean = false
	constructor(callback: TimerCallback) {
		this.callback = callback
	}
}
