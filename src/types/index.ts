export interface EventListenerObject {
	handleEvent(evt: Event): void
}

export interface TimerCallback {
	(id: number, data: any): void
}

export type Repeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'

export namespace Font {
	export type TextAlign = 'start' | 'left' | 'center' | 'right' | 'end'
	export type TextBaseLine = 'alphabetic' | 'hanging' | 'top' | 'middle' | 'bottom'
	export type FontType = '10px sans-serif' | '15px sans-serif' | '20px sans-serif'
}

export enum ETextLayout {
	LEFT_TOP,
	RIGHT_TOP,
	RIGHT_BOTTOM,
	LEFT_BOTTOM,
	CENTER_MIDDLE,
	CENTER_TOP,
	RIGHT_MIDDLE,
	CENTER_BOTTOM,
	LEFT_MIDDLE
}
