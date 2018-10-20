A simple plugin to build [spritezero](https://github.com/mapbox/spritezero) sprites from webpack.

Not especially complete or robust but it does the job.

Usage:

```js

const SpritezeroWebpackPlugin = require('spritezero-webpack-plugin');
```
...
```js
  plugins: [
	new SpritezeroWebpackPlugin({
		source: 'sprites/*.svg'
		output: 'style/'
	})
   ]
```
