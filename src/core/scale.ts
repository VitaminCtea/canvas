const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')
const text = 'Spinning'
const angle = Math.PI / 45
let clockwise = true
const fontHeight = 128
const originCoordinates = { x: 0, y: 0 }
let paused = true
let scale = 1.008

// Functions......................................................

function drawText() {
	context.fillText(text, 0, 0)
	context.strokeText(text, 0, 0)
}

// Event handlers.................................................

canvas.onclick = function() {
	paused = !paused
	if (!paused) {
		clockwise = !clockwise
		scale = 1 / scale
	}
}

// Animation......................................................

setInterval(function() {
	if (!paused) {
		context.clearRect(-originCoordinates.x, -originCoordinates.y, canvas.width, canvas.height)

		context.rotate(clockwise ? angle : -angle)
		context.scale(scale, scale)

		drawText()
	}
}, 1000 / 60)

// Initialization.................................................

context.font = fontHeight + 'px Palatino'

context.fillStyle = 'cornflowerblue'
context.strokeStyle = 'yellow'

context.shadowColor = 'rgba(100, 100, 150, 0.8)'
context.shadowOffsetX = 5
context.shadowOffsetY = 5
context.shadowBlur = 10

context.textAlign = 'center'
context.textBaseline = 'middle'

originCoordinates.x = canvas.width / 2
originCoordinates.y = canvas.height / 2

context.transform(1, 0, 0.5, 1, originCoordinates.x, originCoordinates.y)

drawText()
