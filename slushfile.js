/*
 * slush-slush-zee
 * https://github.com/bdavidxyz/slush-slush-zee
 *
 * Copyright (c) 2016, bdavidxyz
 * Licensed under the MIT license.
 */

'use strict';

var sections = {
    hero1: ['html', 'css'],
    navbar1: ['html', 'css', 'js']
};

var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path'),
    replace = require('gulp-replace'),
    insert = require('gulp-insert');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

var defaults = (function() {
    var workingDirName = path.basename(process.cwd()),
        homeDir, osUserName, configFile, user;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
    } else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }

    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || ''
    };
})();




/*______________________________________________________________________________________
 *
 *
 * Default 
 *
 *______________________________________________________________________________________
 */
gulp.task('default', function(done) {
    var prompts = [{
        name: 'appName',
        message: 'What is the name of your project?',
        default: defaults.appName
    }, {
        name: 'appDescription',
        message: 'What is the description?'
    }, {
        name: 'appVersion',
        message: 'What is the version of your project?',
        default: '0.1.0'
    }, {
        name: 'authorName',
        message: 'What is the author name?',
        default: defaults.authorName
    }, {
        name: 'authorEmail',
        message: 'What is the author email?',
        default: defaults.authorEmail
    }, {
        name: 'userName',
        message: 'What is the github username?',
        default: defaults.userName
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];
    //Ask
    inquirer.prompt(prompts,
        function(answers) {
            if (!answers.moveon) {
                return done();
            }
            answers.appNameSlug = _.slugify(answers.appName);
            gulp.src(__dirname + '/templates/**')
                .pipe(template(answers))
                .pipe(rename(function(file) {
                    if (file.basename[0] === '_' && file.basename[1] === '_') {
                        file.basename = '.' + file.basename.slice(2);
                    }
                }))
                .pipe(conflict('./'))
                .pipe(gulp.dest('./'))
                .pipe(install())
                .on('end', function() {
                    done();
                });
        });
});







/*______________________________________________________________________________________
 *
 *
 * Add section
 *
 *______________________________________________________________________________________
 */
gulp.task('addsection', function(done) {

    var prompts = [{
        name: 'sectionToAdd',
        message: 'Which section you want to add ?',
        type: 'list',
        choices: Object.keys(sections)
    }
    // ,
    // {
    //     name: 'sectionRenamed',
    //     message: '(optional) Do you want a more specific name for this section ?'
    // }
    ];

    //Ask
    inquirer.prompt(prompts,
        function(answers) {

            var sectionToAdd = answers.sectionToAdd;
            console.log(sectionToAdd);
            if (sections[sectionToAdd] == null) { //null or undefined
                console.log('Sorry, this section doesnt exist. Choose amongst ' + Object.keys(sections));
            } else {
                var webLangages = sections[sectionToAdd]
                if (webLangages.indexOf('html') > -1) {
                    addHTML(sectionToAdd);
                }
                if (webLangages.indexOf('css') > -1) {
                    addCSS(sectionToAdd);
                }
                if (webLangages.indexOf('js') > -1) {
                    addJS(sectionToAdd);
                }
            }

            function addHTML(sectionName) {
                gulp.src('./index.html')
                  .pipe(insert.append('{% include html/zee/'+ sectionName +'.html %}\r'))
                  .pipe(gulp.dest('./'));
            }
            function addCSS(sectionName) {
                gulp.src('./css/main.scss')
                  .pipe(insert.append('@import "zee/'+ sectionName +'";\r'))
                  .pipe(gulp.dest('./css'));
            }
            function addJS(sectionName) {
                gulp.src('./_layouts/default.html')
                  .pipe(replace(/<!--endjs-->/, '  {% include javascript/zee/'+ sectionName + '.js.html %}\r\t\t<!--endjs-->'))
                  .pipe(gulp.dest('./_layouts'));
            }


        });

});
