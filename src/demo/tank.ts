import { TestApplication } from '../core/testApplication'
import { CanvasMouseEvent } from '../core/event/canvasMouseEvent'
import { Math2D } from '../core/math2D'
import { CanvasKeyBoardEvent } from '../core/event/canvasKeyBoardEvent'

export class Tank {
	// #坦克的大小尺寸
	public width: number = 80
	public height: number = 50
	// &坦克的当前位置(默认情况下为[100, 100])
	public x: number = 100
	public y: number = 100
	// *坦克当前的 x 和 y 方向上的缩放系数(默认情况下为1.0)
	public scaleX: number = 1.0
	public scaleY: number = 1.0
	// ?坦克当前的旋转角度
	public tankRotation: number = 0 // $整个坦克的旋转角度，弧度表示
	public turretRotation: number = 0 // $灯塔的旋转角度，弧度表示
	// -在Tank类中增加一个成员变量，用来标示Tank初始化时是否朝着 y 轴正方向
	public initYAxis: boolean = true
	public showLine: boolean = true // =是否显示坦克原点与画布中心点和目标点之间的连线
	public showCoords: boolean = false // ?是否显示坦克本身的局部坐标系
	public gunLength: number = Math.max(this.width, this.height) // &炮管长度(默认情况下，等于坦克的width和height中最大的一个数值)
	public gunMuzzleRadius: number = 5
	public targetX: number = 0
	public targetY: number = 0
	public linearSpeed: number = 100.0
	public turretRotateSpeed: number = Math2D.toRadian(2)

	public drawTank(app: TestApplication): void {
		// !绘制坦克
		app.context2D.save()
		// =整个坦克移动和旋转，注意局部变换的经典结合顺序(trs: translate -> rotate -> scale)
		app.context2D.translate(this.x, this.y)
		app.context2D.rotate(this.initYAxis ? this.tankRotation - Math.PI * 0.5 : this.tankRotation)
		app.context2D.scale(this.scaleX, this.scaleY)
		// &绘制坦克的底盘(矩形)
		app.context2D.save()
		app.context2D.fillStyle = 'grey'
		app.context2D.beginPath()

		if (this.initYAxis) {
			// -交换width和height
			app.context2D.rect(-this.height * 0.5, -this.width * 0.5, this.height, this.width)
		} else {
			// =默认朝向
			app.context2D.rect(-this.width * 0.5, -this.height * 0.5, this.width, this.height)
		}

		app.context2D.fill()
		app.context2D.restore()
		// %绘制炮塔 turret
		app.context2D.save()
		app.context2D.rotate(this.turretRotation)
		// ?椭圆炮塔
		app.context2D.fillStyle = 'red'
		app.context2D.beginPath()

		if (this.initYAxis) {
			// #当朝着 Y 轴正方向时，椭圆的radiusX < radiusY
			app.context2D.ellipse(0, 0, 10, 15, 0, 0, Math.PI * 2) // ?绘制椭圆
		} else {
			// %当朝着 X 轴正方向时，椭圆的radiusX > radiusY
			app.context2D.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2) // ?绘制椭圆
		}

		app.context2D.fill()
		// &炮管
		app.context2D.strokeStyle = 'blue'
		app.context2D.lineWidth = 5
		app.context2D.lineCap = 'round'
		app.context2D.beginPath()
		app.context2D.moveTo(0, 0)

		if (this.initYAxis) {
			// *当朝着 Y 轴正方向时，炮管时沿着 Y 轴正方向绘制的
			app.context2D.lineTo(0, this.gunLength)
		} else {
			// ?当朝着 X 轴正方向时，炮管是沿着 X 轴正方向绘制的
			app.context2D.lineTo(this.gunLength, 0)
		}

		app.context2D.stroke()
		// =炮口，先将局部坐标系从当前的方向，向 X 轴的正方向平移gunMuzzleRadius(数值类型的变量，以像素为单位，表示炮管的长度)个像素，此时局部坐标系在炮管最右侧
		// #然后再从当前的坐标系向 X 轴的正方向平移gunMuzzleRadius(数值类型的变量，以像素为单位，表示炮管的半径)个像素，这样炮口的外切圆正好和炮管相接触

		if (this.initYAxis) {
			// &当朝着 Y 轴正方向时，炮口时沿着 Y 轴正方向绘制的
			app.context2D.translate(0, this.gunLength)
			app.context2D.translate(0, this.gunMuzzleRadius)
		} else {
			// %当朝着 X 轴正方向时，炮口时沿着 X 轴正方向绘制的
			app.context2D.translate(this.gunLength, 0)
			app.context2D.translate(this.gunMuzzleRadius, 0)
		}

		// %调用自己实现的fillCircle方法，内部使用Canvas2D arc绘制圆弧方法
		app.fillCircle(0, 0, 5, 'black')
		app.context2D.restore()
		// *绘制一个圆球，标记坦克正方向，一旦炮管旋转后，可以知道正前方在哪里
		app.context2D.save()

		if (this.initYAxis) {
			// #当朝着 Y 轴正方向时。标记坦克前方的圆球是沿着 Y 轴正方向绘制的
			app.context2D.translate(0, this.height * 0.5)
		} else {
			// -当朝着 X 轴正方向时。标记坦克前方的圆球是沿着 X 轴正方向绘制的
			app.context2D.translate(this.width * 0.5, 0)
		}

		app.fillCircle(0, 0, 10, 'green')
		app.context2D.restore()
		// ?坐标系是跟随整个坦克的
		if (this.showCoords) {
			app.context2D.save()
			app.context2D.lineWidth = 1
			app.strokeCoordinate(0, 0, this.width * 1.2, this.height * 1.2)
			app.context2D.restore()
		}
		app.context2D.restore()

		if (!this.showLine) return // !如果设置不显示线的话，直接退出

		app.context2D.save()
		// $绘制坦克原点到画布中心的连线
		app.strokeLine(this.x, this.y, app.canvas.width * 0.5, app.canvas.height * 0.5)
		// %绘制坦克原点到目标点(鼠标指针位置)的连线
		app.strokeLine(this.x, this.y, this.targetX, this.targetY)
		app.context2D.restore()
	}
	// $坦克跟着鼠标进行旋转
	private _lootAt(): void {
		const diffX: number = this.targetX - this.x
		const diffY: number = this.targetY - this.y
		/**
		 * &atan2 方法返回一个 -pi 到 pi 之间的数值，表示点 (x, y) 对应的偏移角度。
		 * ?这是一个逆时针角度，以弧度为单位，正X轴和点 (x, y) 与原点连线 之间。
		 * $注意此函数接受的参数：先传递 y 坐标，然后是 x 坐标。
		 */
		const radian: number = Math.atan2(diffY, diffX)
		this.tankRotation = radian
	}
	public onMouseMove(evt: CanvasMouseEvent): void {
		this.targetX = evt.canvasPosition.x
		this.targetY = evt.canvasPosition.y
		this._lootAt()
	}
	// &坦克朝着鼠标移动
	private _moveTowardTo(intervalSec: number): void {
		// -将鼠标点的 X 和 Y 变换到相对坦克坐标系原点的表示
		const diffX: number = this.targetX - this.x
		const diffY: number = this.targetY - this.y
		// =currentWalkingDistance的单位是: 像素 / 秒
		const currentWalkingDistance: number = this.linearSpeed * intervalSec // ?根据时间差计算出当前的运行距离
		const totalDistance: number = Math.sqrt(diffX * diffX + diffY * diffY)
		/**
		 * %关键点1：判断坦克是否是停止运动
		 * #如果坦克当前移动的距离小于总距离，说明还没到达目的地，可以继续刷新坦克的位置
		 */
		if (currentWalkingDistance < totalDistance) {
			// $关键点2：使用sin和cos函数计算斜向运行时 x 、Y 分量
			this.x = this.x + Math.cos(this.tankRotation) * currentWalkingDistance
			this.y = this.y + Math.sin(this.tankRotation) * currentWalkingDistance
		}
	}
	// ?更新坦克位置
	public update(intervalSec: number): void {
		this._moveTowardTo(intervalSec)
	}
	public onKeyPress(evt: CanvasKeyBoardEvent): void {
		if (evt.key === 'r') {
			this.turretRotation += this.turretRotateSpeed
		} else if (evt.key === 't') {
			this.turretRotation = 0
		} else if (evt.key === 'e') {
			this.turretRotation -= this.turretRotateSpeed
		}
	}
}
