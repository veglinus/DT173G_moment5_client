const {src, dest, watch, series, parallel} = require("gulp");
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
//const cleanCSS = require('gulp-clean-css');
const imagemin = require("gulp-imagemin");
const del = require("del");
const babel = require("gulp-babel");

const sass = require('gulp-sass'); 
sass.compiler = require('node-sass');

const files = {
    html: "src/**/*.html",
    css: "src/**/*.css",
    sass: "src/sass/*.scss",
    js: "src/**/*.js",
    //imgs: "src/assets/*",
    assets: "src/assets/*"
}

// Kopierar över HTML filer
function copyhtml() {
    return src(files.html)
        .pipe(dest('pub'))
        .pipe(browserSync.stream())
}

// Kopierar över assets, tex fonter
function copyAssets() {
    return src(files.assets)
    .pipe(dest('pub/assets'))
}

// Minifiera och sammanslår JS
function minifyJS() {
    return src(files.js)
        .pipe(concat("main.js"))
        /*
        .pipe(babel({
            presets: ['@babel/env']
        }))*/
        //.pipe(uglify())
        .pipe(dest('pub/js'))
        .pipe(browserSync.stream())
}

// Minifiera och sammanslå CSS
/*
function minifyCSS() {
    return src(files.css)
    .pipe(concat("styles.css"))
    .pipe(cleanCSS())
    .pipe(dest('pub/css'))
    .pipe(browserSync.stream())
}*/

// Minifiera bilder, sänker kvalitén på dem

/*
function minifyIMGS() {
    return src(files.imgs)
    .pipe(imagemin([
        imagemin.mozjpeg({quality: 50, progressive: true}),
        imagemin.optipng({optimizationLevel: 0})
    ]))
    .pipe(dest('pub'))
    .pipe(browserSync.stream())
}*/

// Tar bort pub mappen
function clean() {
    return del(["pub"]);
}


// Kompilerar .scss till css
function sassTask() {
    return src("src/sass/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass()).on("error", sass.logError)
    .pipe(dest("pub/css"))
    .pipe(sourcemaps.write())
    .pipe(browserSync.stream());
}

// Watchtask som kollar efter förändringar
function watchTask() {
    browserSync.init({
        server: {
            baseDir: "./pub"
        }
    });

    //watch([files.imgs], minifyIMGS);
    watch([files.html], copyhtml);
    watch([files.js], minifyJS);
    //watch([files.css], minifyCSS);
    watch([files.sass], sassTask);
    watch([files.assets], copyAssets);
}
// Default task
exports.default = series(
    clean,
    parallel(copyhtml, minifyJS, sassTask, copyAssets),
    watchTask
)

exports.clean = clean;
exports.sassTask = sassTask;
exports.copyhtml = copyhtml;
exports.minifyJS = minifyJS;
//exports.minifyCSS = minifyCSS;
//exports.minifyIMGS = minifyIMGS;
exports.copyAssets = copyAssets;