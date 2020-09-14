const {src, dest} = require('gulp')
const babel = require('gulp-babel');
const uglify = require('gulp-uglifyjs');
const rename = require('gulp-rename');
exports.default = function () {
  return src('src/index.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(rename('after-axios.js'))
    .pipe(dest('dist'))
    .pipe(uglify())
    .pipe(rename('after-axios.min.js'))
    .pipe(dest('dist'))
}