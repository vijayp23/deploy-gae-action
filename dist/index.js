module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 405:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const core = __webpack_require__(250);
const execSync = __webpack_require__(129).execSync;
const fs = __webpack_require__(747);

async function run() {

  const keyFile = `/tmp/${(new Date()).getTime()}.json`;
  const projectId = core.getInput('project-id');
  const configFile = core.getInput('config-files');
  const serviceVersion = core.getInput('service-version');
  const serviceName = core.getInput('service-name');
  const deletePrevVersions = core.getInput('delete-previous-versions');
  var isDebug = core.getInput('debug');

  var versionFlag = "";

  try {

    if (serviceVersion != "") {
      versionFlag = "--version=" + serviceVersion;
    }

    core.startGroup('Copy service account');
    console.log('Copy service account');
    const keyFileBase64 = core.getInput('service-account')
    const keyFileContents = Buffer.from(keyFileBase64, 'base64').toString()
    fs.writeFileSync(keyFile, keyFileContents);
    core.endGroup();

    core.startGroup('Activate service account');
    console.log('Activate service account');
    execSync(`gcloud auth activate-service-account --key-file ${keyFile}`, { stdio: 'inherit' });
    core.endGroup();

    core.startGroup('deploy google app engine');
    if (isDebug) {
      console.log("gcloud app deploy --appyaml ${configFile} --project=${projectId} ${serviceVersion} --promote --stop-previous-version");
    } else {
      execSync(`gcloud app deploy --appyaml ${configFile} --project=${projectId} ${versionFlag} --promote --stop-previous-version`, { stdio: 'inherit' });
    }
    core.endGroup();
  }
  catch (error) {
    core.setFailed(error.message);
  }

  if (deletePrevVersions) {

    if (serviceName == "") {
      console.error('Please provide service name...');
    } else {
      try {
        core.startGroup('List of all available versions');
        execSync(`gcloud app services list --format="table[box,title='Version List'](versions.id:label=VERSION,versions.traffic_split,versions.last_deployed_time.datetime:sort=1:label=DEPLOYED_TIME)" --flatten=versions --project=${projectId} --filter="id:(${serviceName})"`, { stdio: 'inherit' });
        core.endGroup();

        core.startGroup('Delete versions');

        for (var service in serviceName) {
          console.log('List versions to be deleted in service - ' + service);
          console.log("");
          var versionList = JSON.parse(execSync(`gcloud app versions list --project=${projectId} --service=${service} --filter=TRAFFIC_SPLIT=0 --sort-by=~"last_deployed_time" --format="json"`).toString());
          var versions = "";
          for (var index in versionList) {
            if (index > retainVersions - 1) {
              console.log("Version: " + versionList[index]["id"] + " DeployedOn: " + versionList[index]["last_deployed_time"]["datetime"]);
              versions += versionList[index]["id"] + " ";
            }
          }

          if (versions == "") {
            isDebug = true;
            console.log("There are no versions available to delete..");
          }

          if (isDebug) {
            console.log("gcloud app versions delete --project=${projectId} --service=${service} ${versions} --quiet");
          } else {
            console.log('Deleting versions - ' + versions);
            execSync(`gcloud app versions delete --project=${projectId} --service=${service} ${versions} --quiet`, { stdio: 'inherit' });
            
          }

          console.log("");
        }

        core.endGroup();
      }
      catch (error) {
        core.setFailed(error.message);
      }
    }
  }

  try {
    core.startGroup('Remove service account');
    fs.unlinkSync(keyFile);
    core.endGroup();
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();

/***/ }),

/***/ 250:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(405);
/******/ })()
;