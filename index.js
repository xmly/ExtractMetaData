const path = require('path');
const readdirp = require('readdirp');
var requiredFunctions = require('./requiredFunctions')
var utils = require('./utils')
const simpleGit = require('simple-git')
var prompt = require('prompt')

function readFiles(dirname) {
  return new Promise((resolve,reject) => {
    readdirp({
      root: path.join(dirname),
      fileFilter: '*',
      directoryFilter: [ '!.git', '!*modules' ],
    }, function(fileInfo) {
     // do something with file entry here
    }, function (err, res) {
      // all done, move on or do final step for all file entries here
      if(err) reject(error)

      var listOfFileNamesAndPaths = []
      res.files.forEach((file) => {
        // console.log('fname: ', file.name);
        if(!listOfFileNamesAndPaths.includes(file.name.toUpperCase())){
          // var obj = {}
          // obj[file.name.toUpperCase()] = file.path
          listOfFileNamesAndPaths.push({
            'fileName': file.name.toUpperCase(),
            'filePath': file.path
          })
        }
        resolve(listOfFileNamesAndPaths)
      })
    });
  })
}

function startParsing(dirname) {
  console.log('started startParsing');
  readFiles(dirname)
  .then((listOfFileNamesAndPaths) => {
    var extensions = requiredFunctions.findExtensions(listOfFileNamesAndPaths)
    var technology = requiredFunctions.findTechnology(extensions)

    // start step 2 : find build and dependency management tools
    var buildAndDependencyTools = requiredFunctions.findBuildAndDependencyManagementTools(listOfFileNamesAndPaths)
    // end of step 2

    // start step 3 : find framework library based on dependency management
    requiredFunctions.findFrameworksAndScriptsFromBuildAndDependencyTools(buildAndDependencyTools, listOfFileNamesAndPaths, dirname)
    .then((frameworksAndScripts) => {
      // console.log('frame index: ', frameworksAndScripts);
      var frameworksAndDependencies = []
      var scripts = []
      frameworksAndScripts.forEach(frameworkAndScript => {
        if(typeof(frameworkAndScript)!=='undefined'){ // few build tools like webpack are not parsed so return undefined
          if(frameworkAndScript.frameworks.length!==0)
            frameworksAndDependencies = frameworksAndDependencies.concat(frameworkAndScript.frameworks)
          if(frameworkAndScript.scripts.length!==0)
            scripts = scripts.concat(frameworkAndScript.scripts)
        }
      })

      var buildAndDependencyActualTools = requiredFunctions.findBuildAndDependencyToolsFromFiles(buildAndDependencyTools)

      var output = {
        name: dirname.substring(dirname.lastIndexOf('/')+1),
        technology,
        buildAndDependencyTools: buildAndDependencyActualTools,
        frameworksAndDependencies,
        scripts
      }
      return output
    }) // end of step 3
    .then((output) => {
      console.log('final output: ', output);
    })

  })
}

function main() {
  console.log('Welcome! Provide either directory path or github url: ');
  prompt.start()
  prompt.get(['input',], function (err, result) {
    if(result.input.includes('https://github.com')){
      simpleGit()
      .clone(result.input)
      .exec(() => {
        startParsing(result.input.substring(result.input.lastIndexOf('/')+1))
      })
    } else {
      startParsing(result.input)
    }
  });
}
main()
