# Changelog

All notable changes to Meditor should be documented in this file.

## [0.50.0] - 2019-06-10

### Changed
- streamlined image publishing to UUI

## [0.49.0] - 2019-05-24

### Changed
- Push new models (Data In Action, Data Release, Service Release) to the News model in UUI
- Constrain all containers to primary node

## [0.48.0] - 2019-05-21

### Changed
- Add mapping of new models to UUI

## [0.47.0] - 2019-05-20

### Added
- Create new publishable models: Data Release and Service Release

### Changed
- Fix "disable save button if no changes" on document edit page, occasional JS error would occur with missing keys in API response

## [0.46.0] - 2019-05-17

### Added
- Automated testing with Cypress

### Changed
- Add constraint to the database container so it only runs on the primary node

## [0.45.0] - 2019-05-07

### Added
- Support for Foto uploads in image upload widget

## [0.40.0-0.44.0] - 2019-04-25

Multiple releases in this timeframe due to having to test functionality live, revise, and redeploy.

### Added

- Page titles
- CKEditor indentation support
- Handle non-existent document states when a document's workflow is changed

### Changed
- Push all drafts to test on save
- Disable saving unless there are changes
- Support for Foto uploads in CKEditor widget
- Fix add document button occasionally not showing up

### Removed
- Push to test

### Changed
- image upload URL depends on environment

## [0.39.0] - 2019-03-05

### Changed
- better date handling for dates pushed to UUI
- use published date instead of modified date

## [0.38.0] - 2019-05-01

### Added
- Include notification template in notification emails

### Changed
- Keep last published document in UUI
- Support pushing multiple Meditor models into a single UUI model

## [0.37.0] - 2019-02-19

### Changed
- CKEditor autogrow plugin was not initializing

## [0.36.0] - 2019-02-14

### Added
- Commenter role, only show comments to those with this role

### Changed
- Saving a document was not using 'title' instead of the titleProperty

## [0.35.0] - 2019-02-07

### Changed
- change help document location

## [0.34.0] - 2019-02-05

### Changed
- extend notification email to include current state information
- CC author to notification emails

## [0.33.0] - 2019-01-31

### Changed
- don't allow state changes of a modified document, such as submit for review, until a document has been saved
- add ENV variables to notifier
- remove 'Upload  to Server' from CKEditor

## [0.32.0] - 2019-01-28

### Changed
- dependency 'http-server' needs to be bundled into the docker image

## [0.31.0] - 2019-01-28

### Added
- publishing from Meditor to multiple instances of UUI

### Changed
- modifying notifier config to fix issue with email notifications not being sent out
- notifier should use the UI URL not the server URL when including links in emails
- notifier not reading the hostname of the server correctly, passing it through the deploy command
- new documents was always showing "You have unsaved changes" even if you hadn't modifed it

## [0.30.0] - 2019-01-16

### Changed
- status service (Docker) should only run once
- increase Node.js memory for the server
- ensure Mongo connections are properly closed

## [0.29.0] - 2019-01-14

### Changed
- make session cookie static, fixes issue where server downtime would cause loss of user's session and force them to log back in too often
- allow Portainer to access service console

## [0.28.0] - 2019-01-11

### Added
- edit comments on documents
- notification of unsaved document changes when navigating away from the document edit screen

## [0.26.0] - 2019-01-03

### Added
- close icon to history sidenav for consistency
- release docker images individually
- help document

### Changed
- show expand only for layouts with sections
- encode title of document before navigating to document edit

## [0.25.0] - 2019-12-21

### Added
- make all links real links (able to be opened in a new tab), instead of anchors

## [0.24.0] - 2019-12-21

### Added
- breadcrumbs on document edit page
- session timeout notification instead of immediately redirecting when users session times out



[0.50.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.49.0&until=0.50.0
[0.49.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.48.0&until=0.49.0
[0.48.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.47.0&until=0.48.0
[0.47.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.46.0&until=0.47.0
[0.46.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.45.0&until=0.46.0
[0.45.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.44.0&until=0.45.0
[0.40.0-0.44.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.39.0&until=0.44.0
[0.39.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.38.0&until=0.39.0
[0.38.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.37.0&until=0.38.0
[0.37.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.36.0&until=0.37.0
[0.36.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.35.0&until=0.36.0
[0.35.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.34.0&until=0.35.0
[0.34.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.33.0&until=0.34.0
[0.33.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.32.0&until=0.33.0
[0.32.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.31.0&until=0.32.0
[0.31.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.30.0&until=0.31.0
[0.30.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.29.0&until=0.30.0
[0.29.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.28.0&until=0.29.0
[0.28.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.27.0&until=0.28.0
[0.27.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.26.0&until=0.27.0
[0.26.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.25.0&until=0.26.0
[0.25.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.24.0&until=0.25.0
[0.24.0]: https://git.earthdata.nasa.gov/projects/MEDITOR/repos/meditor/commits?since=0.23.0&until=0.24.0