---
title: Changelog
---

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   RESTful API endpoints that match all functionality for all existing API endpoints
-   API documentation for RESTful API
-   Support for AWS' Simple Email Service in the Notifier service
-   Many unit, integration, and end-to-end tests to the codebase

### Changed

-   Workflows can now allow validation errors for their documents
-   Default user roles assigned during setup process can now be customized through an environment variable

### Fixed

-   Fixed header links in embedded Jupyter Notebooks 404ing

### Security

-   Required an authenticated user for access to protected endpoints
-   Upgraded internal app dependencies

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
