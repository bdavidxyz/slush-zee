/*
 * slush-zee
 * https://github.com/bdavidxyz/slush-zee
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
gulpif = require('gulp-if'),
template = require('gulp-template'),
rename = require('gulp-rename'),
run = require('gulp-run'),
ustring = require("underscore.string"),
_ = require("underscore"),
inquirer = require('inquirer'),
path = require('path'),
replace = require('gulp-replace'),
clean = require('gulp-clean'),
gulpFn = require('gulp-fn'),
stripLine = require('gulp-strip-line'),
fsPath = require('fs-path'),
fs = require('fs'),
insert = require('gulp-insert');

var argv = require('yargs').argv;
var googleWebFonts = require('gulp-google-webfonts');
var fs = require('fs');

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

  console.log('JSON.stringify(argv) ' + JSON.stringify(argv));

  //Ask
  inquirer.prompt(prompts,
    function(answers) {
      if (!answers.moveon) {
        return done();
      }
      answers.appNameSlug = ustring.slugify(answers.appName);
      gulp.src(__dirname + '/templates/**')
      .pipe(template(answers))
      .pipe(rename(function(file) {
        if (file.basename[0] === '_' && file.basename[1] === '_') {
          file.basename = '.' + file.basename.slice(2);
        }
      }))
        .pipe(conflict('./', {replaceAll:true}))
        .pipe(gulp.dest('./'))
        .pipe(install())
        .pipe(googleWebFonts({}))
        .pipe(gulpFn(function() {
            return gulp.src('./fonts.list')
            .pipe(googleWebFonts(options))
            .pipe(gulp.dest('fonts'))
        }))
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
 gulp.task('add-section', function(done) {

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
        .pipe(insert.append('{% include html/zee/' + sectionName + '.html %}\r'))
        .pipe(gulp.dest('./'));
      }

      function addCSS(sectionName) {
        gulp.src('./css/main.scss')
        .pipe(insert.append('@import "zee/' + sectionName + '";\r'))
        .pipe(gulp.dest('./css'));
      }

      function addJS(sectionName) {
        gulp.src('./_layouts/default.html')
        .pipe(replace(/<!--endjs-->/, '  {% include javascript/zee/' + sectionName + '.js.html %}\r\t\t<!--endjs-->'))
        .pipe(gulp.dest('./_layouts'));
      }


    });

});







/*______________________________________________________________________________________
 *
 *
 * Remove section
 *
 *______________________________________________________________________________________
 */
 gulp.task('rm-section', function(done) {

  var prompts = [{
    name: 'sectionToRemove',
    message: 'Which section you want to remove ?'
  }];

  //Ask
  inquirer.prompt(prompts,
    function(answers) {

      var sectionToRemove = answers.sectionToRemove;

      function removeHTML() {
        return gulp
        .src('./index.html')
        .pipe(stripLine([sectionToRemove]))
        .pipe(gulp.dest('./'));
      }

      function removeCSS() {
        return gulp
        .src('./css/main.scss')
        .pipe(stripLine([sectionToRemove]))
        .pipe(gulp.dest('./css'));
      }

      function removeJS() {
        return gulp
        .src('./_layouts/default.html')
        .pipe(stripLine([sectionToRemove]))
        .pipe(gulp.dest('./_layouts'));
      }

      removeHTML();
      removeCSS();
      removeJS();

    });

});




/*______________________________________________________________________________________
 *
 * Update theme
 *
 *______________________________________________________________________________________
 */
 gulp.task('update-theme', function(done) {

  var prompts = [{
    name: 'headingFont',
    message: 'Which font do you want as heading ? (type name of a google web font)'
  },
  {
    name: 'displayFont',
    message: 'Which font do you want as display ? (type name of a google web font)'
  },
  {
    name: 'primaryColor',
    message: 'Which color do you want as primary color ? (for ex. #0275d8)'
  }
  ];
  
  //Ask
  inquirer.prompt(prompts,
    function(answers) {

      var headingFont = answers.headingFont;
      var displayFont = answers.displayFont;
      var primaryColor = answers.primaryColor;

      function getFontName(fontArg) {
        return fontArg.split('+').join(' ').substring(0, headingFont.indexOf(':')).replace(':', '');
      }

      var headingFontName = getFontName(headingFont);
      var displayFontName = getFontName(displayFont);

      function replaceHeadingFont() {
        console.log('replaceHeadingFont');
        return gulp
        .src('./_sass/theme.scss')
        .pipe(stripLine(/^./))
        .pipe(replace('\n', ''))
        .pipe(insert.append('$headings-font-family: "' + headingFontName + '";\n'))   
        .pipe(insert.append('$font-family-base: "' + displayFontName + '";\n'))   
        .pipe(insert.append('$brand-primary: ' + primaryColor + ';\n'))   
        .pipe(gulp.dest('./_sass'));
      }

      var options = { };
      gulp.src('./fonts/**', {read: false})
      .pipe(clean())
      .pipe(gulpFn(function() {
        fs.writeFile('fonts.list', headingFont + '\n' + displayFont, function() {
          return gulp.src('./fonts.list')
          .pipe(googleWebFonts(options))
          .pipe(gulp.dest('fonts'))
          .pipe(gulpFn(replaceHeadingFont))
        });
      }));

      

    });

});


