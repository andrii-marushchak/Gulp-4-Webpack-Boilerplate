// Node
const fs = require('fs');
const through = require("through2");
const path = require('path');

// Gulp
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps")
const gulpif = require("gulp-if")
const notify = require("gulp-notify")
const size = require('gulp-filesize')
const clean = require('gulp-clean');

// HTML
const htmlmin = require('gulp-htmlmin')
const fileinclude = require('gulp-file-include')
const versionNumber = require("gulp-version-number")
const imgToPicture = require("gulp-html-img-to-picture")

// Sass
const sass = require('gulp-sass')(require('sass'));

// PostCSS
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sortMediaQueries = require('postcss-sort-media-queries');

// Images
const newer = require("gulp-newer");

// JS & Webpack
const webpack = require("webpack") // "babel-loader"
const webpackStream = require("webpack-stream")

// BrowserSync
const browserSync = require("browser-sync").create(); //https://browsersync.io/docs/gulp#page-top

// Enviroment
const {
	setDevelopmentEnvironment,
	setProductionEnvironment,
	isProduction,
	isDevelopment
} = require('gulp-node-env')

// Set Development enironment by default
setDevelopmentEnvironment();

const srcFolder = './src'
const buildFolder = './dist'

const paths = {
	html: {
		src: [
			`${srcFolder}/*.html`,
			`${srcFolder}/template-parts/**/*.html`,
			`${srcFolder}/**/*.php`,
		],
		watch_srs: [
			`${srcFolder}/**/*.html`,
			`${srcFolder}/**/*.php`,
		],
		dest: `${buildFolder}/`
	},
	scss: {
		src: [
			`${srcFolder}/assets/css/**/**/*.scss`,
		],
		dest: `${buildFolder}/assets/css/`
	},
	js: {
		main: `${srcFolder}/assets/js/scripts.js`,
		src: `${srcFolder}/assets/js/**/**/*.js`,
		dest: `${buildFolder}/assets/js/`
	},
	img: {
		src: `${srcFolder}/assets/img/**/*.{jpg,png,jpeg,svg,gif}`,
		src_dest: `${srcFolder}/assets/img/`,
		dest: `${buildFolder}/assets/img/`,
	},
	video: {
		src: `${srcFolder}/assets/video/**/**/*`,
		dest: `${buildFolder}/assets/video/`
	},
	vendors: {
		src: `${srcFolder}/assets/vendors/**/**/*`,
		dest: `${buildFolder}/assets/vendors/`
	},
	fonts: {
		src: [
			`${srcFolder}/assets/fonts/**/**/*`
		],
		dest: [
			`${buildFolder}/assets/fonts/`
		]
	}
}

function serve() {
	const proxyServer = false
	const domain = 'localhost/test'
	if (proxyServer) {
		browserSync.init({
			proxy: domain,
			notify: false,
			port: 4001
		})
	} else {
		browserSync.init({
			server: {
				baseDir: buildFolder
			},
			notify: false,
			port: 4001
		})
	}
}

function reload() {
	browserSync.reload()
}

function cleanDist() {
	return gulp.src(buildFolder, {allowEmpty: true}) // Allow empty folder
		.pipe(plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "Clear Dist Folder Error",
					message: "<%= error.message %>"
				})(err)
			}
		}))

		.pipe(clean({force: true}))
}

function scss() {
	return gulp.src(paths.scss.src)
		.pipe(plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "SCSS Error",
					message: "<%= error.message %>"
				})(err)
			}
		}))
		.pipe(gulpif(isDevelopment, sourcemaps.init()))

		// SCSS
		.pipe(sass().on('error', sass.logError))

		// Dev PostCSS
		.pipe(gulpif(isDevelopment, postcss([
			autoprefixer(),
		])))

		// Build PostCSS
		.pipe(gulpif(isProduction, postcss([
			autoprefixer({
				grid: false
			}),
			cssnano({
				autoprefixer: true,
				cssDeclarationSorter: true,
				calc: true,
				colormin: true,
				convertValues: true,
				discardComments: {removeAll: true},
				discardDuplicates: true,
				discardEmpty: true,
				discardOverridden: true,
				discardUnused: true,
				mergeIdents: true,
				mergeLonghand: true,
				mergeRules: true,
				minifyFontValues: true,
				minifyGradients: true,
				minifyParams: true,
				minifySelectors: true,
				normalizeCharset: true,
				normalizeDisplayValues: true,
				normalizePositions: true,
				normalizeRepeatStyle: true,
				normalizeString: true,
				normalizeTimingFunctions: true,
				normalizeUnicode: true,
				normalizeUrl: true,
				normalizeWhitespace: true,
				orderedValues: true,
				reduceIdents: true,
				reduceInitial: true,
				reduceTransforms: true,
				svgo: true,
				uniqueSelectors: true,
				zindex: false,
			}),
			sortMediaQueries({
				sort: 'desktop-first' // default
			})
		])))
		.pipe(gulpif(isDevelopment, sourcemaps.write('./')))
		.pipe(gulp.dest(paths.scss.dest))
		.pipe(size())
		.pipe(browserSync.stream())
}

function js() {
	return gulp.src(paths.js.src)

		.pipe(plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "JS Error",
					message: "<%= error.message %>"
				})(err)
			}
		}))

		// Development Webpack
		.pipe(gulpif(isDevelopment,
			webpackStream({
				devtool: "eval-source-map",
				mode: 'development',
				output: {
					filename: '[name].js',
					sourceMapFilename: "[name].js.map"
				},
				plugins: [
					new webpack.ProvidePlugin({
						$: 'jquery',
						jQuery: 'jquery',
					}),
					new webpack.AutomaticPrefetchPlugin(),
				],
			})
		)).on('error', function handleError() {
			this.emit('end'); // Recover from errors
		})

		// Production Webpack
		.pipe(gulpif(isProduction(),
			webpackStream({
				devtool: false,
				mode: 'production',
				output: {
					filename: '[name].js',
					sourceMapFilename: "[name].js.map"
				},
				plugins: [
					new webpack.ProvidePlugin({
						$: 'jquery',
						jQuery: 'jquery',
					}),
					new webpack.AutomaticPrefetchPlugin(),
				],
			})
		)).on('error', function handleError() {
			this.emit('end'); // Recover from errors
		})

		.pipe(gulp.dest(paths.js.dest))
		.pipe(size())
		.pipe(browserSync.stream())
}

function html() {
	return gulp.src(paths.html.src)
		.pipe(plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "HTML Error",
					message: "<%= error.message %>"
				})(err)
			}
		}))

		// Combine HTML Parts
		.pipe(fileinclude())

		// Convert IMG to <picture>
		.pipe(imgToPicture({
			imgFolder: `${buildFolder}/`
		}))

		// Add version to scripts & styles
		.pipe(gulpif(isProduction(), versionNumber({
			'value': '%DT%',
			'append': {
				'key': '_v',
				'cover': 0,
				'to': [
					'css',
					'js',
				]
			}, /*
                'output': {
                   'file': 'gulp/version.json'
                }
               */
		})))

		// Compress HTML
		.pipe(gulpif(isProduction(), htmlmin({
			useShortDoctype: true,
			collapseWhitespace: false,
			collapseInlineTagWhitespace: false,
			removeComments: true
		})))

		.pipe(gulp.dest(paths.html.dest))
		.pipe(browserSync.stream())
}

function files(callback) {
	// Fonts
	if (fs.existsSync(paths.fonts.src)) {
		gulp.src(paths.fonts.src)
			.pipe(gulp.dest(paths.fonts.dest))
			.pipe(browserSync.stream())
	}

	// Vendors
	if (fs.existsSync(paths.vendors.src)) {
		gulp.src(paths.vendors.src)
			.pipe(gulp.dest(paths.vendors.dest))
			.pipe(browserSync.stream())
	}

	// Videos
	if (fs.existsSync(paths.video.src)) {
		gulp.src(paths.video.src)
			.pipe(gulp.dest(paths.video.dest))
			.pipe(browserSync.stream())
	}

	// Image
	if (fs.existsSync(paths.img.src)) {
		gulp.src(paths.img.src)
			.pipe(gulp.dest(paths.img.dest))
			.pipe(browserSync.stream())
	}

	callback()
}

function imgOptimization() {
	return gulp.src(paths.img.src)
		.pipe(plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "IMG Error",
					message: "<%= error.message %>"
				})(err)
			}
		}))

		// Loop only new images
		.pipe(newer(paths.img.dest))

		// Optimize Image here

		.pipe(gulp.dest(paths.img.dest));
}

function watch() {
	// SCSS
	gulp.watch(paths.scss.src, gulp.series(scss))

	// JS
	gulp.watch(paths.js.src, gulp.series(js))

	// HTML
	gulp.watch(paths.html.watch_srs, gulp.series(html))

	// Images
	gulp.watch(paths.img.src, gulp.series(imgOptimization))

	// Vendors folder
	gulp.watch(paths.vendors.src, gulp.series(reload))

	// Video
	gulp.watch(paths.video.src, gulp.series(reload))

	// Fonts
	gulp.watch(paths.fonts.src, gulp.series(reload))
}

const img = gulp.series(imgOptimization);
const dev = gulp.series(setDevelopmentEnvironment, cleanDist, gulp.parallel(files, scss, js, img), html, gulp.parallel(watch, serve))
const build = gulp.series(setProductionEnvironment, cleanDist, gulp.parallel(files, scss, js, img), html)


exports.img = img

exports.build = build
exports.dev = dev
exports.default = dev
