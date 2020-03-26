const array: number[] = [5, 2, 360, 9, 3, 789, 100, 6, 4, 10, 666, 1]
const copyArray: number[] = array.slice(0)

function quickSort(array: number[], startIndex: number, endIndex: number): any {
	if (array.length > 1) {
		let pivotIndex: number = partition(array, startIndex, endIndex)
		if (startIndex < pivotIndex - 1) {
			quickSort(array, startIndex, pivotIndex - 1)
		}
		if (pivotIndex < endIndex) {
			quickSort(array, pivotIndex, endIndex)
		}
	}
}

function partition(array: number[], startIndex: number, endIndex: number): number {
	let pivot: number = array[Math.floor((startIndex + endIndex) / 2)]
	let left: number = startIndex
	let right: number = endIndex

	while (left <= right) {
		while (array[left] < pivot) {
			left++
		}
		while (array[right] > pivot) {
			right--
		}
		;[array[left], array[right]] = [array[right], array[left]]
		left++
		right--
	}
	return left
}

// console.time('quickSort')
// quickSort(copyArray, 0, copyArray.length - 1)
// console.timeEnd('quickSort')

function steinGCD(number1: number = 63, number2: number = 18): number {
	if (number1 === number2) return number1
	if ((number1 & 1) === 0 && (number2 & 1) === 0) {
		return steinGCD(number1 >>> 1, number1 >>> 1) << 1
	} else if ((number1 & 1) === 0 && (number2 & 1) !== 0) {
		return steinGCD(number1 >>> 1, number2)
	} else if ((number1 & 1) !== 0 && (number2 & 1) === 0) {
		return steinGCD(number1, number2 >>> 1)
	} else {
		const maxValue: number = Math.max(number1, number2)
		const minValue: number = Math.min(number1, number2)
		return steinGCD(maxValue - minValue, minValue)
	}
}

console.log(`最大公约数为: ${steinGCD(25, 15)}`)
console.log(copyArray)

function getPrimeNumber(num: number): number[] {
	const prime: boolean[] = []
	for (let i: number = 2; i <= num; i++) {
		// -从最小素数2开始( 1和0既不是素数也不是合数 )
		prime[i] = true
	}
	for (let i: number = 2; i * i <= num; i++) {
		if (prime[i]) {
			// $如果是素数的话，则进行筛选
			for (let j: number = 2 * i; j <= num; j++) {
				// ?筛去合数
				if (!prime[j]) continue
				// &如果j可以被i整除，说明不是素数，变换状态(把2、3、5、7的倍数依次试除，如果可以被整除的话，那么说明不是素数)
				if (j % i === 0) prime[j] = false
			}
		}
	}
	return prime.reduce((result: number[], current: boolean, index: number) => {
		if (index < 2) return
		if (current) result.push(index)
		return result
	}, [])
}

console.log(getPrimeNumber(30))

function countSorting(array: number[]): number[] {
	const maxValue: number = Math.max.apply(null, array)
	const minValue: number = Math.min.apply(null, array)
	const length: number = maxValue - minValue + 1
	const countArray: number[] = new Array(length).fill(0)
	const sortedArray = new Array(array.length)
	for (let i: number = 0; i < array.length; i++) {
		countArray[array[i] - minValue]++
	}
	for (let i: number = 1; i < countArray.length; i++) {
		countArray[i] += countArray[i - 1]
	}
	for (let i: number = array.length - 1; i >= 0; i--) {
		sortedArray[countArray[array[i] - minValue] - 1] = array[i]
		countArray[array[i] - minValue]--
	}
	return sortedArray
}

console.log(countSorting([1, 1, 2, 5, 9, 4, 2, 1, 0]))

// =上浮(最小堆)
function upAdjust(array: number[]): void {
	let childIndex: number = array.length - 1
	let parentIndex: number = Math.floor((childIndex - 1) / 2)
	let temp: number = array[childIndex]
	while (childIndex > 0 && temp < array[parentIndex]) {
		array[childIndex] = array[parentIndex]
		childIndex = parentIndex
		parentIndex = Math.floor((parentIndex - 1) / 2)
	}
	array[childIndex] = temp
}

const upArray: number[] = copyArray.slice(0)
upAdjust(upArray)
console.log(upArray)

// #删除
function deleteHeapElement(array: number[]): void {
	heapSort(array)
	let pileTopIndex: number = 0
	let nMaxIndex: number = array.length - 1
	;[array[pileTopIndex], array[nMaxIndex]] = [array[nMaxIndex], array[pileTopIndex]]
	while (pileTopIndex <= nMaxIndex) {
		let leftChildIndex: number = 2 * pileTopIndex + 1
		let rightChildIndex: number = 2 * pileTopIndex + 2
		let selectIndex = leftChildIndex
		if (rightChildIndex <= nMaxIndex) {
			selectIndex =
				array[leftChildIndex] > array[rightChildIndex] ? rightChildIndex : leftChildIndex
		}
		if (selectIndex < nMaxIndex && array[pileTopIndex] > array[selectIndex]) {
			;[array[pileTopIndex], array[selectIndex]] = [array[selectIndex], array[pileTopIndex]]
		}
		pileTopIndex = selectIndex
	}
}

const heap = [5, 2, 3, 9, 8, 6, 4, 1]
deleteHeapElement(heap)
console.log(heap)

// -下沉
function downAdjust(array: number[], parentIndex: number, length: number): void {
	let temp: number = array[parentIndex]
	let childIndex: number = 2 * parentIndex + 1
	while (childIndex < length) {
		if (childIndex + 1 < length && array[childIndex + 1] > array[childIndex]) {
			childIndex++
		}
		if (temp >= array[childIndex]) break
		array[parentIndex] = array[childIndex]
		parentIndex = childIndex
		childIndex = 2 * childIndex + 1
	}
	array[parentIndex] = temp
}
// ?构建最大堆
function buildMaxHeap(array: number[]): void {
	// $初始化大顶堆，从第一个非叶子结点开始
	// %初始状态 i 为最后叶节点的父节点索引
	// &父节点公式为: (childIndex - 1) / 2，由于array.length是数组的长度，索引lastChildIndex为array.length - 1
	// ?所以父节点的索引值为(array.length - 1 - 1) / 2 = (array.length - 2)/2
	const parentIndex: number = Math.floor((array.length - 2) / 2)
	for (let i: number = parentIndex; i >= 0; i--) {
		downAdjust(array, i, array.length)
	}
	console.log(array)
}
// %升序
function heapSort(array: number[]): void {
	buildMaxHeap(array)
	for (let i: number = array.length - 1; i > 0; i--) {
		;[array[i], array[0]] = [array[0], array[i]]
		downAdjust(array, 0, i)
	}
}

heapSort(copyArray)
console.log(copyArray)

// &描述
function getDescription(year: number, todayDate: Date = new Date()): string {
	const deltaYear: number = getDeltaYear(year, todayDate)
	return deltaYear < 0 ? deltaYear + '年前的今天' : deltaYear + '年后的今天'
}

// #获取相差年，以便区分是在当前年的前后
let getDeltaYear: Function = (year: number, todayDate: Date): number =>
	Math.abs(year - todayDate.getFullYear())

// %处理边界(输入月份大于正常月份，输入天数大于正常天数)
function getNewDate(year: number, month: number, day: number) {
	const days: number[] = [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
	const newYear: number = month > 12 ? year + 1 : year
	const newMonth: number = month > 12 ? month - 12 : month
	const newDay: number = day > days[newMonth - 1] ? day - days[newMonth - 1] : day
	return [newYear, newMonth, newDay]
}

// %是否是闰年
let isLeap: Function = (year: number): boolean =>
	(year % 100 === 0 && year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0)

// &判断未来年和当前年是否是同月同日
let isSameDate: Function = (month: number, day: number, todayDate: Date = new Date()): boolean =>
	month === todayDate.getMonth() && day === todayDate.getDate()

// -获取指定年、月、日是星期几
let getWeek: Function = (year: number, month: number, day: number): number =>
	calcTotalLeapYear(year, month, day) % 7

// ?计算从未来年到公元1年一共经历了多少闰年
let calcTotalLeapYear: Function = (year: number, month: number, day: number): number =>
	year -
	1 +
	Math.floor((year - 1) / 4) -
	Math.floor((year - 1) / 100) +
	Math.floor((year - 1) / 400) +
	getTotalDays(year, month, day)

// =计算未来年当年所经历了总天数(即：假如2030, 2, 10，那么需要计算从2030开始到2030年2月的总天数，结果为31 + 10 = 41天)
function getTotalDays(year: number, month: number, day: number): number {
	let totalDays: number = 0
	for (let i: number = 0; i < month - 1; i++) {
		if (i + 1 !== 2) {
			if ((((i + 1) & 1) === 0 && i + 1 <= 6) || (((i + 1) & 1) !== 0 && i + 1 >= 9)) {
				totalDays += 30
			} else if ((((i + 1) & 1) !== 0 && i + 1 <= 7) || (((i + 1) & 1) === 0 && i + 1 >= 8)) {
				totalDays += 31
			}
		} else {
			isLeap(year) ? (totalDays += 29) : (totalDays += 28)
		}
	}
	totalDays += day
	return totalDays
}

// ?获取某年某月某日是星期几
function getDay(
	year: number,
	month: number = new Date().getMonth() + 1,
	day: number = new Date().getDate()
): string {
	if (year < 0) {
		throw new TypeError(
			'Parameter day exceeds the total number of days in February, please re-enter!'
		)
	}
	const weeks: string[] = ['日', '一', '二', '三', '四', '五', '六']
	const description: string = getDescription(year)
	const [newYear, newMonth, newDay] = getNewDate(year, month, day)
	const result: number = getWeek(newYear, newMonth, newDay)
	return isSameDate(newMonth, newDay)
		? `${description}是星期${weeks[result]}`
		: `${newYear}年${newMonth}月${newDay}日是星期${weeks[result]}`
}

function updateConsole(year: number, month: number, day: number): void {
	const consol: any = console.log
	console.log = function(year: number, month: number, day: number) {
		const style: string = "font-family: '苹方字体'; padding: 2px;"
		consol.call(null, `%c开始计算指定日期是星期几...`, `color: #8B008B; ${style}`)
		const firstTime: number = window.performance.now()
		consol.call(null, `%c计算完毕：${getDay(year, month, day)}`, `color: #000080; ${style}`)
		const lastTime: number = window.performance.now()
		consol.call(null, `%c用时：${lastTime - firstTime}ms`, `color: #4169E1; ${style}`)
	}
	console.log(year, month, day)
}

updateConsole(2020, 2, 23)
