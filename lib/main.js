(function() {
  'use strict';//########################################################################################################
  var CND, FS, PATH, alert, alertxxx, badge, bold, cyan, debug, echo, get_context, get_error_callsites, gold, green, grey, help, info, log, red, resolve_locations, reverse, rpr, show_error_with_source_context, steel, underline, urge, warn, whisper, white, yellow;

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

  FS = require('fs');

  PATH = require('path');

  ({red, green, steel, grey, cyan, bold, gold, white, yellow, reverse, underline, bold} = CND);

  // types                     = new ( require '../../intertype' ).Intertype()
  // { isa }                   = types.export()

  //-----------------------------------------------------------------------------------------------------------
  alertxxx = function(...P) {
    return process.stderr.write(' ' + CND.pen(...P));
  };

  //-----------------------------------------------------------------------------------------------------------
  get_context = function(path, linenr, colnr) {
    /* TAINT use more meaningful limit like n times the terminal width, assuming default of 100 */
    /* TAINT use stackman.sourceContexts() instead */
    var R, c0, c1, coldelta, colnr_max, colnr_max2, delta, effect, error, first_idx, hilite, i, idx, last_idx, len, line, lines, lnr, ref, this_linenr;
    try {
      lines = (FS.readFileSync(path, {
        encoding: 'utf-8'
      })).split('\n');
      delta = 1;
      coldelta = 5;
      colnr_max = 100;
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
        lnr = (this_linenr.toString().padStart(4)) + '│ ';
        if (this_linenr === linenr) {
          c0 = colnr - 1;
          c1 = colnr + coldelta;
          hilite = effect(line.slice(c0, c1));
          line = line.slice(0, c0) + hilite + line.slice(c1);
          if (c1 > colnr_max) {
            colnr_max2 = Math.floor(colnr_max / 2);
            line = '... ' + line.slice(c1 - colnr_max2, +(c1 + hilite.length - (c1 - c0) + colnr_max2) + 1 || 9e9) + ' ...';
          } else {
            line = line.slice(0, +colnr_max + 1 || 9e9);
          }
          R.push(`${grey(lnr)}${cyan(line)}`);
        } else {
          R.push(`${grey(lnr)}${grey(line)}`);
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
  resolve_locations = function(frames, handler) {
    var frame, i, k, len, load_source_map, path;
    load_source_map = require('load-source-map');
    debug('^3334^', (function() {
      var results;
      results = [];
      for (k in load_source_map) {
        results.push(k);
      }
      return results;
    })());
    for (i = 0, len = frames.length; i < len; i++) {
      frame = frames[i];
      path = frame.file;
      if (path === '' || path === (void 0)) {
        path = null;
      }
      if (path == null) {
        continue;
      }
      (function(path) {
        return load_source_map(path, function(lsm_error, sourcemap) {
          var colnr, linenr, position;
          if (lsm_error != null) {
            return;
          }
          if (sourcemap == null) {
            return;
          }
          // return handler error if error?
          // return handler() unless sourcemap?
          position = sourcemap.originalPositionFor({
            line: linenr,
            column: colnr
          });
          linenr = position.line;
          colnr = position.column;
          // debug '^3387^', ( k for k of sourcemap )
          whisper('load-source-map', position);
          return whisper('load-source-map', {path, linenr, colnr});
        });
      })(path);
    }
    handler();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  show_error_with_source_context = function(error, headline) {
    /* From https://github.com/watson/stackman#gotchas: "This module works because V8 (the JavaScript engine
         behind Node.js) allows us to hook into the stack trace generator function before that stack trace is
         generated. It's triggered by accessing the .stack property on the Error object, so please don't do
         that before parsing the error to stackman, else this will not work!" */
    var arrowhead, arrowshaft, callsites, width;
    arrowhead = white('▲');
    arrowshaft = white('│');
    width = process.stdout.columns;
    callsites = get_error_callsites(error);
    callsites.reverse();
    callsites.forEach(function(callsite) {
      var colnr, i, len, line, linenr, path, relpath, source;
      if ((path = callsite.getFileName()) == null) {
        alertxxx(grey('—'.repeat(108)));
        return null;
      }
      linenr = callsite.getLineNumber();
      colnr = callsite.getColumnNumber();
      relpath = PATH.relative(process.cwd(), path);
      // debug "^8887^ #{rpr {path, linenr, callsite:callsite.getFileName(),sourceContexts:null}}"
      if (path.startsWith('internal/')) {
        alertxxx(arrowhead, grey(`${relpath} #${linenr}`));
        return null;
      }
      // alertxxx()
      // alertxxx steel bold reverse ( "#{relpath} ##{linenr}:" ).padEnd 108
      alertxxx(arrowhead, gold(`${relpath} @ ${linenr},${colnr}: \x1b[38;05;234m`.padEnd(width, '—')));
      source = get_context(path, linenr, colnr);
      for (i = 0, len = source.length; i < len; i++) {
        line = source[i];
        alertxxx(arrowshaft, line);
      }
      return null;
      return alert(reverse(bold(headline)));
    });
    // if error?.message?
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.exit_handler = function(error) {
    var message, ref;
    message = ' EXCEPTION: ' + ((ref = error != null ? error.message : void 0) != null ? ref : "an unrecoverable condition occurred");
    // if stack = error?.where ? error?.stack ? null
    //   message += '\n--------------------\n' + stack + '\n--------------------'
    // [ head, tail..., ]  = message.split '\n'
    // # debug '^222766^', { stack, }
    // # debug '^222766^', { message, tail, }
    // alert reverse ' ' + head + ' '
    // warn line for line in tail
    // if error?.stack?
    //   debug '^4445^', "show_error_with_source_context"
    //   show_error_with_source_context error, ' ' + head + ' '
    // else
    //   whisper error?.stack ? "(error undefined, no stack)"
    // process.exitCode = 1
    // debug '^33333442-1^'
    //.........................................................................................................
    show_error_with_source_context(error, "+++ HEADLINE GOES HERE +++"); // ' ' + head + ' '
    return setImmediate((function() {
      return process.exit(111);
    }));
  };

  // process.exit 111
  this.exit_handler = this.exit_handler.bind(this);

  //###########################################################################################################
  if (global[Symbol.for('cnd-exception-handler')] == null) {
    global[Symbol.for('cnd-exception-handler')] = true;
    process.on('uncaughtException', this.exit_handler);
    process.on('unhandledRejection', this.exit_handler);
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