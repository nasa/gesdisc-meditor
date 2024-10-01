# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.10.1] - 2024-09-30

### Fixed

- `DateTimeWidget` now registers input through keyboard (typing, copy/paste).

## [1.10.0] - 2024-06-04

### Added

- `/api/models/[modelName]/validate` endpoint for strict validation of documents against their model's schema

## [1.9.13] - 2024 05-29

### Added

- changelog

### Fixed

- add NATS listeners only when there's not an existing NATS client
