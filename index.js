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

let dirname = '../../../../GNSTemple/code/'

var extensions = []
var runTimes = []
var unknownRunTimes = []

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
    console.log('extensions length: ', extensions);
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
    console.log('runTimes: ', runTimes)
    console.log('unknownRunTimes: ', unknownRunTimes);
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
