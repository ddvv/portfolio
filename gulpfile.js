const   gulp = require('gulp'),
        
        gulpLoadPlugins = require('gulp-load-plugins'),
        gp = gulpLoadPlugins(),
        fs = require('fs'),
        del = require('del'),
        browserSync = require('browser-sync').create();
 
const   paths = {
        root: './build',
        pug: {
            pages: './src/pug/pages/*.pug',
            src: './src/pug/**/*.pug',
            dest: './build'
        },
        styles: {
            main: './src/styles/main.scss',
            src: './src/styles/**/*.scss',
            dest: './build/css'
        },
        // scripts: {
        //     src: './src/scripts/*.js',
        //     dest: './build/scripts'
        // },
        svgSprite: {
            src: './src/images/icons/*.svg',
            dest: './build/img/icons',
            watch: './src/images/icons/*.svg',
        }
};

// очистка
function clean() {
    return del(paths.root);
}

// pug
function templates(){
    return gulp.src(paths.pug.pages)
    .pipe(gp.pug({
        locals : JSON.parse(fs.readFileSync('./src/content.json', 'utf8')),
        pretty: true
    }))
    .on('error', gp.notify.onError(function (error) {
        return {
            title: 'Pug',
            message: error.message
        }
    }))
    .pipe(gulp.dest(paths.root));
};

// scss
function styles() {
    return gulp.src(paths.styles.main)
        .pipe(gp.sassGlob())
        .pipe(gp.sourcemaps.init())
        .pipe(gp.sass({
            includePaths: require('node-normalize-scss').includePaths
        }).on('error', gp.notify.onError({
            title: 'style'
        })))
        .pipe(gp.autoprefixer({
            browsers: [
                'last 3 version',
                '> 1%',
                'ie 8',
                'ie 9',
                'Opera 12.1'
            ]
        }))
        .pipe(gp.cssUnit({
            type     :    'px-to-rem',
            rootSize :    16
        }))
        .pipe(gp.sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest))
}

// server
function serve() {
    browserSync.init({
        open: false,
        server: {
            baseDir: "./build"
        }
    });
    // gulp.watch("./build").on("change", browserSync.reload);
}

// watch
function watch() {
    gulp.watch(paths.pug.src, gulp.series(templates, reload));
    gulp.watch(paths.styles.src, gulp.series(styles, reload));
    gulp.watch('./src/images/**/*', gulp.series(images, reload));
    gulp.watch(paths.svgSprite.watch, gulp.series(svgSprite, reload));
    gulp.watch('./src/fonts/**/*', gulp.series(fonts, reload));
    gulp.watch('./src/content.json', gulp.series(templates, reload));
}

function images(){
    return gulp.src([ './src/images/**/*', '!./src/images/icons/**/*'])
        .pipe(gulp.dest('./build/img'))
}

function svgSprite(){
    return gulp.src(paths.svgSprite.src)
        .pipe(gp.svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gp.cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(gp.replace('&gt;', '>'))
        .pipe(gp.svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest(paths.svgSprite.dest))
}

function fonts(){
    return gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./build/fonts'))
}

function reload(done){
    browserSync.reload();
    done();
}

exports.templates = templates;
exports.styles = styles;
exports.clean = clean;
exports.serve = serve;
exports.watch = watch;
exports.svgSprite = svgSprite;
exports.images = images;
exports.fonts = fonts;

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(
        images,
        svgSprite,
        fonts,
        styles, 
        templates
    ),
    gulp.parallel(
        watch,
        serve
    )
));