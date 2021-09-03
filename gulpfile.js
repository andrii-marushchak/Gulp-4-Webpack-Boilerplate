const gulp = require('gulp'),
    webpack = require("webpack-stream"),
    browserSync = require('browser-sync').create(),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify-es').default,
    sass = require("gulp-sass"),
    cleanCSS = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    through = require('through2'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require("gulp-rename"),
    del = require("del"),
    plumber = require("gulp-plumber"),
    imagemin = require('gulp-imagemin'),
    image = require('gulp-image');

const ProxyServer = false;
const domain = 'localhost/app-name';
const webpackModules = true;
const baseDir = 'app';

const paths = {
    html: {
        src: 'app/**/*.html',
        dest: 'app/'
    },
    scss: {
        src: [
            'app/assets/css/*.scss',
            'app/assets/css/components/*.scss',
            'app/assets/css/other/*.scss',
            'app/assets/css/pages/*.scss',
            'app/assets/css/sections/*.scss',
        ],
        dest: 'app/assets/dist/css/'
    },
    js: {
        src: ['app/assets/js/scripts.js', 'app/assets/js/components/**/*.js', 'app/assets/js/**/*.js'],
        dest: 'app/assets/dist/js/'
    },
    img: {
        src: 'app/assets/img/**/**/*',
        dest: 'app/assets/img/'
    },
};

function serve() {
    if (ProxyServer) {
        browserSync.init({
            proxy: domain,
            notify: false
        });
    } else {
        browserSync.init({
            server: {
                baseDir: baseDir
            },
            notify: false
        });
    }
}

function cleanFolder() {
    return del('app/assets/dist');
}


function reload(done) {
    browserSync.reload();
    done();
}

function watch() {
    // SCSS
    gulp.watch(paths.scss.src, gulp.series(scss));

    // JS
    gulp.watch(['app/assets/js/*.js', 'app/assets/js/components/*.js'], gulp.series(js));

    // HTML
    gulp.watch(paths.html.src, gulp.series(reload));

    // Vendors folder
    gulp.watch("app/assets/vendors/**/**/*", gulp.series(reload));

    // Images
    gulp.watch(paths.img.src, gulp.series(reload));
}


if (webpackModules) {
    function js(done) {
        return gulp.src(paths.js.src)
            .pipe(plumber())
            .pipe(webpack({
                config: require('./webpack.config.js')
            }))
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(through.obj(function (file, enc, cb) {
                const isSourceMap = /\.map$/.test(file.path);
                if (!isSourceMap) this.push(file);
                cb();
            }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(paths.js.dest))
            .pipe(browserSync.stream())
        done();
    }
} else {
    function js(done) {
        return gulp.src(paths.js.src)
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(babel({presets: ['@babel/env']}))
            .pipe(rename("scripts.min.js"))
            .pipe(uglify())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(paths.js.dest))
            .pipe(browserSync.stream());
        done();
    }
}

function scss(done) {
    return gulp.src(paths.scss.src)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 10 versions"],
            cascade: false,
            grid: true
        }))
        .pipe(cleanCSS())
        .pipe(rename("styles.min.css"))
        .pipe(sourcemaps.write('../css'))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream());
    done();
}

function img(done) {
    return gulp.src(paths.img.src)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(image({
            svgo: false
        }))
        .pipe(gulp.dest(paths.img.dest));
    done();
}

exports.serve = serve;
exports.reload = reload;
exports.watch = watch;
exports.js = js;
exports.scss = scss;
exports.img = img;
exports.default = gulp.series(cleanFolder, gulp.parallel(scss, js), gulp.parallel(watch, serve));


