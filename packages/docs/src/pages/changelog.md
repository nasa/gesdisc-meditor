---
title: Changelog
---

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Guiding Principles for Authors

-   Changelogs are for humans, not machines.
-   There should be an entry for every single version.
-   The same types of changes should be grouped.
-   Versions and sections should be linkable.
-   The latest version comes first.
-   The release date of each version is displayed.

### Types of changes

-   **`Added`** for new features.
-   **`Changed`** for changes in existing functionality.
-   **`Deprecated`** for soon-to-be removed features.
-   **`Fixed`** for any bug fixes.
-   **`Removed`** for now removed features.
-   **`Security`** in case of vulnerabilities.

## [1.9.12] - 2022-11-07

### Added

-   Adds RESTful endpoints for initial mEditor setup, document comments, and document history. These endpoints are part of the effort to open source mEditor, the old endpoints are still available and will redirect to the new RESTful endpoints.
    -   /api/model/{modelName}/documents/{documentTitle}/comments
    -   /api/model/{modelName}/documents/{documentTitle}/history
    -   /api/admin/seed-db (initial mEditor setup, rarely used)

### Fixed

-   Fixes a "Collection Metadata" bug where mEditor was publishing the wrong boolean value for the field "Ends_At_Present_Flag" to CMR. The "Collection Metadata" schema defines this field as a string, so the string value "false" was being sent to CMR as boolean `true`.

## [1.9.10] - 2022-09-02

### Added

-   Add ability to publish Mission/Project pages from mEditor to UUI website
-   Added "Standard Product" field to the Collection Metadata model
    -   "A new directive from ESDIS is that the current Standard Product tagging system will be deprecated, and replaced with a collection metadata field that signifies if that collection is considered an EOSDIS Standard Product. We need to update our collection metadata records accordingly to indicate those that are EOSDIS Standard Products by the September 1 deadline."

## [1.9.9] - 2022-07-06

### Added

-   Jupyter Notebook embedding added to WYSIWYG editor. Can be used to embed Jupyter Notebooks in UUI website
-   Added support for RESTful endpoints (old URLs redirect to new):
    -   /listModels -> /models
    -   /listDocuments?model={modelName} -> /models/{modelName}/documents

### Changed

-   Performance improvements to the /listModels and /listDocuments endpoints

## [1.9.6] - 2022-05-18

### Changed

-   Update cmr-meditor-subscriber to use UMM-C v1.7.0
    -   CMR collection PUTs will include the specific version of the UMM-C schema to ensure future UMM-C updates don't break mEditor publishing of collections. The version is contained in the Content-Type header:

```bash
'Content-Type': 'application/vnd.nasa.cmr.umm+json;version=1.17.0'
```

## [1.9.5] - 2022-03-30

### Added

-   Adding mEditor support for publishing "Variable Metadata" to CMR
-   AWS Cognito integration as alternative to Earthdata Pub

### Changed

-   Upgrade NGINX to 1.21.6 (resolves TT48405)

### Fixed

-   Validate Collection Metadata EntryID matches the ShortName/Version before interacting with CMR

## [1.9.3] - 2021-12-13

### Added

-   add Direct Distribution information for AWS enabled Collections
-   add new GCMD URL Content Types for related URLs in Collections
-   add support for deleting from all baselines (CMR UAT/PROD and UUI TEST/PROD) when a document moves to "Deleted" state
-   add support for redirecting (optionally, through an ENV var) to a URL after a document is published (created for Earthdata Pub support)
-   Add "notifyRole" to workflows for specifying a role to send email notifications to. This will be used to reduce notifications sent when Collections are created/updated.
-   add support to ConcatenatedField Widget to associate Variable Metadata records with Collections

### Fixed

-   Collection Metadata: removing identifier from a Persistent identifier caused a Missing DOI error to be returned from CMR
-   Collection Metadata: Dataset_Citation should be optional

## [1.8.9] - 2021-05-24

### Added

-   new Worldview Embed plugin in CKeditor for Embedding Worldview

## [1.8.6] - 2021-04-07

### Changed

-   Updated the CMR subscriber to handle the new UseConstraints CMR schema

## [1.8.5] - 2021-04-01

### Added

-   Show past states in the history sidebar
-   New JSON editor for modifying the JSON source of a document
-   Download the JSON source of a document from the JSON editor panel
-   JSON diff viewer for viewing the differences between versions of a document

### Changed

-   mEditor-CMR Publisher has been updated to support the latest DOI changes in CMR's schema

### Fixed

-   fix the issue of videos being removed from the WYSIWYG editor when switching from "Source" to "Visual" mode

## [1.5.0] - 2020-09-04

### Added

-   /api/listDocuments
    -   Added search filter (filter=QUERY). See doc for examples
-   /api/changeDocumentState
    -   Pass notify=false to disable notifications (useful for bulk publishing records without causing email spam)

### Changed

-   /api/getDocument
    -   removed the model schema, layout, and other unnecessary properties from the response (multiple requests for this from science team)

### Fixed

-   Hide form actions if user has no actions to perform
-   Failure to send notification doesn't block document state changes anymore
-   Add uri-reference as a format the link checker will test (fixes issue where link checker doesn't run in Collection Metadata)
