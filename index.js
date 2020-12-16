const core = require('@actions/core');
const execSync = require('child_process').execSync;
const fs = require('fs');

async function run() {

  const keyFile = `/tmp/${(new Date()).getTime()}.json`;
  const projectId = core.getInput('project-id');
  const configFile = core.getInput('config-files');
  const serviceVersion = core.getInput('service-version');
  const serviceName = core.getInput('service-name');
  const deletePrevVersions = core.getInput('delete-previous-versions');
  var isDebug = core.getInput('debug');  
  const noCache = core.getInput('no-cache');

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
      console.log(`gcloud app deploy ${noCache ? '--no-cache'} --appyaml=${configFile} --project=${projectId} ${serviceVersion} --promote --stop-previous-version`);
    } else {
      execSync(`gcloud app deploy ${noCache ? '--no-cache'} --appyaml=${configFile} --project=${projectId} ${versionFlag} --promote --stop-previous-version`, { stdio: 'inherit' });
    }
    core.endGroup();
  }
  catch (error) {
    core.setFailed(error.message);
  }

  if (deletePrevVersions) {

    if (serviceName == "") {
      console.error('Please provide service name...');
      throw new Error('Service Name is empty');
    } else {
      try {
        core.startGroup('List of all available versions');
        execSync(`gcloud app services list --format="table[box,title='Version List'](versions.id:label=VERSION,versions.traffic_split,versions.last_deployed_time.datetime:sort=1:label=DEPLOYED_TIME)" --flatten=versions --project=${projectId} --filter="id:(${serviceName})"`, { stdio: 'inherit' });
        core.endGroup();

        core.startGroup('Delete versions');

        serviceName.split(',').forEach(function(service){
          console.log('List versions to be deleted in service - ' + service);
          console.log("");
          var versionList = JSON.parse(execSync(`gcloud app versions list --project=${projectId} --service=${service} --filter=TRAFFIC_SPLIT=0 --sort-by=~"last_deployed_time" --format="json"`).toString());
          var versions = "";
          for (var index in versionList) {
              console.log("Version: " + versionList[index]["id"] + " DeployedOn: " + versionList[index]["last_deployed_time"]["datetime"]);
              versions += versionList[index]["id"] + " ";
          }

          if (versions == "") {
            console.log("There are no versions available to delete..");
          } else {
            if (isDebug) {
              console.log(`gcloud app versions delete --project=${projectId} --service=${service} ${versions} --quiet`);
            } else {
              console.log('Deleting versions - ' + versions);
              execSync(`gcloud app versions delete --project=${projectId} --service=${service} ${versions} --quiet`, { stdio: 'inherit' });
            }
          }
          console.log("");
        })

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
