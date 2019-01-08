const path = require('path');
const { EOL } = require('os');
const { Transform } = require('stream');
const readdirp = require('readdirp');

/*
 * Print out all JavaScript files within the current folder and
 * subfolders along with their size.
 */

let dirname = '../../../../GNSTemple/code/'

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
  .on('end', () => console.log('done'))
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
    console.log('entry: ', entry)
  });