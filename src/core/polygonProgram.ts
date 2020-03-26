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

let drawingSurfaceImagedata: ImageData // ?绘制表面图像数据

const mousedown: { x: number; y: number } = { x: 0, y: 0 } // $鼠标信息
const rubberBandRect: { width: number; height: number; left: number; top: number } = {
	// *橡皮筋矩形信息
	width: 0,
	height: 0,
	left: 0,
	top: 0
}

let dragging: any // %移动标志位
let draggingOffsetX: undefined | number // #移动偏移X轴
let draggingOffsetY: undefined | number // #移动偏移Y轴
let sides: string = sidesSelect.value // $默认八边形
let startAngle: string = startAngleSelect.value // ?开始角度
let isReticle: boolean = true // %十字线
let isEditing: boolean = false // &是否处于编辑模式

const polygons: Array<any> = [] // =图形储存器

// $Functions
// &画网格
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

// #转换canvas坐标
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

// %保存canvas当前画的图形
function saveDrawingSurface(context: CanvasRenderingContext2D = ctx): void {
	const { width, height } = context.canvas
	drawingSurfaceImagedata = context.getImageData(0, 0, width, height)
}

// -恢复canvas之前画的图形
function restoreDrawingSurface(context: CanvasRenderingContext2D = ctx): void {
	context.putImageData(drawingSurfaceImagedata, 0, 0)
}

// &Draw a polygon
// =绘制一个多边形
function drawPolygon(polygon: any, context: CanvasRenderingContext2D = ctx): void {
	context.save()
	context.beginPath()
	polygon.createPath(context)
	polygon.stroke(context)
	if (fillCheckbox.checked) polygon.fill(context)
	context.restore()
}

// ?rubber bands
// *记录多边形信息
function updateRubberBandRectangle(loc: { x: number; y: number }): void {
	rubberBandRect.width = Math.abs(loc.x - mousedown.x)
	rubberBandRect.height = Math.abs(loc.x - mousedown.y)
	rubberBandRect.left = Math.min(loc.x, mousedown.x)
	rubberBandRect.top = Math.min(loc.y, mousedown.y)
}

// &绘制
function drawRubberBandShape(
	sides: string,
	startAngle: string,
	context: CanvasRenderingContext2D = ctx
): void {
	let polygon: Polygon = new Polygon(
		mousedown.x, // ?鼠标按下的X轴坐标点
		mousedown.y, // %鼠标按下的Y轴坐标点
		rubberBandRect.width, // &默认以X轴差值为半径
		parseInt(sides, 10), // #多边形的边数(默认0度)
		(parseInt(startAngle, 10) * Math.PI) / 180, // -起始角度
		context.strokeStyle, // =描边颜色
		context.fillStyle, // *填充颜色
		fillCheckbox.checked // !是否填充
	)
	drawPolygon(polygon) // &绘制多边形
	// #如果不是编辑模式下，那么把当前图形推送到图形储存器中.(当需要恢复canvas之前的所有图形时，只需遍历即可)
	if (!dragging) polygons.push(polygon)
}

// $更新按下鼠标信息和多边形
function updateRubberBand(loc: { x: number; y: number }, sides: string, startAngle: string): void {
	updateRubberBandRectangle(loc)
	drawRubberBandShape(sides, startAngle)
}

// =Reticle
// $绘制坐标横线(十字线)
function drawHorizontalLine(y: number, context: CanvasRenderingContext2D = ctx): void {
	context.beginPath()
	context.moveTo(0, y + 0.5)
	context.lineTo(context.canvas.width, y + 0.5)
	context.stroke()
}

// %绘制坐标竖线
function drawVerticalLine(x: number, context: CanvasRenderingContext2D = ctx): void {
	context.beginPath()
	context.moveTo(x + 0.5, 0)
	context.lineTo(x + 0.5, context.canvas.height)
	context.stroke()
}

// ?绘制十字线
function drawReticle(x: number, y: number, context: CanvasRenderingContext2D = ctx): void {
	context.save()
	context.strokeStyle = 'rgba(0, 0, 230, 0.4)'
	context.lineWidth = 0.5
	drawVerticalLine(x)
	drawHorizontalLine(y)
	context.restore()
}

// #从图形储存器中依次取出之前的所有绘制的图形
function drawPolygons(): void {
	polygons.forEach((polygon: Polygon) => {
		drawPolygon(polygon)
	})
}

// %Dragging
// *开始绘制(绘制模式下)
function startDragging(loc: { x: number; y: number }): void {
	saveDrawingSurface()
	mousedown.x = loc.x
	mousedown.y = loc.y
}

// &初始化编辑模式
function startEditing(): void {
	canvas.style.cursor = 'pointer'
	isEditing = true
}

// #取消编辑模式
function stopEditing(): void {
	canvas.style.cursor = 'crosshair'
	isEditing = false
}

// !Event handlers
canvas.onmousedown = function(e: Event) {
	// %Initialization
	ctx.strokeStyle = strokeStyleSelect.value
	ctx.fillStyle = fillStyleSelect.value

	startAngleSelect.blur()

	const loc: { x: number; y: number } = windowToCanvas(
		canvas,
		(e as any).clientX,
		(e as any).clientY
	)

	e.preventDefault()
	if (isEditing) {
		// ?如果是编辑模式下，那么就需要把之前的绘图信息取出来
		polygons.forEach((polygon: Polygon) => {
			polygon.createPath(ctx)
			if (ctx.isPointInPath(loc.x, loc.y)) {
				startDragging(loc)
				dragging = polygon
				draggingOffsetX = loc.x - polygon.x // *计算编辑的多边形在X轴上移动了多少
				draggingOffsetY = loc.y - polygon.y // !计算编辑的多边形在X轴上移动了多少
				return
			}
		})
	} else {
		// %不是编辑模式，那么就是单纯的绘制图形(当绘制图形时dragging = true)
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
	if (isEditing && dragging) {
		// &说明有图形并且又在编辑模式下
		dragging.x = loc.x - draggingOffsetX
		dragging.y = loc.y - draggingOffsetY
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		drawGrid()
		drawPolygons()
	} else {
		if (dragging) {
			restoreDrawingSurface() // %恢复canvas之前画的图形(不排除有点击过eraseAllButton按钮的情况)
			updateRubberBand(loc, sides, startAngle) // $绘制并且更新多边形信息(半径以及坐标)
			if (isReticle) {
				drawReticle(mousedown.x, mousedown.y)
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
	if (!isEditing) {
		restoreDrawingSurface()
		updateRubberBand(loc, sides, startAngle)
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
	if (editCheckbox.checked) startEditing()
	else stopEditing()
}
sidesSelect.onchange = function(e: Event) {
	sides = sidesSelect.value
}
startAngleSelect.onchange = function(e: Event) {
	startAngle = startAngleSelect.value
}

// ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
// ctx.shadowOffsetX = 2
// ctx.shadowOffsetY = 2
// ctx.shadowBlur = 4

drawGrid()
