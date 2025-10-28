// frontend/craco.config.js
module.exports = {
	webpack: {
		resolve: {
			fallback: {
				path: false,
				crypto: require.resolve("crypto-browserify"),
				fs: false,
			},
		},
	},
};
