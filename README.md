# deploy-gae-action

![Build Status](https://github.com/vijayp23/deploy-gae-action/workflows/Test%20Action/badge.svg)

This action will allow you to deploy [Google App Engine](https://cloud.google.com/appengine) service and delete versions which do not receive any traffic.

## Usage
```yaml
- name: Deploy google app engine
  uses: vijayp23/deploy-gae-action@1.0.0
  with:
    service-account: ${{ secrets.SERVICE_ACCOUNT }}
    project-id: ${{ secrets.PROJECT_ID }}
    config-files: './app.yml'
    # Optional
    service-version: 3                          #default value : ""
    delete-previous-versions: true              #default value : false
    service-name: ${{ secrets.SERVICE_NAME }}   #default value : default
    debug: false                                #default value : false
```
## Inputs

**Required**
* `service-account`: service account key which will be used for authentication
    *  [Create a service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)
    * Encode service account key as `base64` string 
        - `cat service-account-key.json | base64` on Linux or macOS
    * Store `base64` value in[ GitHub secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)

* `project-id`: GCP project id in which GAE service is available

* `config-files`: yaml files for the service or configurations you want to deploy

**Optional**
* `service-version`: version of the app that will be created or replaced by this deployment
* `delete-previous-versions`: set it to `true` to delete previous versions which are not receiving any traffic. If this is set to `true` then `service-name` is required
* `service-name`: name of the service of which previous versions needs to be deleted. Set it to `default` if service name is not mentioned in config file
* `debug`: test action and check version details

## Note
* You cannot delete a version of a service that is currently receiving traffic
* This action will promote the deployed version to receive all traffic and stop previously running version `--stop-previous-version`
* If the version is running on an instance of an auto-scaled service in the App Engine Standard environment, using `--stop-previous-version` will not work and the previous version will continue to run because auto-scaled service instances are always running




