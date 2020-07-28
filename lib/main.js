(function() {
  'use strict';//########################################################################################################
  var CND, FS, PATH, alert, badge, bold, cyan, debug, echo, exit_handler, fetch_mapped_location, get_context, get_error_callsites, gold, green, grey, help, info, load_source_map, log, red, reverse, rpr, show_error_with_source_context, steel, underline, urge, warn, whisper, white, write_to_stderr, yellow;

  //###########################################################################################################
  //###########################################################################################################
  //###########################################################################################################
  /* see https://medium.com/@nodejs/source-maps-in-node-js-482872b56116
  */
  //###########################################################################################################
  //###########################################################################################################

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'nodexh';

  log = CND.get_logger('plain', badge);

  debug = CND.get_logger('debug', badge);

  info = CND.get_logger('info', badge);

  warn = CND.get_logger('warn', badge);

  alert = CND.get_logger('alert', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  // stackman                  = ( require 'stackman' )()
  get_error_callsites = require('error-callsites');

  load_source_map = (require('util')).promisify(require('load-source-map'));

  FS = require('fs');

  PATH = require('path');

  ({red, green, steel, grey, cyan, bold, gold, white, yellow, reverse, underline, bold} = CND);

  // types                     = new ( require '../../intertype' ).Intertype()
  // { isa }                   = types.export()

  //-----------------------------------------------------------------------------------------------------------
  write_to_stderr = function(...P) {
    return process.stderr.write(' ' + CND.pen(...P));
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
      warn('^7763-3^', "!!!!!!!!!!!!!!!!!", error.message);
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
    var R, c0, c1, coldelta, delta, effect, error, first_idx, hilite, i, idx, last_idx, len, line, lines, ref, this_linenr, this_linenr_txt, width2;
    try {
      //.........................................................................................................
      lines = (FS.readFileSync(path, {
        encoding: 'utf-8'
      })).split('\n');
      delta = 1;
      coldelta = 5;
      /* TAINT use more meaningful limit like n times the terminal width, assuming default of 100 */
      // effect    = underline
      // effect    = bold
      effect = reverse;
      first_idx = Math.max(0, linenr - 1 - delta);
      last_idx = Math.min(lines.length - 1, linenr - 1 + delta);
      R = [];
      ref = lines.slice(first_idx, +last_idx + 1 || 9e9);
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        line = ref[idx];
        this_linenr = first_idx + idx + 1;
        this_linenr_txt = (this_linenr.toString().padStart(4)) + '│ ';
        if (this_linenr === linenr) {
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
        } else {
          R.push(`${grey(this_linenr_txt)}${grey(line)}`);
        }
      }
    } catch (error1) {
      // R = R.join '\n'
      error = error1;
      if (error.code !== 'ENOENT') {
        throw error;
      }
      return [];
    }
    // return [ ( red "!!! #{rpr error.message} !!!" ), ]
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  show_error_with_source_context = async function(error, headline) {
    /* From https://github.com/watson/stackman#gotchas: "This module works because V8 (the JavaScript engine
         behind Node.js) allows us to hook into the stack trace generator function before that stack trace is
         generated. It's triggered by accessing the .stack property on the Error object, so please don't do
         that before parsing the error to stackman, else this will not work!" */
    var arrowhead, arrowshaft, callsite, colnr, context_line, i, j, len, len1, linenr, path, ref, ref1, relpath, width;
    arrowhead = white('▲');
    arrowshaft = white('│');
    width = process.stdout.columns;
    ref = (get_error_callsites(error)).reverse();
    //.........................................................................................................
    for (i = 0, len = ref.length; i < len; i++) {
      callsite = ref[i];
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
      if (path.startsWith('internal/')) {
        write_to_stderr(arrowhead, grey(`${path} #${linenr}`));
        continue;
      }
      //.......................................................................................................
      // debug '^344463^', { relpath, linenr, colnr, }
      // write_to_stderr()
      // write_to_stderr steel bold reverse ( "#{relpath} ##{linenr}:" ).padEnd 108
      ({path, linenr, colnr} = (await fetch_mapped_location(path, linenr, colnr)));
      relpath = PATH.relative(process.cwd(), path);
      write_to_stderr(arrowhead, gold(`${relpath} @ ${linenr},${colnr}: \x1b[38;05;234m`.padEnd(width, '—')));
      ref1 = (await get_context(path, linenr, colnr, width));
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        context_line = ref1[j];
        write_to_stderr(arrowshaft, context_line);
      }
    }
    alert('^77765^', reverse(bold(headline)));
    // if error?.message?
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  exit_handler = async function(error) {
    var message, ref;
    message = ' EXCEPTION: ' + ((ref = error != null ? error.message : void 0) != null ? ref : "an unrecoverable condition occurred");
    await show_error_with_source_context(error, message);
    setImmediate((function() {
      return process.exit(111);
    }));
    // process.exit 111
    return null;
  };

  //###########################################################################################################
  if (global[Symbol.for('cnd-exception-handler')] == null) {
    global[Symbol.for('cnd-exception-handler')] = true;
    process.on('uncaughtException', exit_handler);
    process.on('unhandledRejection', exit_handler);
  }

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

}).call(this);

//# sourceMappingURL=main.js.map