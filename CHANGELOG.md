# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.0] - 2026-09-02

### Added

- Github CI based publishing

### Changed

- Updated Lex data view fields for LexFCS 1.0
- Updated dev dependencies

## [2.1.0] - 2026-06-24

### Added

- Response caching (`ETag` support) for `doGet`
  - `utils.ts#CustomParams` has two new optional parameters:
    - `enableETagCache`: if GET `fetch` calls should try to use `ETag` for caching, (default: `false`)
    - `cacheStorage`: Storage-like, use custom `RAMStorage` (as default Storage, `sessionStorage` is likely limited to ~5MB which might be exceeded easily)
  - add tests for response caching

## [2.0.1] - 2026-06-23

### Added

- `utils.ts#RequestError` error class to wrap request `method`, `url` and response `status` code for errors
  - `response.json()` errors should be simple `TypeError` and are unhandled

### Fixed

- handling of `resourceId` array in `results.ts#postSearch`

## [2.0.0] - 2026-06-19

### Changed

- **Breaking**: removed `axios` dependency and switch to native `fetch`
- Updated dev dependencies

## [1.5.1] - 2026-02-17

### Changed

- Bump dependencies (`axios` to 1.13.5, + dev dependencies)

## [1.5.0] - 2026-01-27

### Changed

- Relax interface for `getURLForDownload` and `getURLForWeblicht` methods: arguments `language` and `languageFilter` are now optional and nullable
- Bump dependencies (`axios` to 1.13.3, + dev dependencies)

## [1.4.0] - 2026-01-09

### Changed

- Bump dev dependencies
- Changed package name to include `@clarin-eric/` organization scope

### Removed

- Removed `prepare` script from `package.json`, used for git+tag URL installs

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

[Unreleased]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.5.1...v2.0.0
[1.5.1]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/clarin-eric/fcs-sru-aggregator-api-adapter-typescript/releases/tag/v1.0.0
