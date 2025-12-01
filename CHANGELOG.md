# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2025-12-01

### Added

- Added `postSearchStop` method and `cancelled` properties
  - Handle not supported `postSearchStop` (`search/${searchID}/stop` endpoint) by intercepting `404` and returning `false`.

## [1.2.0] - 2025-11-28

### Added

- Added `getSearchResultsURL` method to get URL for search results.

### Fixed

- Added `null` value support for `LanguageCode2NameMap`.
- Fixed `QueryType` value `lex`.

## [1.1.0] - 2025-11-28

### Added

- Added CommonJS build.

### Changed

- Changed `package.json` script `prepublishOnly` to `prepare` to enable installs via git URL.

### Removed

- Removed unused `bumpp` dev dependency, added as hint to `README.md`.

## [1.0.0] - 2025-11-28

Initial release.

Extracted FCS Aggregator REST API adatper code from [`textplus-fcs-store`](https://git.saw-leipzig.de/text-plus/FCS/textplus-fcs-store) and [`fcs-sru-aggregator-ui`](https://github.com/clarin-eric/fcs-sru-aggregator-ui/) to avoid duplication and ease reuse.

### Added

- Small `tsdown` library project with License, Changelog and default configuration.
- Modularized typed interfaces with `axios` request methods.
- Mini test suite. WIP.

[Unreleased]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/releases/tag/v1.0.0
