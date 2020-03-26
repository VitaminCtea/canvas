const el: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement
const ctx: CanvasRenderingContext2D = el.getContext('2d')
const image: HTMLImageElement = new Image()
const filterContainer: HTMLElement = document.getElementById('filterContainer')
const defaultValue: string = 'default'

class Filter {
	static sunglassFilter: Worker = new Worker('./sunglassFilter.js')
	static getImageData(): {
		imageData: ImageData
		data: Uint8ClampedArray
		length: number
		width: number
		height: number
	} {
		/**
		 * %根据行、列读取某像素点的R/G/B/A值的公式：
		 * &imageData.data[((行数-1) * imageData.width + (列数-1)) * 4 - 1 + 1/2/3/4]
		 * $1/2/3/4: 代表R/G/B/A
		 */
		const imageData: ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		const data: Uint8ClampedArray = imageData.data
		const length: number = data.length // %length = 4 * width * height
		const width: number = imageData.width
		const height: number = imageData.height
		return {
			imageData,
			data,
			length,
			width,
			height
		}
	}
	static negativeFilters(): void {
		// &负片滤镜
		const { imageData, data, length } = Filter.getImageData()

		for (let i: number = 0; i <= length - 4; i += 4) {
			data[i] = 255 - data[i]
			data[i + 1] = 255 - data[i + 1]
			data[i + 2] = 255 - data[i + 2]
		}
		ctx.putImageData(imageData, 0, 0)
	}
	static blackAndWhiteFilters(): void {
		// %黑白滤镜
		const { imageData, data, length } = Filter.getImageData()

		for (let i: number = 0; i < length - 4; i += 4) {
			const average: number = (data[i] + data[i + 1] + data[i + 2]) / 3
			data[i] = average
			data[i + 1] = average
			data[i + 2] = average
		}
		ctx.putImageData(imageData, 0, 0)
	}
	static embossFilters(): void {
		const { imageData, data, length, width } = Filter.getImageData()
		for (let i: number = 0; i < length; i++) {
			// $遍历每个像素
			if (i <= length - 4 * width) {
				// &如果我们不超出数组的边界
				if ((i + 1) % 4 !== 0) {
					// %如果不是透明度
					if ((i + 4) % (4 * width) === 0) {
						// -如果它是行中的最后一个像素，则右边没有像素，因此复制前面的像素值
						data[i] = data[i - 4]
						data[i + 1] = data[i - 3]
						data[i + 2] = data[i - 2]
						data[i + 3] = data[i - 1]
						i += 4
					} else {
						// =不是行中的最后一个像素
						data[i] = 128 + 2 * data[i] - data[i + 4] - data[i + 4 * width]
					}
				}
			} else {
				// !最后一行，下面没有像素，所以复制上面的像素
				if ((i + 1) % 4 !== 0) {
					data[i] = data[i - 4 * width]
				}
			}
		}
		ctx.putImageData(imageData, 0, 0)
	}
	static sunglassesFilters() {
		Filter.sunglassFilter.postMessage(ctx.getImageData(0, 0, canvas.width, canvas.height))
		Filter.sunglassFilter.onmessage = function(event) {
			ctx.putImageData(event.data, 0, 0)
		}
	}
}

let saveImageData: ImageData
function saveCanvasPixels(context: CanvasRenderingContext2D = ctx) {
	saveImageData = context.getImageData(0, 0, canvas.width, canvas.height)
}

function restoreCanvasPixels(saveImageData: ImageData, context: CanvasRenderingContext2D = ctx) {
	context.putImageData(saveImageData, 0, 0)
}

function drawImage(image: HTMLImageElement, context: CanvasRenderingContext2D = ctx) {
	context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height)
}

image.onload = function() {
	drawImage(image)
	saveCanvasPixels()
}

image.src = '../countryImage.jpg'

filterContainer.onchange = function(event: Event) {
	const val: string = (event as any).target.value
	if (val === defaultValue) {
		restoreCanvasPixels(saveImageData)
		return
	}
	restoreCanvasPixels(saveImageData)
	Filter[`${val + 'Filters'}`]()
}
