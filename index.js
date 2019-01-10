const path = require('path');
const { EOL } = require('os');
const { Transform } = require('stream');
const readdirp = require('readdirp');
var requiredFunctions = require('./requiredFunctions')
var utils = require('./utils')

/*
 * Print out all JavaScript files within the current folder and
 * subfolders along with their size.
 */

let dirname = '../../../../GNSTemple/code/gns-temp'
const dirname2 = '../TestProjects/javatest-maven'
const dirname3 = '../TestProjects/javatest-gradle'

var extensions = []
var runTimes = []
var unknownRunTimes = []

function extractRunTimes() {
  const entryInfoStream = readdirp({
    root: path.join(dirname),
    fileFilter: '*.*',
    directoryFilter: [ '!.git', '!*modules' ],
  });

  entryInfoStream
    .on('warn', (err) => {
      console.error('non-fatal error', err);
      // Optionally call stream.destroy() here in order to abort and cause 'close' to be emitted
    })
    .on('error', err => console.error('fatal error', err))
    .on('end', () => {
      extensions.forEach((extension) => {
        let runTime = utils.extensionMapper.find(obj => {
          // console.log('ext findTech: ', '.'+extension.toUpperCase());
         return obj.fileExtension === '.'+extension.toUpperCase()
       })
       if(typeof(runTime)!=='undefined' && !runTimes.includes(runTime)){
         runTimes.push(runTime.technology)
       }
       if(typeof(runTime)==='undefined' && !runTimes.includes(runTime)){
         unknownRunTimes.push(extension)
       }
      })
      var result = 'hi'
      return result
    })
    .pipe(new Transform({
      objectMode: true,
      transform(entryInfo, encoding, callback) {
        // Turn each entry info into a more simplified representation
        this.push({ path: entryInfo.path, size: entryInfo.stat.size });
        callback();
      },
    }))
    .pipe(new Transform({
      objectMode: true,
      transform(entryInfo, encoding, callback) {
        // Turn each entry info into a string with a line break
        this.push(`${JSON.stringify(entryInfo)}${EOL}`);
        callback();
      },
    }))
    .on('data', function (entry) {
      let extension = requiredFunctions.findExtension(JSON.parse(entry).path)
      if(!extensions.includes(extension)){
        extensions.push(extension)
      }
      // -- need to check for gradle, maven, ant, webpack, nodemodules, git etc
    })

}

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
