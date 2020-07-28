(function() {
  'use strict';//########################################################################################################
  var CND, FS, PATH, alert, alertxxx, badge, bold, cyan, debug, echo, get_context, gold, green, grey, help, info, log, red, resolve_locations, reverse, rpr, show_error_with_source_context, stackman, steel, underline, urge, warn, whisper, white, yellow;

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

  stackman = (require('stackman'))();

  FS = require('fs');

  PATH = require('path');

  ({red, green, steel, grey, cyan, bold, gold, reverse, white, yellow, reverse, underline, bold} = CND);

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
      effect = underline;
      effect = bold;
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
    var arrowhead, arrowshaft, width;
    arrowhead = white('▲');
    arrowshaft = white('│');
    width = process.stdout.columns;
    // demo_error_stack_parser error
    // debug CND.cyan error.stack
    //#########################################################################################################
    stackman.callsites(error, function(stackman_error, callsites) {
      debug('^2223^');
      if (stackman_error != null) {
        throw stackman_error;
      }
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
    });
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.exit_handler = function(exception) {
    var head, i, len, line, message, ref, ref1, ref2, ref3, stack, tail;
    message = ' EXCEPTION: ' + ((ref = exception != null ? exception.message : void 0) != null ? ref : "an unrecoverable condition occurred");
    if (stack = (ref1 = (ref2 = exception != null ? exception.where : void 0) != null ? ref2 : exception != null ? exception.stack : void 0) != null ? ref1 : null) {
      message += '\n--------------------\n' + stack + '\n--------------------';
    }
    [head, ...tail] = message.split('\n');
    // debug '^222766^', { stack, }
    // debug '^222766^', { message, tail, }
    alert(reverse(' ' + head + ' '));
    for (i = 0, len = tail.length; i < len; i++) {
      line = tail[i];
      warn(line);
    }
    if ((exception != null ? exception.stack : void 0) != null) {
      debug('^4445^', "show_error_with_source_context");
      show_error_with_source_context(exception, ' ' + head + ' ');
    } else {
      whisper((ref3 = exception != null ? exception.stack : void 0) != null ? ref3 : "(exception undefined, no stack)");
    }
    process.exitCode = 1;
    debug('^33333442-1^');
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

}).call(this);

//# sourceMappingURL=main.js.map