var utils = require('./utils')
var _ = require('lodash')
var Promise = require("bluebird")
var readJson = require('read-package-json')
var pomParser = require("pom-parser")
var g2js = require('gradle-to-js/lib/parser')

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
    'COMPOSER.JSON', //php
    'GOPKG.TOML', 'GOPKG.LOCK' // Go
    // Ruby - interpreted language so no build tools
    // Python - pip : scan all files for imports
  ]
  // console.log('exp findB&D list of Files: ', listOfFileNamesAndPaths);

  var fileNamesList = []
  listOfFileNamesAndPaths.forEach((file) => {
    fileNamesList.push(file.fileName) // since every object has just one key
  })
  return _.intersection(buildAndDependencyCheckList, fileNamesList)
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
          return output

        case 'COMPOSER.JSON':
          console.log('composer start');
          console.log('composer end');
          break;

        case 'GOPKG.TOML':
          console.log('gopkg.toml start');
          console.log('gopkg.toml end');
          break;

        case 'GOPKG.LOCK':
          console.log('gopkg.lock start');
          console.log('gopkg.lock end');
          break;

        default:
          console.log('default case. Missed for: ', tool);
          break;
      }
      // console.log('switch output: ', output);
      return output
    })
  )
}
