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
  run = require('gulp-run'),
  ustring = require("underscore.string"),
  _ = require("underscore"),
  inquirer = require('inquirer'),
  path = require('path'),
  replace = require('gulp-replace'),
  gulpFn = require('gulp-fn'),
  stripLine = require('gulp-strip-line'),
  fsPath = require('fs-path'),
  fs = require('fs'),
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
      answers.appNameSlug = ustring.slugify(answers.appName);
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
 *
 * Add lib
 *
 *______________________________________________________________________________________
 */
gulp.task('add-lib', function(done) {

  var prompts = [{
    name: 'libToAdd',
    message: 'Which npm library you want to add ?'
  }];

  //Ask
  inquirer.prompt(prompts,
    function(answers) {
      console.log(process.cwd());
      var libToAdd = answers.libToAdd;
      console.log('Please wait...')

      run('npm install --save ' + libToAdd).exec() // prints "Hello World\n". 
        .pipe(gulp.dest('output'))
        .pipe(gulpFn(function(a) {

          var sourcePath = '';
          sourcePath = process.cwd() + '/node_modules/' + libToAdd;

          //try to extract bower.json, far better main props than npm (js only)
          var packageFile = null;
          try {
            packageFile = require(sourcePath + '/bower.json');
          } catch (e) {
            packageFile = null;
          }
          if (packageFile === null) {
            packageFile = require(sourcePath + '/package.json');
          }
          console.log(packageFile);


          var mainFilesName = packageFile.main;
          if (!_.isArray(mainFilesName)) {
            var tempArray = [];
            tempArray.push(mainFilesName);
            mainFilesName = tempArray;
          }
          console.log(JSON.stringify(mainFilesName));

          _.each(mainFilesName, function(mainFileNameParam) {
            var mainFileName = mainFileNameParam;
            if (mainFileNameParam.indexOf('./') === 0) {
              mainFileName = mainFileNameParam.substring(2);
            }
            var targetPath = '';

            var mainFileNameExtension = mainFileName.split('.').pop();
            var mainFileNameOnly = mainFileName;
            if (mainFileNameOnly.indexOf('/') > -1) {
              mainFileNameOnly = mainFileName.split('/').pop();
            }

            if (mainFileNameExtension === 'css') {
              targetPath = process.cwd() + '/_sass/' + libToAdd;
            } else if (mainFileNameExtension === 'js') {
              targetPath = process.cwd() + '/_includes/javascript/' + libToAdd;
            } else {
              console.log('Only CSS or JS files can be included');
              process.exit(1);
            }
            targetPath += '/' + mainFileNameOnly;
            var sourcePath2 = sourcePath + '/' + mainFileName;
            console.log('targetPath is ' + targetPath);
            console.log('sourcePath2 is ' + sourcePath2);

            var sourceContent = fs.readFileSync(sourcePath2);
            if (mainFileNameExtension === 'js') {
              targetPath += '.html';
              sourceContent = '<script type="text/javascript">\r' + sourceContent + '\r</script>';
            }
            fsPath.writeFile(targetPath, sourceContent, function(err) {
              if (err) {
                throw err;
              } else {
                if (mainFileNameExtension === 'css') {
                  gulp.src('./css/main.scss')
                    .pipe(replace('// end-extlib', 
                                  '@import "' + libToAdd + '/' + mainFileNameOnly + '";\r// end-extlib'))
                    .pipe(gulp.dest('./css'));
                } else if (mainFileNameExtension === 'js') {
                  gulp.src('./_layouts/default.html')
                    .pipe(replace(/<!--end-ext-lib-->/, 
                                  '  {% include javascript/' + libToAdd + '/' + mainFileNameOnly + '.html %}\r\t\t<!--end-ext-lib-->'))
                    .pipe(gulp.dest('./_layouts'));
                } else {
                  console.log('Only CSS or JS files can be included');
                  process.exit(1);
                }
                console.log('Library ' + libToAdd + ' is now correctly included');
              }
            });
          });
        }));
    });

});
