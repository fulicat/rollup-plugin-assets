

> build assets

> version: 1.0.0

## Installation

### Node.js

`rollup-plugin-assets` is available on  [yarn](https://yarnpkg.com) or  [npm](http://npmjs.org).

    $ yarn rollup-plugin-assets --dev
    
    $ npm install rollup-plugin-assets -D

## Usage

### 1.  vite.config.js

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import RollupPluginAssets from 'rollup-plugin-assets'

export default defineConfig({
    build: {
        assetsDir: 'assets/v1.3.2',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    return 'index' // single file
                }
            }
        }
    },
    plugins: [
        vue(),
        RollupPluginAssets()
    ]
});
```



### 2.  vite.config.js

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import RollupPluginAssets from 'rollup-plugin-assets'

export default defineConfig({
    build: {
        assetsDir: 'assets/v1.3.2'
    },
    plugins: [
        vue(),
        RollupPluginAssets({
            js: {
                type: 'module'
            }
        })
    ]
});
```

### 

### 3.  vite.config.js

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import RollupPluginAssets from 'rollup-plugin-assets'

export default defineConfig({
    build: {
        assetsDir: 'assets/v1.3.2',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    return 'index' // single file
                }
            }
        }
    },
    plugins: [
        vue(),
        RollupPluginAssets({
            apply: 'build', // or 'serve'
            base: '', // config.base (publicPath: /)
            outDir: '', // config.build.outDir (dist)
            emptyOutDir: undefined, // empty outDir
            assetsDir: '', // config.build.assetsDir (assets)
            include: /(.js|.css)$/, // fileType
            fileName: 'assets.js', // fileName (assets.js | assets.json)
            template: true, // true (use default template) || custom template string (function() {})
            queue: false, // queue loading
            autoLoad: true, // with assets loader (only javascript file)
            loader: true, // true (use default loader) || custom loader (function() {})
            sort: true, // sort all assets (true | 'all')
            externals: [], // external assets files
            js: {
                // async: true,
                charset: 'utf-8',
                // crossorigin: true,
                // defer: true,
                // type: 'module'
            },
            css: {
                rel: 'stylesheet',
                type: 'text/css'
            },
            autoSave: true, // auto save assets file
            when: 'writeBundle', // rollup lifecycle of writeBundle | generateBundle
            done: (config, bundle, result, plugins) => {
                // console.log(result.content)
            }
        })
    ]
});
```

### 




## Result

### assets.js

```js
(function(){var assets=["base/v1.3.2/index.fab03e37.css","base/v1.3.2/index.d76d33bc.js"];var base = '/';(function(assets, base, options) {options = Object.assign({}, options);if (!String.prototype.startsWith) {String.prototype.startsWith = function(searchString, position) {position = position || 0;return this.indexOf(searchString, position) === position;}}if (!String.prototype.endsWith) {String.prototype.endsWith = function(suffix) {return this.indexOf(suffix, this.length - suffix.length) !== -1;}}function loadResource(src, basePath, callback) {basePath = basePath || '';callback = (typeof(callback)==='function' ? callback : function(){});if (src) {var opts = { src: '' };if (typeof(src) === 'string') {opts.src = src;}if (typeof(src) === 'object') {opts = Object.assign({}, opts, src);}var realSrc = opts.src.startsWith('#') ? opts.src.substr(1) : opts.src;realSrc = realSrc.indexOf('?') > 1 ? realSrc.split('?')[0] : realSrc;if (realSrc.startsWith('https://') || realSrc.startsWith('http://') || realSrc.startsWith('//')) {basePath = '';}var type = realSrc.endsWith('.js') ? 'script' : (realSrc.endsWith('.css') ? 'link' : '');if (realSrc && type) {var element = document.createElement(type);if(type === 'script'){opts = Object.assign({}, options.js, opts);if (opts && typeof(opts) === 'object') {if (opts.async) {element.setAttribute('async', '');}if (opts.charset) {element.setAttribute('charset', opts.charset);}if (opts.crossorigin) {element.setAttribute('crossorigin', '');}if (opts.defer) {element.setAttribute('defer', '');}if (opts.type !== undefined && opts.type !== false && !opts.src.startsWith('#')) {element.setAttribute('type', opts.type);}}element.onerror = function() {console.error('Load failed: '+ opts.src);};element.onload = element.onreadystatechange = function() {if (!this.readyState || this.readyState === 'complete') {callback();}};if (opts.src.startsWith('#')) {opts.src = opts.src.substr(1);}element.src = basePath + opts.src;}if (type=='link') {opts = Object.assign({}, options.css, opts);if (opts && typeof(opts) === 'object') {if (opts.type) {element.setAttribute('type', opts.type);}if (opts.rel) {element.setAttribute('rel', opts.rel);}}if (opts.src.startsWith('#')) {opts.src = opts.src.substr(1);}element.href = basePath + opts.src;callback();}document.head.appendChild(element);}}}function parseObjectToArray(_assets){var result = [];Object.keys(_assets).forEach(function(chunk) {if (typeof(_assets[chunk]) === 'string') {result.push(_assets[chunk]);} else if (typeof(_assets[chunk]) === 'object') {if (assets.length) {_assets[chunk].forEach(function(_chunk) {result.push(_chunk);});} else {Object.keys(_assets[chunk]).forEach(function(_chunk) {result.push(_assets[chunk][_chunk]);});}}});return result;}function loadResourceQueue(_assets, basePath) {var url = _assets[0];_assets.splice(0, 1);if (url) {loadResource(url, basePath, function() {loadResourceQueue(_assets, basePath);});}}if (typeof(assets) === 'object') {if (assets.length === undefined) {assets = parseObjectToArray(assets);}if (assets.length) {if (options.queue) {assets = JSON.parse(JSON.stringify(assets));loadResourceQueue(assets, base);} else {assets.forEach(function(chunk) {loadResource(chunk, base);});}}}})(assets, base, {"queue":false,"js":{"charset":"utf-8","type":"module"},"css":{"rel":"stylesheet","type":"text/css"}});})();
```




## License

(The MIT License)

Copyright (c) 2013 Jack.Chan <fulicat@qq.com> (http://fulicat.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.