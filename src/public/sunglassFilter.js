self.onmessage = function(event) {
	const imageData = event.data
	const data = imageData.data
	const length = data.length
	const width = data.width
	for (let i = 0; i < length; i++) {
		if ((i + 1) % 4 !== 0) {
			if ((i + 4) % (width * 4) === 0) {
				data[i] = data[i - 4]
				data[i + 1] = data[i - 3]
				data[i + 2] = data[i - 2]
				data[i + 3] = data[i - 1]
				i += 4
			} else {
				data[i] = 2 * data[i] - data[i + 4] - 0.5 * data[i + 4]
			}
		}
	}
	self.postMessage(imageData)
}
