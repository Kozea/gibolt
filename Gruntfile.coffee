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
          style: 'expanded'
        files: [
          expand: true
          flatten: true
          src: "#{sass_path}/main.scss"
          dest: static_css_path
          ext: '.css'
        ]
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
  grunt.loadNpmTasks 'grunt-sass'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.registerTask 'default', ['coffee', 'sass']
