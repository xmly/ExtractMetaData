var utils = require('./utils')
var _ = require('underscore')
var readJson = require('read-package-json')

module.exports.findExtension = function (fileName) {
  return fileName.substring(fileName.lastIndexOf('.')+1, fileName.length);
}

module.exports.findTechnology = function (extension) {
  utils.extensionMapper.find(obj => {
   return obj.fileExtension === '.'+extension.toUpperCase()
 })
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

function findFilePathBasedOnFileName (fileName, listOfFileNamesAndPaths) {
  return listOfFileNamesAndPaths.find((file) => {
    if(file.fileName.toString() === fileName.toString()){
      return file
    }
  })
}

function parsePackageJSON (filePath) {
  readJson(filePath, console.error, false, function (er, data) {
    if (er) {
      console.error("There was an error reading the file")
      return
    }
    console.log('parsed name: ', data.name);
    // console.log('parsed dependencies/frameworks: ', Object.keys(data.dependencies));
    console.log('parsed scripts: ', data.scripts);
    var result = {
      name: data.name,
      frameworks: Object.keys(data.dependencies),
      scripts: data.scripts
    }
    return result
  });
}

module.exports.findFrameworksFromBuildAndDependencyTools = function (buildAndDependencyTools, listOfFileNamesAndPaths, dirname) {

  console.log('find frameworks - b&D tools: ', buildAndDependencyTools);
  // console.log('list of file names and path: ', listOfFileNamesAndPaths);

  buildAndDependencyTools.forEach((tool) => {
    switch (tool) {
      case 'POM.XML':
        console.log('pom xml start');
        console.log('pom xml end');
        break;

      case 'BUILD.GRADLE':
        console.log('gradle start');
        console.log('gradle end');
        break;

      case 'GRUNT.JS':
        console.log('grunt start');
        console.log('grunt end');
        break;

      case 'WEBPACK.CONFIG.JS':
        console.log('WEBPACK.CONFIG.JS start');
        console.log('WEBPACK.CONFIG.JS end');
        break;

      case 'WEBPACK.CONFIG.PROD.JS':
        console.log('webpack prod start');
        console.log('calling webpack prod');
        console.log('webpack prod end');
        break;

      case 'PACKAGE.JSON':
        console.log('package.json start');
        var file = findFilePathBasedOnFileName('PACKAGE.JSON', listOfFileNamesAndPaths)
        var fPath = dirname+'/'+file.filePath
        console.log('fpath: ', fPath);
        var result = parsePackageJSON(fPath)
        console.log('package.json end ', result);
        break;

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
    console.log('switch output: ', result);
  })
}
