(function() {
  'use strict';
  var FS, GUY, PATH, _exit_handler, _get_context, alert, bold, cyan, debug, echo, exit_handler, fetch_mapped_location, get_context, get_error_callsites, get_stacktracey, gold, green, grey, help, info, inspect, isa, load_source_map, log, plain, praise, red, reverse, rpr, show_error_with_source_context, show_stacktracey, steel, type_of, types, underline, urge, warn, whisper, white, write_to_stderr, yellow;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('NODEXH'));

  ({rpr, inspect, echo, log} = GUY.trm);

  types = new (require('intertype')).Intertype();

  ({isa, type_of} = types);

  // stackman                  = ( require 'stackman' )()
  get_error_callsites = require('error-callsites');

  load_source_map = (require('util')).promisify(require('load-source-map'));

  FS = require('fs');

  PATH = require('path');

  ({red, green, steel, grey, cyan, bold, gold, white, yellow, reverse, underline, bold} = GUY.trm);

  //-----------------------------------------------------------------------------------------------------------
  write_to_stderr = function(...P) {
    return process.stderr.write(' ' + (GUY.trm.pen(...P)) + '\n');
  };

  //-----------------------------------------------------------------------------------------------------------
  fetch_mapped_location = async function(path, linenr, colnr) {
    var error, mapped_path, smp, sourcemap;
    try {
      sourcemap = (await load_source_map(path));
      smp = sourcemap.originalPositionFor({
        line: linenr,
        column: colnr
      });
    } catch (error1) {
      error = error1;
      // warn '^7763-3^', "!!!!!!!!!!!!!!!!!", { path, }
      // warn '^7763-3^', "!!!!!!!!!!!!!!!!!", error.message
      return {path, linenr, colnr};
    }
    //.........................................................................................................
    if ((smp != null) && (smp.source != null) && (smp.source !== '') && (smp.line != null) && (smp.column != null)) {
      mapped_path = PATH.join(PATH.dirname(path), smp.source);
      return {
        path: mapped_path,
        linenr: smp.line,
        colnr: smp.column
      };
    }
    //.........................................................................................................
    return {path, linenr, colnr};
  };

  //-----------------------------------------------------------------------------------------------------------
  get_context = function(path, linenr, colnr, width) {
    var error;
    try {
      return _get_context(path, linenr, colnr, width);
    } catch (error1) {
      error = error1;
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    return [];
  };

  //-----------------------------------------------------------------------------------------------------------
  // return [ ( red "!!! #{rpr error.message} !!!" ), ]
  _get_context = function(path, linenr, colnr, width) {
    /* TAINT perform line length adjustment, hiliting in dedicated method */
    var R, c0, c1, coldelta, delta, effect, first_idx, hilite, i, idx, last_idx, len, line, lines, ref, this_linenr, this_linenr_txt, width2;
    lines = (FS.readFileSync(path, {
      encoding: 'utf-8'
    })).split('\n');
    delta = 1;
    coldelta = 5;
    effect = reverse;
    first_idx = Math.max(0, linenr - 1 - delta);
    last_idx = Math.min(lines.length - 1, linenr - 1 + delta);
    R = [];
    ref = lines.slice(first_idx, +last_idx + 1 || 9e9);
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      line = ref[idx];
      this_linenr = first_idx + idx + 1;
      this_linenr_txt = (this_linenr.toString().padStart(4)) + '│ ';
      if (this_linenr !== linenr) {
        /* TAINT should adjust overlong context lines as well */
        R.push(`${grey(this_linenr_txt)}${grey(line)}`);
        continue;
      }
      c0 = colnr - 1;
      c1 = colnr + coldelta;
      hilite = effect(line.slice(c0, c1));
      line = line.slice(0, c0) + hilite + line.slice(c1);
      if (c1 > width) {
        width2 = Math.floor(width / 2);
        line = '... ' + line.slice(c1 - width2, +(c1 + hilite.length - (c1 - c0) + width2) + 1 || 9e9) + ' ...';
      } else {
        line = line.slice(0, +width + 1 || 9e9);
      }
      R.push(`${grey(this_linenr_txt)}${cyan(line)}`);
    }
    // R = R.join '\n'
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  show_error_with_source_context = async function(error, headline) {
    /* TAINT use proper methods to format with multiple colors */
    var arrowhead, arrowshaft, callsite, callsites, colnr, context_line, fname, fname_txt, i, j, len, len1, linenr, path, ref, ref1, ref2, relpath, width, width1;
    /* From https://github.com/watson/stackman#gotchas: "This module works because V8 (the JavaScript engine
         behind Node.js) allows us to hook into the stack trace generator function before that stack trace is
         generated. It's triggered by accessing the .stack property on the Error object, so please don't do
         that before parsing the error to stackman, else this will not work!" */
    alert('^77765-1^', reverse(bold(headline)));
    arrowhead = white('▲');
    arrowshaft = white('│');
    width = process.stdout.columns;
    callsites = get_error_callsites(error);
    //.........................................................................................................
    if ((callsites == null) || (callsites.length === 0)) {
      write_to_stderr(red(reverse("^455756^ error has no associated callsites:")));
      write_to_stderr(red(reverse(rpr(error))));
      return null;
    }
    //.........................................................................................................
    callsites.reverse();
//.........................................................................................................
    for (i = 0, len = callsites.length; i < len; i++) {
      callsite = callsites[i];
      path = callsite.getFileName();
      //.......................................................................................................
      if (path == null) {
        write_to_stderr(grey('—'.repeat(108)));
        continue;
      }
      //.......................................................................................................
      linenr = callsite.getLineNumber();
      colnr = callsite.getColumnNumber();
      //.......................................................................................................
      if ((path.startsWith('node:internal/')) || (path.startsWith('internal/'))) {
        write_to_stderr(arrowhead, grey(`${path} @ ${linenr},${colnr}`));
        continue;
      }
      //.......................................................................................................
      // write_to_stderr()
      // write_to_stderr steel bold reverse ( "#{relpath} ##{linenr}:" ).padEnd 108
      fname = (ref = (ref1 = callsite.getFunctionName()) != null ? ref1 : callsite.getMethodName()) != null ? ref : null;
      ({path, linenr, colnr} = (await fetch_mapped_location(path, linenr, colnr)));
      relpath = PATH.relative(process.cwd(), path);
      if (fname != null) {
        fname_txt = steel(fname);
        width1 = width + (fname_txt.length - fname.length);
        write_to_stderr(arrowhead, gold(`${relpath} @ ${linenr},${colnr}: ${fname_txt}() \x1b[38;05;234m`.padEnd(width1, '—')));
      } else {
        write_to_stderr(arrowhead, gold(`${relpath} @ ${linenr},${colnr}: \x1b[38;05;234m`.padEnd(width, '—')));
      }
      ref2 = (await get_context(path, linenr, colnr, width));
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        context_line = ref2[j];
        write_to_stderr(arrowshaft, context_line);
      }
    }
    alert('^77765-2^', reverse(bold(headline)));
    // urge "^94843^ error.stack:", rpr error.stack
    // urge "^94843^ error.message:", rpr error.message
    // urge "^94843^ error.code:", rpr error.code
    // urge "^94843^ error.name:", rpr error.name
    // urge "^94843^ error.type:", rpr error.type
    // urge "^94843^ error.toString():", rpr error.toString()
    // urge "^94843^ error:", rpr error
    // CATALOGUING = require '../../multimix/lib/cataloguing'
    // urge "^94843^", ( CATALOGUING.all_keys_of error )
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  _exit_handler = async function(error, origin) {
    var message, ref, ref1, ref2, type;
    /* TAINT origin never used */
    // show_stacktracey error
    // debug '^4488^', error
    // debug '^4488^', await origin
    // return null
    type = (ref = (ref1 = error.code) != null ? ref1 : error.name) != null ? ref : 'EXCEPTION';
    message = ` ${type}: ` + ((ref2 = error != null ? error.message : void 0) != null ? ref2 : "an unrecoverable condition occurred");
    await show_error_with_source_context(error, message);
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  exit_handler = async function(error, origin) {
    await _exit_handler(error, origin);
    setImmediate((function() {
      return process.exit(111);
    }));
    return null;
  };

  //###########################################################################################################
  //###########################################################################################################
  //###########################################################################################################
  get_stacktracey = function(error) {
    var R, StackTracey, d, i, idx, ref, s, stack;
    StackTracey = require('stacktracey');
    stack = (new StackTracey(error)).withSources();
    // stack = stack.clean()
    R = [];
    for (idx = i = ref = stack.items.length - 1; i >= 0; idx = i += -1) {
      d = stack.items[idx];
      // debug '^2798^', ( k for k of d )
      s = {
        // target_path:    d.file
        relpath: d.fileRelative, // fileShort
        native: d.native,
        // is_nodejs:      d.native
        is_other: d.thirdParty,
        line: d.line,
        column: d.column,
        source: d.sourceLine,
        error: d.error
      };
      // for k in [ 'sourceLine', 'native', 'file', 'line', 'column', 'calleeShort', 'fileRelative', 'fileShort', 'fileName', 'thirdParty', 'name',]
      //   debug k, rpr d[ k ]
      R.push(s);
    }
    // info '\n' + stack.asTable()
    return R;
  };

  show_stacktracey = function(error) {
    var d, i, len, ref, ref1;
    ref = get_stacktracey(error);
    for (i = 0, len = ref.length; i < len; i++) {
      d = ref[i];
      echo(steel('^44872^ ' + `${d.relpath} @ ${d.line}:${d.column}`));
      /* NOTE errors:
           ENOENT: no such file or directory
           EISDIR: illegal operation on a directory, read
           'Cannot read property 'originalPositionFor' of undefined'
         */
      if (d.error != null) {
        echo(red('^44873^ ' + ((ref1 = d.error.message) != null ? ref1 : "an error occurred")));
      } else {
        echo(yellow('^44874^ ' + `${rpr(d.source.slice(0, 101))}`));
      }
    }
    return null;
  };

  //###########################################################################################################
  //###########################################################################################################
  //###########################################################################################################

  //###########################################################################################################
  if (global[Symbol.for('cnd-exception-handler')] == null) {
    null;
    global[Symbol.for('cnd-exception-handler')] = true;
    process.once('uncaughtException', exit_handler);
    process.once('unhandledRejection', exit_handler);
  }

  // do =>
  // process.stderr.on 'data', ( data ) => debug "^6863-1^ (stderr.on 'data'):", rpr data
  // process.stdout.on 'data', ( data ) => debug "^6863-2^ (stdout.on 'data'):", rpr data
  // process.stderr.on 'end', => debug "^6863-1^ (stderr.on 'end')"
  // process.stdout.on 'end', => debug "^6863-2^ (stdout.on 'end')"
  // debug '^6456^'
  // echo "^4564^ echo to stdout"
  // warn "^4564^ warn to stderr"
  // process.stderr.write "this goes to stderr\n"
  // process.stdout.write "this goes to stdout\n"
  // process.on 'message', ( message ) -> debug "^6863-3^' (process.on 'message'):", rpr message
  // process.on 'warning', ( warning ) -> debug "^6863-3^' (process.on 'warning'):", rpr warning
  /*
  callsite.getThis() - returns the value of this
  callsite.getTypeName() - returns the type of this as a string. This is the name of the function stored in the constructor field of this, if available, otherwise the object's [[Class]] internal property.
  callsite.getFunction() - returns the current function
  callsite.getFunctionName() - returns the name of the current function, typically its name property. If a name property is not available an attempt will be made to try to infer a name from the function's context.
  callsite.getMethodName() - returns the name of the property of this or one of its prototypes that holds the current function
  callsite.getFileName() - if this function was defined in a script returns the name of the script
  callsite.getLineNumber() - if this function was defined in a script returns the current line number
  callsite.getColumnNumber() - if this function was defined in a script returns the current column number
  callsite.getEvalOrigin() - if this function was created using a call to eval returns a CallSite object representing the location where eval was called
  callsite.isToplevel() - is this a toplevel invocation, that is, is this the global object?
  callsite.isEval() - does this call take place in code defined by a call to eval?
  callsite.isNative() - is this call in native V8 code?
  callsite.isConstructor() - is this a constructor c
  */
  module.exports = {exit_handler, _exit_handler};

}).call(this);

//# sourceMappingURL=main.js.map