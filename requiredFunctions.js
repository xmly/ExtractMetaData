var utils = require('./utils')
var _ = require('underscore')

module.exports.findExtension = function (fileName) {
  return fileName.substring(fileName.lastIndexOf('.')+1, fileName.length);
}

module.exports.findTechnology = function (extension) {
  utils.extensionMapper.find(obj => {
   return obj.fileExtension === '.'+extension.toUpperCase()
 })
}

module.exports.findBuildAndDependencyManagementTools = function (listOfFileNames) {
  var buildAndDependencyList = [
    'pom.xml, build.gradle', // java
    'Grunt.js', 'webpack.config.js', 'webpack.config.dev.js', 'webpack.config.prod.js','webpackDevServer.config.js', // javascript
    'package.json', // node
    'composer.json', //php
    'gopkg.toml', 'gopkg.lock' // Go
    // Ruby - interpreted language so no build tools
    // Python - pip : scan all files for imports
  ]
  // console.log('exp findB&D: ', listOfFileNames);

  var result = _.intersection(buildAndDependencyList, listOfFileNames)
  console.log('res intesection: ', result);

}
