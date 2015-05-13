module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    coffee:
      compile:
        files:
          'static/javascript/main.js': ['generators/coffees/*.coffee']
    sass:
      dist:
        options:
          style: 'expanded'
        files:
          'static/css/main.css': ['generators/sass/*.scss']
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
  grunt.registerTask 'default', ['coffee', 'sass', 'watch']
