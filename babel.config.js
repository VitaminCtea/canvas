module.exports = function(api) {
	api.cache(true)
	const presets = [
		[
			'@babel/preset-env',
			{
				useBuiltIns: 'usage'
			}
		],
		'@babel/preset-typescript'
	]
	const plugins = [
        '@babel/plugin-transform-arrow-functions',
        '@babel/plugin-transform-runtime',
		'@babel/plugin-transform-typescript',
    ]

	return {
		presets,
		plugins
	}
}
