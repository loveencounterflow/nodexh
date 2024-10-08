(function() {
  'use strict';
  var FS, GUY, PATH, _exit_handler, _get_context, alert, blue, bold, cyan, debug, echo, exit_handler, fetch_mapped_location, get_context, get_error_callsites, gold, green, grey, inspect, lime, load_source_map, log, orange, other_path_color, own_path_color, red, reverse, rpr, show_error_with_source_context, steel, underline, white, write_to_stderr, yellow;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug} = GUY.trm.get_loggers('NODEXH'));

  ({rpr, inspect, echo, log} = GUY.trm);

  get_error_callsites = require('error-callsites');

  load_source_map = (require('util')).promisify(require('load-source-map'));

  FS = require('fs');

  PATH = require('path');

  ({red, green, steel, grey, cyan, bold, lime, gold, white, orange, blue, yellow, reverse, underline, bold} = GUY.trm); // Слава Україні // Слава Україні

  //-----------------------------------------------------------------------------------------------------------
  other_path_color = function(...P) {
    return reverse(bold(orange('', ...P, '')));
  };

  own_path_color = function(...P) {
    return reverse(bold(lime('', ...P, '')));
  };

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
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  show_error_with_source_context = async function(error, headline) {
    /* TAINT use proper methods to format with multiple colors */
    var arrowhead, arrowshaft, callsite, callsites, colnr, context_line, fname, fname_txt, i, j, len, len1, linenr, path, path_color, ref, ref1, ref2, relpath, width, width1;
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
      if (/\/node_modules\//.test(path)) {
        path_color = other_path_color;
      } else {
        path_color = own_path_color;
      }
      //.......................................................................................................
      fname = (ref = (ref1 = callsite.getFunctionName()) != null ? ref1 : callsite.getMethodName()) != null ? ref : null;
      ({path, linenr, colnr} = (await fetch_mapped_location(path, linenr, colnr)));
      relpath = PATH.relative(process.cwd(), path);
      if (fname != null) {
        fname_txt = steel(fname);
        width1 = width + (fname_txt.length - fname.length);
        write_to_stderr(arrowhead, path_color(`${relpath} @ ${linenr},${colnr}: ${fname_txt}() \x1b[38;05;234m`.padEnd(width1, '—')));
      } else {
        write_to_stderr(arrowhead, path_color(`${relpath} @ ${linenr},${colnr}: \x1b[38;05;234m`.padEnd(width, '—')));
      }
      ref2 = (await get_context(path, linenr, colnr, width));
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        context_line = ref2[j];
        write_to_stderr(arrowshaft, context_line);
      }
    }
    alert('^77765-2^', reverse(bold(headline)));
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  _exit_handler = async function(error, origin) {
    /* TAINT origin never used */
    var message, ref, ref1, ref2, type;
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
  if (global[Symbol.for('cnd-exception-handler')] == null) {
    null;
    global[Symbol.for('cnd-exception-handler')] = true;
    process.once('uncaughtException', exit_handler);
    process.once('unhandledRejection', exit_handler);
  }

  //###########################################################################################################
  module.exports = {exit_handler, _exit_handler};

}).call(this);

//# sourceMappingURL=main.js.map