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

let dirname = '../../../../GNSTemple/code/gns-temp/'

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
  readdirp({
    root: path.join(dirname),
    fileFilter: '*.*',
    directoryFilter: [ '!.git', '!*modules' ],
  }, function(fileInfo) {
   // do something with file entry here
  }, function (err, res) {
    // all done, move on or do final step for all file entries here
    var listOfFileNames = []
    res.files.forEach((file) => {
      // console.log('fname: ', file.name);
      if(!listOfFileNames.includes(file.name)){
        listOfFileNames.push(file.name)
      }
      let extension = requiredFunctions.findExtension(file.name)
      if(!extensions.includes(extension)){
        extensions.push(extension)
      }
    })

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

    console.log('runTimes: ', runTimes);
    console.log('unknownRunTimes: ', unknownRunTimes);

    // start step 2 : find build and dependency management tools
    var buildAndDependencyTools = requiredFunctions.findBuildAndDependencyManagementTools(listOfFileNames)
    // end of step 2

    // start step 3 : find framework library based on dependency management
    // end of step 3

    // start step 4 : extract build and run commands
    // end of step 4
  });
}


function main() {
  console.log('started main');
  readFiles()
}

main()
