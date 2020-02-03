import { getDomId } from '../helper/getDom'
import { Polygon } from './polygon'

const canvas: HTMLCanvasElement = getDomId('canvas') as HTMLCanvasElement
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')
const eraseAllButton: HTMLButtonElement = getDomId('eraseAllButton') as HTMLButtonElement
const strokeStyleSelect: HTMLSelectElement = getDomId('strokeStyleSelect') as HTMLSelectElement
const fillStyleSelect: HTMLSelectElement = getDomId('fillStyleSelect') as HTMLSelectElement
const fillCheckbox: HTMLInputElement = getDomId('fillCheckbox') as HTMLInputElement
const editCheckbox: HTMLInputElement = getDomId('editCheckbox') as HTMLInputElement
const sidesSelect: HTMLSelectElement = getDomId('sidesSelect') as HTMLSelectElement
const startAngleSelect: HTMLInputElement = getDomId('startAngleSelect') as HTMLInputElement

let drawingSurfaceImagedata: ImageData

const mousedown: { x: number; y: number } = { x: 0, y: 0 }
const rubberbandRect: { width: number; height: number; left: number; top: number } = {
	width: 0,
	height: 0,
	left: 0,
	top: 0
}

let dragging: any
let draggingOffsetX: undefined | number
let draggingOffsetY: undefined | number
let sides: number = 8
let startAngle: number = 0
let guidewires: boolean = true
let editing: boolean = false

const polygons: Array<any> = []

// $Functions
export function drawGrid(
	context: CanvasRenderingContext2D = ctx,
	color: string = 'lightgray',
	stepX: number = 10,
	stepY: number = 10
): void {
	const width: number = canvas.width
	const height: number = canvas.height
	context.strokeStyle = color
	context.lineWidth = 0.5

	for (let i: number = stepX + 0.5; i < width; i += stepX) {
		context.beginPath()
		context.moveTo(i, 0)
		context.lineTo(i, height)
		context.stroke()
	}

	for (let i: number = stepY + 0.5; i < height; i += stepY) {
		context.beginPath()
		context.moveTo(0, i)
		context.lineTo(width, i)
		context.stroke()
	}
}

function windowToCanvas(
	el: HTMLCanvasElement = canvas,
	x: number,
	y: number
): { x: number; y: number } {
	const box: ClientRect = el.getBoundingClientRect()
	return {
		x: x - box.left * (el.width / box.width),
		y: y - box.top * (el.height / box.height)
	}
}

function saveDrawingSurface(context: CanvasRenderingContext2D = ctx): void {
	const { width, height } = context.canvas
	drawingSurfaceImagedata = context.getImageData(0, 0, width, height)
}

function restoreDrawingSurface(context: CanvasRenderingContext2D = ctx): void {
	context.putImageData(drawingSurfaceImagedata, 0, 0)
}

// &Draw a polygon
function drawPolygon(polygon: any, context: CanvasRenderingContext2D = ctx): void {
	context.beginPath()
	polygon.createPath(context)
	polygon.stroke(context)
	if (fillCheckbox.checked) polygon.fill(context)
}

// ?rubber bands
function updateRubberbandRectangle(loc: { x: number; y: number }): void {
	rubberbandRect.width = Math.abs(loc.x - mousedown.x)
	rubberbandRect.height = Math.abs(loc.x - mousedown.y)
	rubberbandRect.left = Math.min(loc.x, mousedown.x)
	rubberbandRect.top = Math.min(loc.y, mousedown.y)
}

function drawRubberbandShape(
	loc: { x: number; y: number },
	sides: number,
	startAngle: number,
	context: CanvasRenderingContext2D = ctx
): void {
	let polygon: Polygon = new Polygon(
		mousedown.x,
		mousedown.y,
		rubberbandRect.width,
		parseInt(sidesSelect.value, 10),
		(parseInt(startAngleSelect.value, 10) * Math.PI) / 180,
		context.strokeStyle,
		context.fillStyle,
		fillCheckbox.checked
	)
	drawPolygon(polygon)

	if (!dragging) polygons.push(polygon)
}

function updateRubberband(loc: { x: number; y: number }, sides: number, startAngle: number): void {
	updateRubberbandRectangle(loc)
	drawRubberbandShape(loc, sides, startAngle)
}

// =Guidewires
function drawHorizontalLine(y: number, context: CanvasRenderingContext2D = ctx): void {
	context.beginPath()
	context.moveTo(0, y + 0.5)
	context.lineTo(context.canvas.width, y + 0.5)
	context.stroke()
}

function drawVerticalLine(x: number, context: CanvasRenderingContext2D = ctx): void {
	context.beginPath()
	context.moveTo(x + 0.5, 0)
	context.lineTo(x + 0.5, context.canvas.height)
	context.stroke()
}

function drawGuidewires(x: number, y: number, context: CanvasRenderingContext2D = ctx): void {
	context.save()
	context.strokeStyle = 'rgba(0, 0, 230, 0.4)'
	context.lineWidth = 0.5
	drawVerticalLine(x)
	drawHorizontalLine(y)
	context.restore()
}

function drawPolygons(): void {
	polygons.forEach((polygon: Polygon) => {
		drawPolygon(polygon)
	})
}

// %Dragging
function startDragging(loc: { x: number; y: number }): void {
	saveDrawingSurface()
	mousedown.x = loc.x
	mousedown.y = loc.y
}

function starrEditing(): void {
	canvas.style.cursor = 'pointer'
	editing = true
}

function stopEditing(): void {
	canvas.style.cursor = 'crosshair'
	editing = false
}

// !Event handlers
canvas.onmousedown = function(e: Event) {
	const loc: { x: number; y: number } = windowToCanvas(
		canvas,
		(e as any).clientX,
		(e as any).clientY
	)

	e.preventDefault()
	if (editing) {
		polygons.forEach((polygon: Polygon) => {
			polygon.createPath(ctx)
			if (ctx.isPointInPath(loc.x, loc.y)) {
				startDragging(loc)
				dragging = polygon
				draggingOffsetX = loc.x - polygon.x
				draggingOffsetY = loc.y - polygon.y
				return
			}
		})
	} else {
		startDragging(loc)
		dragging = true
	}
}

canvas.onmousemove = function(e: Event) {
	const loc: { x: number; y: number } = windowToCanvas(
		canvas,
		(e as any).clientX,
		(e as any).clientY
	)

	e.preventDefault()
	if (editing && dragging) {
		dragging.x = loc.x - draggingOffsetX
		dragging.y = loc.y - draggingOffsetY
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		drawGrid()
		drawPolygons()
	} else {
		if (dragging) {
			restoreDrawingSurface()
			updateRubberband(loc, sides, startAngle)
			if (guidewires) {
				drawGuidewires(mousedown.x, mousedown.y)
			}
		}
	}
}

canvas.onmouseup = function(e: Event) {
	const loc: { x: number; y: number } = windowToCanvas(
		canvas,
		(e as any).clientX,
		(e as any).clientY
	)

	dragging = false
	if (!editing) {
		restoreDrawingSurface()
		updateRubberband(loc, sides, startAngle)
	}
}

eraseAllButton.onclick = function(e: Event) {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawGrid()
	saveDrawingSurface()
}

strokeStyleSelect.onchange = function(e: Event) {
	ctx.strokeStyle = strokeStyleSelect.value
}

fillStyleSelect.onchange = function(e: Event) {
	ctx.fillStyle = fillStyleSelect.value
}

editCheckbox.onchange = function(e: Event) {
	if (editCheckbox.checked) starrEditing()
	else stopEditing()
}

// %Initialization
// ctx.strokeStyle = strokeStyleSelect.value
// ctx.fillStyle = fillStyleSelect.value

// ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
// ctx.shadowOffsetX = 2
// ctx.shadowOffsetY = 2
// ctx.shadowBlur = 4

drawGrid()
