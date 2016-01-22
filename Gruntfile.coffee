bower_path = 'bower_components'
static_css_path = 'static/css'
sass_path = 'generators/sass'
coffee_path = 'generators/coffee'

module.exports = (grunt) ->
  grunt.log.writeln("#{sass_path}/**/*.scss")
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    coffee:
      compile:
        files:
          'static/js/main.js': ['generators/coffees/*.coffee']
    sass:
      dist:
        options:
          loadPath: require('node-bourbon').includePaths
          style: 'expanded'
        files: [
          expand: true
          flatten: true
          src: ["#{sass_path}/*.scss", "#{bower_path}/**/*.scss"]
          dest: static_css_path
          ext: '.css'
        ]
    concat:
      css:
        src: "#{static_css_path}/**/*.css",
        dest: "#{static_css_path}/main.css",
    watch:
      scripts:
        files: ['**/*.coffee']
        tasks: ['coffee']
        options:
          spawn: false
      sass:
        files: ['**/*.scss']
        tasks: ['sass']
        options:
          spawn: false
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.registerTask 'default', ['coffee', 'sass', 'concat', 'watch']
