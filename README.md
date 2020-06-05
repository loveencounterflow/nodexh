
# NodeXH: NodeJS Exception Handler

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [cnd](#cnd)
  - [CND Interval Tree](#cnd-interval-tree)
  - [CND Shim](#cnd-shim)
  - [CND TSort](#cnd-tsort)
    - [TSort API](#tsort-api)
    - [Some TDOP Links](#some-tdop-links)
  - [XJSON](#xjson)
  - [CND.TEXT.to_width](#cndtextto_width)
  - [ToDo](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

NodeXH is a drop-in wrapper for the NodeJS executable hat provides better stacktraces. Just `npm install -g
nodexh`, then use `nodexh path/to/file.js` instead of `node path/to/file.js`, and you're good to go.

* Stack trace items will be reversed, so most recent calls will be shown *last*, i.e. also closest to where
  the cursor of your terminal is.
* Stack traces will show source contexts (3 lines by default) except where files can not be opened or are
  NodeJS internals.
* Source code shown will honor sourcemaps, which is great when you're using the likes of CoffeeScript or
  TypeScript.
* The error message will be repeated to avoid having to scroll up when stack traces get longer.
* Colors!



