const path = require('path');
const readdirp = require('readdirp');
var requiredFunctions = require('./requiredFunctions')
var utils = require('./utils')

const dirname = '../../../../GNSTemple/code/gns-temp'
const dirname2 = '../TestProjects/javatest-maven'
const dirname3 = '../TestProjects/javatest-gradle'

function readFiles() {
  return new Promise((resolve,reject) => {
    readdirp({
      root: path.join(dirname),
      fileFilter: '*.*',
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

function main() {
  console.log('started main');
  readFiles()
  .then((listOfFileNamesAndPaths) => {
    var extensions = requiredFunctions.findExtensions(listOfFileNamesAndPaths)
    var technology = requiredFunctions.findTechnology(extensions)

    // start step 2 : find build and dependency management tools
    var buildAndDependencyTools = requiredFunctions.findBuildAndDependencyManagementTools(listOfFileNamesAndPaths)
    // end of step 2

    var output = {
      listOfFileNamesAndPaths,
      extensions,
      technology,
      buildAndDependencyTools
    }
    console.log('output read then: ', output);

  })
}

main()
