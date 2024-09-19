# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0-beta] - 2024-09-20

### Added

- Out of alpha, shelly now strictly follows Semantic Versioning;
- Comprehensive DOM Diagram (see the [media](media) folder);
- A spreadsheet detailing concepts involved in developing the history feature and a few tests done with the concept (see the [documentation](documentation) folder).
- A way to initialize shelly programmatically (#3);
- Since shelly is now instantiable, multiple shellys can coexist (do I hear "tiling"?); 
- Each shelly instance gets an id, which is also used as it's element `id` attribute;
- shelly now stores history and, if available, persists it to local storage (#5);
- shelly now has client-side commands (#6);
- The history object to config;
- Shelly has a static method for generating random strings to be used as the instance's id and/or cache-breaking query strings.

### Changed

- shelly is now OOP;
- All code uses camelCase/SmartCase;
- `API.url_separator` config option is now `API.urlSeparator`;
- `API.proto_separator` config option is now `API.protoSeparator`;
- The configuration object is now named `shellyConfig` and commands are now named `shellyCommands` in order to avoid naming conflicts;
- Configuaration is now passed as `JSON.stringify` so shelly can try parsing it and emitting an exception in case of failure;
- MOTD is now centralized.
