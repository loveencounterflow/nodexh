

# NodeXH: NodeJS With a Better Exception Handler

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [What It Is](#what-it-is)
- [How to Install](#how-to-install)
- [How to Use](#how-to-use)
- [What to Expect](#what-to-expect)
- [Related](#related)
- [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## What It Is

NodeXH is a drop-in wrapper for the NodeJS executable hat provides better stacktraces.

## How to Install

`npm install -g nodexh`

## How to Use

Use `nodexh path/to/file.js` instead of `node path/to/file.js`, and you're good to go.

## What to Expect

* Stack trace items will be reversed, so most recent calls will be shown *last*, i.e. also closest to where
  the cursor of your terminal is.
* Stack traces will show source contexts (3 lines by default) except where files can not be opened or are
  NodeJS internals.
* Source code shown will honor sourcemaps, which is great when you're using the likes of CoffeeScript or
  TypeScript.
* The error message will be repeated to avoid having to scroll up when stack traces get longer.
* Colors!

## Related

* https://github.com/mozilla/source-map/
* https://sokra.github.io/source-map-visualization/
* https://medium.com/@nodejs/source-maps-in-node-js-482872b56116:
  * "In v13.7.0 a public API was introduced for interacting with source
    maps."—[link](https://nodejs.org/dist/latest-v14.x/docs/api/all.html#modules_source_map_v3_support)
  * "You can start using Node.js’ source map functionality today: make sure you have an up-to-date version
    of Node.js installed, and run your programs with the flag --enable-source-maps."

## To Do

* [ ] Add `error.name`, `error.code`; where `node` reports `TypeError: TEMPLATES.main_2 is not a function`,
  `nodexh` only reports `EXCEPTION: TEMPLATES.main_2 is not a function`
* [ ] visually indicate spot of error (e.g. by reversing)
* [ ] fix async stacktraces (probably not yet handled correctly; might be issue with `stackman`?)
* [ ] consider [utf8ize-sourcemaps](https://github.com/twada/utf8ize-sourcemaps) in case there should be
  problems w/ 32bit characters
* [ ] truncate long lines in context
* [ ] offer capabilities of NodeXH as API so applications (such as test libraries) can easily retrieve
  source code, display source lines with contexts



