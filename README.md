# Extract Meta data from Git repo or local dir

This is a nodejs project to extract information from a project directory about run times, technologies used, build and dependency tools, dependencies, frameworks, scripts.


## Start the app
To run the app:

* Clone the repo and start
  - `git clone`
  - `cd appName`
  - `npm run start`

* User is supposed to provide one of the following inputs:
  - Github URL - public
  - Directory path - absolute


## Supported Technologies

  - The following technologies are parsed using this tool:
    - Java : Maven, Gradle
    - Node : Package.json
    - Yarn : yarn.lock
    - Go : Gopkg.toml
    - Ruby : Gemfile
    - Python : Requirements.txt

  - I am parsing the meta data using this [list](https://github.com/PhaniKumarAdiraju/ExtractMetaData/blob/master/utils.js), so you will see unknownRunTimes in the output. You can add more extensions to parse more technologies

## Example
 - Input given by user: `https://github.com/PhaniKumarAdiraju/Readable-react-nanodegree`
 - Expected output is as follows:
  ```
  {
    name: 'Readable-react-nanodegree',
    technology: {
      runTimes: [
       'Markdown Documentation File',
       'XML',
       'IntelliJ IDEA Module',
       'JavaScript',
       'CSS',
       'SVG',
       'HTML'
     ],
      unknownRunTimes: [
        '.JSON',
        '.LOCK',
        '.ICO',
        '.PNG'
      ]
    },
    buildAndDependencyTools: [
      'NODE',
      'YARN'
    ],
    frameworksAndDependencies: [
      'loadash',
      'react',
      'react-dom',
      'react-dropdown',
      'react-redux',
      'react-router-dom',
      'react-scripts',
      'redux',
      'redux-thunk',
      'sort-by'
    ],
    scripts: [
      {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test --env=jsdom',
        eject: 'react-scripts eject'
      }
    ]
  }
  ```
