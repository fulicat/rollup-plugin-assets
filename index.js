/*
* rollup-plugin-assets
* @Author: Jack.Chan
* @website: https://fulicat.com
* @github: https://github.com/fulicat/rollup-plugin-assets
* @Date:   2021-05-12 13:55:51
* @Last Modified by:   Jack.Chan
* @Last Modified time: 2021-05-20 15:23:17
*/

const fs = require('fs');
const path = require('path');

const run_path = path.resolve(__dirname);
const work_path = process.cwd();


const DEFAULT_TEMPLATE = `/**\n* {{fileName}}\n* @Author: Jack.Chan\n* @Website: http://fulicat.com\n* @Release: {{now}}\n*/\n\n`
const DEFAULT_TEMPLATE_JS =`window.AssetsObject={{assets}};window.AssetsBase='{{base}}}';`
const DEFAULT_TEMPLATE_OTHER = `{"assets": {{assets}}, "base": "{{base}}}"}`

const DEFAULT_LOADER = function(assets, base, options) {
	options = Object.assign({}, options);
	if (!String.prototype.startsWith) {
		String.prototype.startsWith = function(searchString, position) {
			position = position || 0;
			return this.indexOf(searchString, position) === position;
		}
	}
	if (!String.prototype.endsWith) {
		String.prototype.endsWith = function(suffix) {
			return this.indexOf(suffix, this.length - suffix.length) !== -1;
		}
	}
	function loadResource(src, basePath, callback) {
		basePath = basePath || '';
		callback = (typeof(callback)==='function' ? callback : function(){});
		if (src) {
			var opts = { src: '' };
			if (typeof(src) === 'string') {
				opts.src = src;
			}
			if (typeof(src) === 'object') {
				opts = Object.assign({}, opts, src);
			}
			var realSrc = opts.src.startsWith('#') ? opts.src.substr(1) : opts.src;
			realSrc = realSrc.indexOf('?') > 1 ? realSrc.split('?')[0] : realSrc;
			if (realSrc.startsWith('https://') || realSrc.startsWith('http://') || realSrc.startsWith('//')) {
				basePath = '';
			}
			var type = realSrc.endsWith('.js') ? 'script' : (realSrc.endsWith('.css') ? 'link' : '');
			if (realSrc && type) {
				var element = document.createElement(type);
				if(type === 'script'){
					opts = Object.assign({}, options.js, opts);
					if (opts && typeof(opts) === 'object') {
						if (opts.async) {
							element.setAttribute('async', '');
						}
						if (opts.charset) {
							element.setAttribute('charset', opts.charset);
						}
						if (opts.crossorigin) {
							element.setAttribute('crossorigin', '');
						}
						if (opts.defer) {
							element.setAttribute('defer', '');
						}
						if (opts.type !== undefined && opts.type !== false && !opts.src.startsWith('#')) {
							element.setAttribute('type', opts.type);
						}
					}
					element.onerror = function() {
						console.error('Load failed: '+ opts.src);
					};
					element.onload = element.onreadystatechange = function() {
						if (!this.readyState || this.readyState === 'complete') {
							callback();
						}
					};
					if (opts.src.startsWith('#')) {
						opts.src = opts.src.substr(1);
					}
					element.src = basePath + opts.src;
				}
				if (type=='link') {
					opts = Object.assign({}, options.css, opts);
					if (opts && typeof(opts) === 'object') {
						if (opts.type) {
							element.setAttribute('type', opts.type);
						}
						if (opts.rel) {
							element.setAttribute('rel', opts.rel);
						}
					}
					if (opts.src.startsWith('#')) {
						opts.src = opts.src.substr(1);
					}
					element.href = basePath + opts.src;
					callback();
				}
				document.head.appendChild(element);
			}
		}
	}
	function parseObjectToArray(_assets){
		var result = [];
		Object.keys(_assets).forEach(function(chunk) {
			if (typeof(_assets[chunk]) === 'string') {
				result.push(_assets[chunk]);
			} else if (typeof(_assets[chunk]) === 'object') {
				if (assets.length) {
					_assets[chunk].forEach(function(_chunk) {
						result.push(_chunk);
					});
				} else {
					Object.keys(_assets[chunk]).forEach(function(_chunk) {
						result.push(_assets[chunk][_chunk]);
					});
				}
			}
		});
		return result;
	}
	function loadResourceQueue(_assets, basePath) {
		var url = _assets[0];
		_assets.splice(0, 1);
		if (url) {
			loadResource(url, basePath, function() {
				loadResourceQueue(_assets, basePath);
			});
		}
	}
	if (typeof(assets) === 'object') {
		if (assets.length === undefined) {
			assets = parseObjectToArray(assets);
		}
		if (assets.length) {
			if (options.queue) {
				assets = JSON.parse(JSON.stringify(assets));
				loadResourceQueue(assets, base);
			} else {
				assets.forEach(function(chunk) {
					loadResource(chunk, base);
				});
			}
		}
	}
}


const plugins = {
	now: (locale, hour12) => {
		locale = locale || undefined
		hour12 = hour12 || false
		return (new Date).toLocaleString(locale, {hour12: hour12})
	},
	template: (tpl, data) => {
		tpl = tpl || ''
		tpl = (tpl).toString()
		data = data || {}
		if (typeof(data) === 'object' && data.length === undefined) {
			Object.keys(data).forEach(key => {
				if (typeof(data[key]) === 'object') {
					data[key] = JSON.stringify(data[key])
				}
			})
		}
		return tpl.replace(/\{\{([^\}]+)\}\}/g, function(match, key) {
			return data[key.trim()]!==undefined ? data[key.trim()] : match;
		})
	},
	compress: (str) => {
		str = str || ''
		str = (str).toString()
		const regExp = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/gm
		str = str.replace(regExp, function(s) {
			return /^\/{2,}/.test(s) || /^\/\*/.test(s) ? '' : s;
		}).replace(/\t|\n|\s{2,}/gi, '');
		return str;
	},
	save: (fileName, fileContent, charset, callback) => {
		fs.writeFileSync(fileName, fileContent, charset)
		if (typeof(callback) === 'function') {
			callback()
		}
	},
	parseAssetsURL: (url) => {
		if (url) {
			var src = typeof(url) === 'object' ? url.src || '' : url
			if (src.startsWith('>') || src.startsWith('<')) {
				if (typeof(url) === 'object') {
					url.src = src.substr(1)
				} else if (typeof(url) === 'string') {
					url = url.substr(1)
				}
			}
		}
		return url
	},
	rmdirSync: function(dir) {
		if (fs.existsSync(dir)) {
			fs.readdirSync(dir).forEach(element => {
				let item = dir +'/'+ element;
				if(fs.statSync(item).isDirectory()) { // recurse
					this.rmdirSync(item);
				} else { // delete file
					fs.unlinkSync(item);
				}
			})
			fs.rmdirSync(dir);
		}
	}
}

function buildAssets(outputOptions, bundle, config, options) {
	bundle = {...bundle}

	let assets = []
	Object.keys(bundle).forEach(file => {
		console.log('@', file);
		if (options.js.type === 'module') {
			if (/\/index.*.(js|css)$/.test(file)) {
				assets.push(file)
			}
		} else {
			if (options.include) {
				if (options.include.test(file.toLowerCase())) {
					assets.push(file)
				}
			} else {
				assets.push(file)
			}
		}
	})

	// sort assets
	if (options.sort) {
		assets.sort(function(a, b) {
			a = typeof(a) === 'object' ? a.src || '' : a
			b = typeof(b) === 'object' ? b.src || '' : b
			a = a.split('.').pop() || a
			b = b.split('.').pop() || b
			return a.localeCompare(b)
		})
	}
	
	// merge externals assets
	if (options.externals && options.externals.length) {
		let assetsBefore = [], assetsAfter = [], src = ''
		options.externals = options.externals.filter(item => item && item)
		options.externals.forEach(item => {
			src = typeof(item) === 'object' ? item.src || '' : item
			if (src.startsWith('>')) {
				assetsAfter.push(plugins.parseAssetsURL(item))
			} else {
				assetsBefore.push(plugins.parseAssetsURL(item))
			}
		})
		assets = assetsBefore.concat(assets).concat(assetsAfter)
	}

	// sort all assets (with externals assets)
	if (options.sort === 'all') {
		assets.sort(function(a, b) {
			a = typeof(a) === 'object' ? a.src || '' : a
			b = typeof(b) === 'object' ? b.src || '' : b
			a = a.split('.').pop() || a
			b = b.split('.').pop() || b
			return a.localeCompare(b)
		})
	}
	
	
	const fileFullName = `${options.outDir}/${options.assetsDir}/${options.fileName}`
	const filePath = path.resolve(`./${fileFullName}`);

	const templateData = {
		now: plugins.now(),
		assets,
		base: options.base,
		outDir: options.outDir,
		assetsDir: options.assetsDir,
		filePath: filePath,
		fileName: options.fileName,
		fileFullName: fileFullName,
	}

	const assetsLoaderData = {
		JS_ASYNC: options.js.async ? `element.setAttribute('async', '');` : '',
		JS_CHATSET: options.js.charset ? `element.setAttribute('charset', '${options.js.charset}');` : '',
		JS_CROSSORIGIN: options.js.crossorigin ? `element.setAttribute('crossorigin', '');` : '',
		JS_DEFER: options.js.defer ? `element.setAttribute('defer', '');` : '',
		JS_TYPE: options.js.type ? `element.setAttribute('type', '${options.js.type}');` : '',
		CSS_TYPE: options.css.type ? `element.setAttribute('type', '${options.css.type}');` : '',
		CSS_REL: options.css.rel ? `element.setAttribute('rel', '${options.css.rel}');` : '',
	}

	const result = {
		...templateData,
		options,
		defaultTemplate: options.fileName.endsWith('.js') ? DEFAULT_TEMPLATE_JS : DEFAULT_TEMPLATE_OTHER,
		template: options.template === true ? DEFAULT_TEMPLATE : options.template,
		loader: options.loader === true ? DEFAULT_LOADER : options.loader,
		loaderOptions: {
			queue: options.queue,
			js: options.js,
			css: options.css
		},
		content: ''
	}
	result.template = result.template !== false ? result.template || result.defaultTemplate : ''
	result.loader = result.loader ? `(${plugins.compress(plugins.template(result.loader, assetsLoaderData))})(assets, base, ${JSON.stringify(result.loaderOptions)});` : ''
	result.content = plugins.template(result.template, templateData)
	if (options.autoLoad && result.loader) {
		result.content = `${result.content}(function(){var assets=${JSON.stringify(result.assets)};var base = '${result.base}';${result.loader}})();`
	}

	process.on('exit', () => {
		if (options.autoSave) {
			plugins.save(result.filePath, result.content, undefined, () => {
				console.log('\n')
				console.log('\x1b[42m%s\x1b[0m%s\x1b[32m%s\x1b[0m', 'Assets:', ' ', result.fileFullName, '  ', `[${result.now}]`, '\n')
			})
		}
		if (typeof(options.done) === 'function') {
			options.done(config, bundle, result, plugins)
		}
	})
}


function RollupPluginAssets(options) {
	const defaultOptions = {
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
		done: (config, bundle, result, plugins) => {}
	}
	if (typeof(options) === 'function') {
		options = {done: options}
	}
	options = Object.assign({}, defaultOptions, options)

	let config
	const AssetsOptions = {
		name: 'rollup-plugin-assets',
		configResolved(resolvedConfig) {
			config = resolvedConfig

			if (!options.base) {
				options.base = config.base
			}
			if (!options.assetsDir) {
				options.assetsDir = config.build.assetsDir
			}
			if (!options.outDir) {
				options.outDir = config.build.outDir
			}
			if (options.emptyOutDir === undefined) {
				options.emptyOutDir = config.build.emptyOutDir
			}
			
			if (options.outDir && options.emptyOutDir) {
				const outDir = path.resolve(work_path, options.outDir)
				console.log('\n')
				console.log('\x1b[42m%s\x1b[0m%s\x1b[32m%s\x1b[0m', 'Clean:', ' ', `./${options.outDir}`, '\n')
				plugins.rmdirSync(path.resolve(outDir))
			}
		},
		generateBundle(outputOptions, bundle) {
			if (options.when === 'generateBundle') {
				buildAssets(outputOptions, bundle, config, options)
			}
		},
		writeBundle(outputOptions, bundle) {
			if (options.when === 'writeBundle') {
				buildAssets(outputOptions, bundle, config, options)
			}
		}
	}
	if (options.apply) {
		AssetsOptions.apply = options.apply
	}
  	return AssetsOptions
}

module.exports = RollupPluginAssets