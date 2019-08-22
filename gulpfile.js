const gulp = require('gulp'),
    sass = require('gulp-sass'),
    notify = require('gulp-notify'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    babel = require('gulp-babel'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    image = require('gulp-image');

const PHPserver = false;
const domain = 'localhost/gulp/app';
const root = 'app';

const paths = {
    scss: {
        src: 'app/assets/css/**/*.scss',
        dest: 'app/assets/css'
    },
    js: {
        src: 'app/assets/js/main.js',
        dest: 'app/assets/js/'
    },
    img: {
        src: 'app/assets/img/**/**/*',
        dest: 'app/assets/img/'
    }
};

function watch() {
    gulp.watch(paths.scss.src, scss);
    gulp.watch(paths.js.src, js);
    gulp.watch("app/**/*.html", reload);
    gulp.watch("app/**/*.php", reload);
    gulp.watch("app/assets/js/**/**/*.js", reload);
    gulp.watch("app/assets/vendors/**/*", reload);
    gulp.watch(paths.img.src, reload);
}

function server() {
    if (PHPserver) {
        browserSync.init({
            proxy: domain,
            notify: false
        });
    } else {
        browserSync.init({
            server: {
                baseDir: root
            },
            notify: false
        });
    }
}

function reload(done) {
    browserSync.reload();
    done();
}

function js(done) {
    gulp.src(paths.js.src)
        .pipe(sourcemaps.init())
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(rename("main.min.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.js.dest));
    done();
}

function scss(done) {
    return gulp.src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', notify.onError({
            message: "<%= error.message %>",
            title: "Sass Error!"
        })))
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream());
    done();
}

function img(done) {
    gulp.src(paths.img.src)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: true}
                ]
            })

        ]))
        .pipe(image())
        .pipe(gulp.dest(paths.img.dest));
    done();
}

exports.scss = scss;
exports.js = js;
exports.img = img;

gulp.task('default', gulp.series(
    gulp.parallel(scss, js),
    gulp.parallel(server, watch)
));