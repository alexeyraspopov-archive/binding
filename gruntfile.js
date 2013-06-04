module.exports = function(grunt){
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: ['<%= pkg.name %>.js', '<%= pkg.name %>.min.js'],
		jasmine: {
			dist: {
				src: ['<%= pkg.name %>.js'],
				options: {
					outfile: 'specs.html',
					specs: 'spec/*-spec.js'
				}
			}
		},
		jshint: {
			all: ['*.js', 'spec/*.js']
		},
		concat: {
			dist: {
				src: ['src/prefix.js', 'src/<%= pkg.name %>.js', 'src/factory.js'],
				dest: '<%= pkg.name %>.js'
			}
		},
		uglify: {
			dist: {
				files: {
					'<%= pkg.name %>.min.js': ['<%= pkg.name %>.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('test', ['clean', 'concat', 'jasmine']);
	grunt.registerTask('default', ['clean', 'concat', 'jasmine', 'jshint', 'uglify']);
};