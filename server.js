const webpack = require('webpack')
const express = require('express')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const path = require('path')

const app = express()
const webpackConfig = require('./webpack.config')
const compiler = webpack(webpackConfig)
const port = 1234

app.use(
	webpackDevMiddleware(compiler, {
		noInfo: true,
		publicPath: webpackConfig.output.publicPath
	})
)

app.use(
	webpackHotMiddleware(compiler, {
		log: false,
		heartbeat: 2000
	})
)

app.use(express.static(path.join(__dirname, './src/public')))

app.listen(port, function() {
	console.log(`Calendar app listening on port ${port}!`)
})
