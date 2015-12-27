/*
 * grunt-project-version-update
 * https://github.com/mageddo/grunt-project-version-updater
 *
 * Copyright (c) 2015 Elvis de Freitas
 * Licensed under the MIT license.
 */

'use strict';

var exec = require('child_process'),
	util = require('util');

module.exports = function(grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('project_version_update', 'Set git, sonar, npm version from only one place', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var done = this.async(),
		fwk = {
			'sonar': function(path, version){
				if (grunt.file.exists(path)) {
					grunt.log.writeln('\t', path);
					var sonar = grunt.file.read(path);
					sonar = sonar.replace(/(sonar\.projectVersion[\t ]*)=.*$/gm, '$1=' + version);
					grunt.file.write(path, sonar);
					return true;
				}else{
					grunt.log.warn('sonar file "' + path + '" not found.');
					return false;
				}
			},
			'npm': function(path, version){
				path = path + '/package.json';
				if (grunt.file.exists(path)) {
					grunt.log.writeln('\t', path);
					var npm = grunt.file.read(path);
					npm = npm.replace(/("version"\ *: *")[^"]+(")/gm, "$1"+ version +"$2");
					grunt.file.write(path, npm);
					return true;
				}else{
					grunt.log.warn('npm file "' + path + '" not found.');
					return false;
				}
			},
			'git': function(path, version){
				if (grunt.file.exists(path)) {
					grunt.log.writeln('\t', path);
					try{
						exec.execFileSync('git', ['tag', version], {cwd: path});
						return true;
					}catch(err){
						grunt.log.warn('git tag version failed', err.message);
						return false;
					}
				}else{
					grunt.log.warn('npm file "' + path + '" not found.');
					return false;
				}
			}
		};
		var options = this.options({
			sonar: ['sonar-project.properties'],
			npm: ['./'],
			git: ['./']
		}),
		version = grunt.option('ver');

		if(!version){
			grunt.log.warn('pass the version to update on --ver');
			return done(false);
		}

		try{
			this.files.forEach(function(f){
				grunt.log.ok('updating: ' + f.dest + ' ...');
				f.src.forEach(function(path){
					var cmd = fwk[f.dest];
					if(cmd){
						if(cmd(path, version)){
							grunt.log.ok(f.dest + ' updated!');
						}else{
							throw '';
						}
					}else{
						grunt.log.warn(util.format('framework "%s" not exists', f.dest));
						done(false);
					}
				});
			});
		}catch(e){
			return done(false);
		}
		grunt.log.ok('... all done!');
	});

};
