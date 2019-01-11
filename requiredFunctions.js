var utils = require('./utils')
var _ = require('lodash')
var Promise = require("bluebird")
var readJson = require('read-package-json')
var pomParser = require("pom-parser")
var g2js = require('gradle-to-js/lib/parser')
var fs = require('fs')
var path = require('path')

module.exports.findExtensions = function (listOfFileNamesAndPaths) {
  var extensions = []
  listOfFileNamesAndPaths.forEach((file) => {
    let extension = file.fileName.substring(file.fileName.lastIndexOf('.')+1, file.fileName.length)
    if(!extensions.includes(extension)){
      extensions.push(extension)
    }
  })
  return extensions
}

module.exports.findTechnology = function (extensions) {
  var runTimes = []
  var runTimesExtensions = []
  var unknownRunTimesExtensions = []

  extensions.forEach((extension) => {
    utils.extensionMapper.find(obj => {
      if(obj.fileExtension === '.'+extension.toUpperCase()){
        runTimes.push(obj.technology)
        runTimesExtensions.push('.'+extension.toUpperCase())
      } else {
        unknownRunTimesExtensions.push('.'+extension.toUpperCase())
      }
    })
  })
  var technology = {
    runTimes: _.uniq(runTimes),
    unknownRunTimes: _.difference(_.uniq(unknownRunTimesExtensions), _.uniq(runTimesExtensions))
  }
  return technology
}

module.exports.findBuildAndDependencyManagementTools = function (listOfFileNamesAndPaths) {
  var buildAndDependencyCheckList = [
    // list all check list as upper case strings for easy string comparison
    'POM.XML', 'BUILD.GRADLE', // java
    'GRUNT.JS', 'WEBPACK.CONFIG.JS', 'WEBPACK.CONFIG.DEV.JS', 'WEBPACK.CONFIG.PROD.JS', 'WEBPACKDEVSERVER.CONFIG.JS', // javascript
    'PACKAGE.JSON', // node
    'YARN.LOCK', // yarn
    'COMPOSER.JSON', //php
    'GOPKG.TOML', // Go
    'GEMFILE', // Ruby
    'REQUIREMENTS.TXT', // Python - looking for django and flask
  ]
  // console.log('exp findB&D list of Files: ', listOfFileNamesAndPaths);

  var fileNamesList = []
  listOfFileNamesAndPaths.forEach((file) => {
    fileNamesList.push(file.fileName) // since every object has just one key
  })
  return _.intersection(buildAndDependencyCheckList, fileNamesList)
}

module.exports.findBuildAndDependencyToolsFromFiles = function (buildAndDependencyTools) {
  let actualTools = [
    {
      toolCurrent: 'POM.XML',
      toolShouldBe: 'MAVEN'
    },
    {
      toolCurrent: 'BUILD.GRADLE',
      toolShouldBe: 'GRADLE'
    },
    {
      toolCurrent: 'PACKAGE.JSON',
      toolShouldBe: 'NODE'
    },
    {
      toolCurrent: 'YARN.LOCK',
      toolShouldBe: 'YARN'
    },
    {
      toolCurrent: 'COMPOSER.JSON',
      toolShouldBe: 'PHP - COMPOSER.JSON'
    },
    {
      toolCurrent: 'GOPKG.TOML',
      toolShouldBe: 'GO'
    },
    {
      toolCurrent: 'GEMFILE',
      toolShouldBe: 'RUBY'
    },
    {
      toolCurrent: 'REQUIREMENTS.TXT',
      toolShouldBe: 'PYTHON - REQUIREMENTS.TXT'
    },
    {
      toolCurrent: 'WEBPACK.CONFIG.JS',
      toolShouldBe: 'WEBPACK'
    },
    {
      toolCurrent: 'WEBPACK.CONFIG.DEV.JS',
      toolShouldBe: 'WEBPACK'
    },
    {
      toolCurrent: 'WEBPACK.CONFIG.PROD.JS',
      toolShouldBe: 'WEBPACK'
    },
    {
      toolCurrent: 'WEBPACKDEVSERVER.CONFIG.JS',
      toolShouldBe: 'WEBPACK'
    }

  ]

  actualTools.forEach((aTool) => {
    let index = buildAndDependencyTools.indexOf(aTool.toolCurrent)
    if(index !== -1) {
      buildAndDependencyTools[index] = aTool.toolShouldBe
    }
  })

  return _.uniq(buildAndDependencyTools)
}

function findFilePathBasedOnFileName (fileName, listOfFileNamesAndPaths, dirname) {
  var f = listOfFileNamesAndPaths.find((file) => {
    if(file.fileName.toString() === fileName.toString()){
      return file
    }
  })
  return dirname+'/'+f.filePath
}

function parsePackageJSON (filePath) {
  return new Promise((resolve,reject) => {
    readJson(filePath, console.error, false, function (er, data) {
      if (er) {
        // console.error("There was an error reading the file")
        reject(er)
      }
      // console.log('parsed name: ', data.name);
      // console.log('parsed dependencies/frameworks: ', Object.keys(data.dependencies));
      // console.log('parsed scripts: ', data.scripts);
      var packagejsonParsed = {
        // name: data.name,
        frameworks: Object.keys(data.dependencies),
        scripts: data.scripts
      }
      // console.log('packagejson result: ', packagejsonParsed);
      resolve(packagejsonParsed)
    });
  })
}

function parsePOMXML (filePath) {
  return new Promise((resolve,reject) => {
    var opts = {
      filePath // The path to a pom file
    };
    pomParser.parse(opts, function(err, pomResponse) {
      if (err) {
        // console.log("ERROR: " + err);
        reject(err)
      }
      var data = pomResponse.pomObject.project
      // console.log('parse data: ', data);
      // console.log('parse dependencies: ', data.dependencies.dependency);
      var frameworks = []
      data.dependencies.dependency.forEach(obj => {
        frameworks.push()
      })

      var pomxmlParsed = {
        // name: data.artifactId,
        frameworks: data.dependencies.dependency,
        scripts: ''
      }
      // console.log('pom xml result: ', pomxmlParsed);
      resolve(pomxmlParsed)
    });
  })
}

function parseGradleBuild (filePath) {
  return new Promise((resolve,reject) => {
    g2js.parseFile(filePath).then(function(representation,err) {
      if(err) reject(err)
      // console.log('parsed gradle result: ', representation);
      var gradleBuildParsed = {
        // name: '',
        frameworks: representation.buildscript.dependencies,
        scripts: ''
      }
      resolve(gradleBuildParsed)
    });
  })

}

function parseGem(fPath) {
  // console.log('parse gem');
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(fPath)
  });
  var prom = new Promise((resolve,reject) => {
    var requiredLines = []
    if(false) reject('error')
    lineReader.on('line', function (line) {
      if(line.includes('gem ') && !line.includes('#')){
        requiredLines.push(line)
      }resolve(requiredLines)
    })
  })

  return prom.then((data) => {
    var frameworks = []
    data.forEach((item) => {
      frameworks.push(item.trim().split(' ')[1].replace(/['"]+/g,'').replace(/'/g,'').replace(',','').trim())
    })
    var gemParsed = {
      // name: '',
      frameworks,
      scripts: ''
    }
    return gemParsed
  })
}

function parseGopkg(fPath) {
  // console.log('parse gopkg');
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(fPath)
  });
  var prom = new Promise((resolve,reject) => {
    var requiredLines = []
    if(false) reject('error')
    lineReader.on('line', function (line) {
      if(line.includes('name = "') && !line.includes('#')){
        requiredLines.push(line)
      }resolve(requiredLines)
    })
  })

  return prom.then((data) => {
    var frameworks = []
    data.forEach((item) => {
      frameworks.push(item.trim().split('=')[1].replace(/['"]+/g,'').replace(/'/g,'').replace(',','').trim())
    })
    var gopkgParsed = {
      // name: '',
      frameworks,
      scripts: ''
    }
    return gopkgParsed
  })
}

function parsePythonRequirementsTxt(fPath) {
  // console.log('parse python Requirementstxt');
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(fPath)
  });
  var prom = new Promise((resolve,reject) => {
    var requiredLines = []
    if(false) reject('error')
    lineReader.on('line', function (line) {
      if(!line.includes('#') && line.trim().length>1){
        requiredLines.push(line)
      }resolve(requiredLines)
    })
  })

  return prom.then((data) => {
    var frameworks = []
    data.forEach((item) => {
      frameworks.push(item.trim())
    })
    var parsePythonRequirementsTxtParsed = {
      // name: '',
      frameworks,
      scripts: ''
    }
    return parsePythonRequirementsTxtParsed
  })
}

module.exports.findFrameworksAndScriptsFromBuildAndDependencyTools = function (buildAndDependencyTools, listOfFileNamesAndPaths, dirname) {
  return Promise.all(
    buildAndDependencyTools.map((tool) => {
      var output
      switch (tool) {
        case 'POM.XML':
          // console.log('pom xml start');
          var filePath = findFilePathBasedOnFileName('POM.XML', listOfFileNamesAndPaths, dirname)
          output = parsePOMXML(filePath)
          // console.log('pom xml end');
          break;

        case 'BUILD.GRADLE':
          // console.log('gradle start');
          var filePath = findFilePathBasedOnFileName('BUILD.GRADLE', listOfFileNamesAndPaths, dirname)
          output = parseGradleBuild(filePath)
          // console.log('gradle end');
          break;

        case 'PACKAGE.JSON':
          // console.log('package.json start');
          var fPath = findFilePathBasedOnFileName('PACKAGE.JSON', listOfFileNamesAndPaths, dirname)
          output = parsePackageJSON(fPath)
          break;

        case 'COMPOSER.JSON':
          console.log('composer start - yet to do');
          console.log('composer end');
          break;

        case 'GOPKG.TOML':
          var fPath = findFilePathBasedOnFileName('GOPKG.TOML', listOfFileNamesAndPaths, dirname)
          output = parseGopkg(fPath)
          break;

        case 'GEMFILE':
          var fPath = findFilePathBasedOnFileName('GEMFILE', listOfFileNamesAndPaths, dirname)
          output = parseGem(fPath)
          break;

        case 'REQUIREMENTS.TXT':
          var fPath = findFilePathBasedOnFileName('REQUIREMENTS.TXT', listOfFileNamesAndPaths, dirname)
          output = parsePythonRequirementsTxt(fPath)
          break;

        default:
          // console.log('default case. Missed for: ', tool);
          break;
      }
      // console.log('switch output: ', output);
      return output
    })
  )
}
