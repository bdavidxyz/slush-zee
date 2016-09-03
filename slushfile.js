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
  hero2: ['html', 'css'],
  feature1: ['html'],
  feature2: ['html', 'css'],
  feature3: ['html'],
  feature4: ['html', 'css'],
  footer1: ['html', 'css'],
  footer2: ['html', 'css'],
  pricingtable1: ['html', 'css'],
  navbar1: ['html', 'css', 'js'],
  separator1: ['html', 'css'],
  separator2: ['html', 'css'],
  separator3: ['html', 'css']
};


var gulp = require('gulp'),
 install = require('gulp-install'),
 gfi = require('gulp-file-insert'),
 deleteLines = require('gulp-delete-lines'),
conflict = require('gulp-conflict'),
gulpif = require('gulp-if'),
template = require('gulp-template'),
rename = require('gulp-rename'),
run = require('gulp-run'),
ustring = require('underscore.string'),
_ = require("underscore"),
inquirer = require('inquirer'),
path = require('path'),
replace = require('gulp-replace'),
clean = require('gulp-clean'),
gulpFn = require('gulp-fn'),
stripLine = require('gulp-strip-line'),
googleWebFonts = require('gulp-google-webfonts'),
insert = require('gulp-insert'),
argv = require('yargs').argv,
fs = require('fs-extra');


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
      .on('finish', function() {
        _.partial(update_theme, 'Roboto+Condensed:700', 'Roboto:300,400,700', '#6b15a1')();
        done();
      })
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
    message: 'Which section you want to add ? (see https://bdavidxyz.github.io/zee/sections-doc/) ',
    type: 'list',
    choices: Object.keys(sections)
  }
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

      update_theme(headingFont, displayFont, primaryColor);

    });

});

 function update_theme(headingFont, displayFont, primaryColor) {

  console.log('headingFont is now ' + headingFont);
  console.log('displayFont is now ' + displayFont);
  console.log('primaryColor is now ' + primaryColor);
  console.log('working... ');

  function getFontName(fontArg) {
    if (fontArg.indexOf(':') === -1) {
      return fontArg.split('+').join(' ');
    }
    return fontArg.split('+').join(' ').substring(0, fontArg.indexOf(':')).replace(':', '');
  }


  function replaceHeadingFont() {
    return gulp
    .src('./_sass/theme.scss')
    .pipe(stripLine(/^./))
    .pipe(replace('\n', ''))
    .pipe(insert.append('$headings-font-family: "' + headingFontName + '";\n'))   
    .pipe(insert.append('$font-family-base: "' + displayFontName + '";\n'))   
    .pipe(insert.append('$brand-primary: ' + primaryColor + ';\n'))   
    .pipe(gulp.dest('./_sass'));
  }

  function resetCssInjection() {

    return gulp
    .src('./css/main.scss')
    .pipe(deleteLines({'filters': [
      /generated/
      ]}))
    .pipe(gulp.dest('./css'));
  }

  function replaceCssInjection() {
    var fontsContent = fs.readFileSync("./fonts/fonts.css", "utf8");
    return gulp
     .src('./fonts/fonts.css')
      .pipe(replace('\n', '/*generated automatically*/\n'))
      .pipe(replace('url(', 'url("{{site.baseurl}}/fonts/'))
      .pipe(replace('.woff', '.woff"'))
      .pipe(insert.prepend('/* font-face definition */\n'))
      .pipe(gulp.dest('./fonts'));
  }

  function injectToMainScss() {
    return gulp.src('./css/main.scss')
      .pipe(gfi({
        "/* font-face definition */": "./fonts/fonts.css"
      }))
      .pipe(gulp.dest('./css'));
  }

  var headingFontName = getFontName(headingFont);
  var displayFontName = getFontName(displayFont);

  fs.writeFileSync('fonts.list', headingFont + '\n' + displayFont, 'utf-8');
  fs.emptyDirSync('fonts');
  
  gulp.src('./fonts.list')
    .pipe(googleWebFonts({}))
    .pipe(gulp.dest('fonts'))
      .on('finish', function() {
        replaceHeadingFont();
        resetCssInjection();
        replaceCssInjection().on('finish', function() {
          injectToMainScss();
          console.log('done');
        });
      });
}
