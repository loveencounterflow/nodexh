(function() {
  'use strict';
  var FS, GUY, PATH, _exit_handler, _get_context, alert, blue, bold, cyan, debug, echo, exit_handler, fetch_mapped_location, get_context, get_error_callsites, gold, green, grey, inspect, lime, load_source_map_sync, log, modules_path_color, orange, outside_path_color, own_path_color, plum, red, reverse, rpr, show_error_with_source_context, steel, underline, white, write_to_stderr, yellow;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug} = GUY.trm.get_loggers('NODEXH'));

  ({rpr, inspect, echo, log} = GUY.trm);

  get_error_callsites = require('error-callsites');

  // load_source_map           = ( require 'util' ).promisify ( require 'load-source-map' )
  load_source_map_sync = require('../dependencies/rexxars-load-source-map.js');

  FS = require('fs');

  PATH = require('path');

  ({red, green, steel, cyan, bold, lime, gold, white, plum, orange, blue, yellow, reverse, underline, bold} = GUY.trm); // Слава Україні // Слава Україні

  grey = GUY.trm.BASE1;

  //-----------------------------------------------------------------------------------------------------------
  modules_path_color = function(...P) {
    return reverse(bold(orange('', ...P, '')));
  };

  outside_path_color = function(...P) {
    return reverse(bold(plum('', ...P, '')));
  };

  own_path_color = function(...P) {
    return reverse(bold(lime('', ...P, '')));
  };

  //-----------------------------------------------------------------------------------------------------------
  write_to_stderr = function(...P) {
    return process.stderr.write(' ' + (GUY.trm.pen(...P)) + '\n');
  };

  //-----------------------------------------------------------------------------------------------------------
  fetch_mapped_location = function(path, linenr, colnr) {
    var error, mapped_path, smp, sourcemap;
    try {
      sourcemap = load_source_map_sync(path);
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
  show_error_with_source_context = function(error, headline) {
    /* TAINT use proper methods to format with multiple colors */
    var arrowhead, arrowshaft, callsite, callsites, colnr, context_line, fname, fname_txt, i, j, len, len1, linenr, path, path_color, ref, ref1, ref2, relpath, width, width1;
    alert('Ωnxh___2', reverse(bold(headline)));
    arrowhead = white('▲');
    arrowshaft = white('│');
    width = process.stdout.columns;
    callsites = get_error_callsites(error);
    //.........................................................................................................
    if ((callsites == null) || (callsites.length === 0)) {
      write_to_stderr(red(reverse("^455756^ error has no associated callsites:")));
      write_to_stderr(red(reverse(rpr(error))));
      alert('Ωnxh___4', reverse(bold(headline)));
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
      if ((path.startsWith('node:')) || (path.startsWith('internal/'))) {
        write_to_stderr(arrowhead, grey(`${path} @ ${linenr},${colnr}`));
        continue;
      }
      //.......................................................................................................
      fname = (ref = (ref1 = callsite.getFunctionName()) != null ? ref1 : callsite.getMethodName()) != null ? ref : null;
      ({path, linenr, colnr} = fetch_mapped_location(path, linenr, colnr));
      relpath = PATH.relative(process.cwd(), path);
      //.......................................................................................................
      switch (true) {
        case /\/node_modules\//.test(path):
          path_color = modules_path_color;
          break;
        case relpath.startsWith('../'):
          path_color = outside_path_color;
          break;
        default:
          path_color = own_path_color;
      }
      //.......................................................................................................
      if (fname != null) {
        fname_txt = steel(fname);
        width1 = width + (fname_txt.length - fname.length);
        write_to_stderr(arrowhead, path_color(`${relpath} @ ${linenr},${colnr}: ${fname_txt}() \x1b[38;05;234m`.padEnd(width1, '—')));
      } else {
        write_to_stderr(arrowhead, path_color(`${relpath} @ ${linenr},${colnr}: \x1b[38;05;234m`.padEnd(width, '—')));
      }
      ref2 = get_context(path, linenr, colnr, width);
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        context_line = ref2[j];
        write_to_stderr(arrowshaft, context_line);
      }
    }
    alert('Ωnxh__12', reverse(bold(headline)));
    if (error.cause != null) {
      show_error_with_source_context(error.cause, ` Cause: ${error.cause.constructor.name}: ${error.cause.message} `);
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  _exit_handler = function(error, origin) {
    /* TAINT origin never used */
    var message, ref, ref1, ref2, ref3, ref4, type;
    type = (ref = (ref1 = (ref2 = error != null ? error.code : void 0) != null ? ref2 : error != null ? (ref3 = error.constructor) != null ? ref3.name : void 0 : void 0) != null ? ref1 : error != null ? error.name : void 0) != null ? ref : 'EXCEPTION';
    message = ` Error: ${type}: ` + ((ref4 = error != null ? error.message : void 0) != null ? ref4 : "an unrecoverable condition occurred");
    show_error_with_source_context(error, message);
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  exit_handler = function(error, origin) {
    _exit_handler(error, origin);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsWUFBQSxFQUFBLHFCQUFBLEVBQUEsV0FBQSxFQUFBLG1CQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxvQkFBQSxFQUFBLEdBQUEsRUFBQSxrQkFBQSxFQUFBLE1BQUEsRUFBQSxrQkFBQSxFQUFBLGNBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsOEJBQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLEtBQUEsRUFBQSxlQUFBLEVBQUEsTUFBQTs7O0VBSUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLENBQUEsR0FDNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLFFBQXBCLENBRDVCOztFQUVBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxHQUhGLENBQUEsR0FHNEIsR0FBRyxDQUFDLEdBSGhDOztFQUlBLG1CQUFBLEdBQTRCLE9BQUEsQ0FBUSxpQkFBUixFQVg1Qjs7O0VBYUEsb0JBQUEsR0FBNEIsT0FBQSxDQUFRLDRDQUFSOztFQUM1QixFQUFBLEdBQTRCLE9BQUEsQ0FBUSxJQUFSOztFQUM1QixJQUFBLEdBQTRCLE9BQUEsQ0FBUSxNQUFSOztFQUM1QixDQUFBLENBQUUsR0FBRixFQUNFLEtBREYsRUFFRSxLQUZGLEVBR0UsSUFIRixFQUlFLElBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9F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QSxXQUFPO0VBcER3QixFQTVGakM7OztFQW1KQSxhQUFBLEdBQWdCLFFBQUEsQ0FBRSxLQUFGLEVBQVMsTUFBVCxDQUFBLEVBQUE7O0FBQ2hCLFFBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUE7SUFDRSxJQUFBLHdPQUFpRTtJQUNqRSxPQUFBLEdBQVUsQ0FBQSxRQUFBLENBQUEsQ0FBVyxJQUFYLENBQUEsRUFBQSxDQUFBLEdBQXNCLGtFQUFtQixxQ0FBbkI7SUFDaEMsOEJBQUEsQ0FBK0IsS0FBL0IsRUFBc0MsT0FBdEM7QUFDQSxXQUFPO0VBTE8sRUFuSmhCOzs7RUEySkEsWUFBQSxHQUFlLFFBQUEsQ0FBRSxLQUFGLEVBQVMsTUFBVCxDQUFBO0lBQ2IsYUFBQSxDQUFjLEtBQWQsRUFBcUIsTUFBckI7SUFDQSxZQUFBLENBQWEsQ0FBRSxRQUFBLENBQUEsQ0FBQTthQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsR0FBYjtJQUFILENBQUYsQ0FBYjtBQUNBLFdBQU87RUFITSxFQTNKZjs7O0VBbUtBLElBQU8sbURBQVA7SUFDRTtJQUNBLE1BQU0sQ0FBRSxNQUFNLENBQUMsR0FBUCxDQUFXLHVCQUFYLENBQUYsQ0FBTixHQUErQztJQUMvQyxPQUFPLENBQUMsSUFBUixDQUFhLG1CQUFiLEVBQW1DLFlBQW5DO0lBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxvQkFBYixFQUFtQyxZQUFuQyxFQUpGO0dBbktBOzs7RUEyS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsQ0FBRSxZQUFGLEVBQWdCLGFBQWhCO0FBM0tqQiIsInNvdXJjZXNDb250ZW50IjpbIlxuJ3VzZSBzdHJpY3QnXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1ZyAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ05PREVYSCdcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbmdldF9lcnJvcl9jYWxsc2l0ZXMgICAgICAgPSByZXF1aXJlICdlcnJvci1jYWxsc2l0ZXMnXG4jIGxvYWRfc291cmNlX21hcCAgICAgICAgICAgPSAoIHJlcXVpcmUgJ3V0aWwnICkucHJvbWlzaWZ5ICggcmVxdWlyZSAnbG9hZC1zb3VyY2UtbWFwJyApXG5sb2FkX3NvdXJjZV9tYXBfc3luYyAgICAgID0gcmVxdWlyZSAnLi4vZGVwZW5kZW5jaWVzL3JleHhhcnMtbG9hZC1zb3VyY2UtbWFwLmpzJ1xuRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG57IHJlZFxuICBncmVlblxuICBzdGVlbFxuICBjeWFuXG4gIGJvbGRcbiAgbGltZVxuICBnb2xkXG4gIHdoaXRlXG4gIHBsdW1cbiAgb3JhbmdlXG4gIGJsdWUgICAgIyDQodC70LDQstCwINCj0LrRgNCw0ZfQvdGWXG4gIHllbGxvdyAgIyDQodC70LDQstCwINCj0LrRgNCw0ZfQvdGWXG4gIHJldmVyc2VcbiAgdW5kZXJsaW5lXG4gIGJvbGQgfSAgICAgICAgICAgICAgICAgID0gR1VZLnRybVxuZ3JleSAgICAgICAgICAgICAgICAgICAgICA9IEdVWS50cm0uQkFTRTFcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm1vZHVsZXNfcGF0aF9jb2xvciAgPSAoIFAuLi4gKSAtPiByZXZlcnNlIGJvbGQgb3JhbmdlICcnLCBQLi4uLCAnJ1xub3V0c2lkZV9wYXRoX2NvbG9yICA9ICggUC4uLiApIC0+IHJldmVyc2UgYm9sZCBwbHVtICAgJycsIFAuLi4sICcnXG5vd25fcGF0aF9jb2xvciAgICAgID0gKCBQLi4uICkgLT4gcmV2ZXJzZSBib2xkIGxpbWUgICAnJywgUC4uLiwgJydcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG53cml0ZV90b19zdGRlcnIgPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZGVyci53cml0ZSAnICcgKyAoIEdVWS50cm0ucGVuIFAuLi4gKSArICdcXG4nXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZmV0Y2hfbWFwcGVkX2xvY2F0aW9uID0gKCBwYXRoLCBsaW5lbnIsIGNvbG5yICkgLT5cbiAgdHJ5XG4gICAgc291cmNlbWFwID0gbG9hZF9zb3VyY2VfbWFwX3N5bmMgcGF0aFxuICAgIHNtcCAgICAgICA9IHNvdXJjZW1hcC5vcmlnaW5hbFBvc2l0aW9uRm9yIHsgbGluZTogbGluZW5yLCBjb2x1bW46IGNvbG5yLCB9XG4gIGNhdGNoIGVycm9yXG4gICAgcmV0dXJuIHsgcGF0aCwgbGluZW5yLCBjb2xuciwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmICggc21wPyApIGFuZCAoIHNtcC5zb3VyY2U/ICkgYW5kICggc21wLnNvdXJjZSBpc250ICcnICkgYW5kICggc21wLmxpbmU/ICkgYW5kICggc21wLmNvbHVtbj8gKVxuICAgIG1hcHBlZF9wYXRoID0gUEFUSC5qb2luICggUEFUSC5kaXJuYW1lIHBhdGggKSwgc21wLnNvdXJjZVxuICAgIHJldHVybiB7IHBhdGg6IG1hcHBlZF9wYXRoLCBsaW5lbnI6IHNtcC5saW5lLCBjb2xucjogc21wLmNvbHVtbiwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiB7IHBhdGgsIGxpbmVuciwgY29sbnIsIH1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRfY29udGV4dCA9ICggcGF0aCwgbGluZW5yLCBjb2xuciwgd2lkdGggKSAtPlxuICB0cnkgcmV0dXJuICggX2dldF9jb250ZXh0IHBhdGgsIGxpbmVuciwgY29sbnIsIHdpZHRoICkgY2F0Y2ggZXJyb3JcbiAgICB0aHJvdyBlcnJvciB1bmxlc3MgZXJyb3IuY29kZSBpcyAnRU5PRU5UJ1xuICByZXR1cm4gW11cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5fZ2V0X2NvbnRleHQgPSAoIHBhdGgsIGxpbmVuciwgY29sbnIsIHdpZHRoICkgLT5cbiAgbGluZXMgICAgID0gKCBGUy5yZWFkRmlsZVN5bmMgcGF0aCwgeyBlbmNvZGluZzogJ3V0Zi04JyB9ICkuc3BsaXQgJ1xcbidcbiAgZGVsdGEgICAgID0gMVxuICBjb2xkZWx0YSAgPSA1XG4gIGVmZmVjdCAgICA9IHJldmVyc2VcbiAgZmlyc3RfaWR4ID0gTWF0aC5tYXggMCwgbGluZW5yIC0gMSAtIGRlbHRhXG4gIGxhc3RfaWR4ICA9IE1hdGgubWluIGxpbmVzLmxlbmd0aCAtIDEsIGxpbmVuciAtIDEgKyBkZWx0YVxuICBSICAgICAgICAgPSBbXVxuICBmb3IgbGluZSwgaWR4IGluIGxpbmVzWyBmaXJzdF9pZHggLi4gbGFzdF9pZHggXVxuICAgIHRoaXNfbGluZW5yICAgICA9IGZpcnN0X2lkeCArIGlkeCArIDFcbiAgICB0aGlzX2xpbmVucl90eHQgPSAoIHRoaXNfbGluZW5yLnRvU3RyaW5nKCkucGFkU3RhcnQgNCApICsgJ+KUgiAnXG4gICAgaWYgdGhpc19saW5lbnIgaXNudCBsaW5lbnJcbiAgICAgICMjIyBUQUlOVCBzaG91bGQgYWRqdXN0IG92ZXJsb25nIGNvbnRleHQgbGluZXMgYXMgd2VsbCAjIyNcbiAgICAgIFIucHVzaCAgXCIje2dyZXkgdGhpc19saW5lbnJfdHh0fSN7Z3JleSBsaW5lfVwiXG4gICAgICBjb250aW51ZVxuICAgICMjIyBUQUlOVCBwZXJmb3JtIGxpbmUgbGVuZ3RoIGFkanVzdG1lbnQsIGhpbGl0aW5nIGluIGRlZGljYXRlZCBtZXRob2QgIyMjXG4gICAgYzAgICAgICA9IGNvbG5yIC0gMVxuICAgIGMxICAgICAgPSBjb2xuciArIGNvbGRlbHRhXG4gICAgaGlsaXRlICA9IGVmZmVjdCBsaW5lWyBjMCAuLi4gYzEgXVxuICAgIGxpbmUgICAgPSBsaW5lWyAuLi4gYzAgXSArIGhpbGl0ZSArIGxpbmVbIGMxIC4uIF1cbiAgICBpZiBjMSA+IHdpZHRoXG4gICAgICB3aWR0aDIgID0gTWF0aC5mbG9vciB3aWR0aCAvIDJcbiAgICAgIGxpbmUgICAgPSAnLi4uICcgKyBsaW5lWyBjMSAtIHdpZHRoMiAuLiBjMSArIGhpbGl0ZS5sZW5ndGggLSAoIGMxIC0gYzAgKSArIHdpZHRoMiBdICsgJyAuLi4nXG4gICAgZWxzZVxuICAgICAgbGluZSAgPSBsaW5lWyAuLiB3aWR0aCBdXG4gICAgUi5wdXNoICBcIiN7Z3JleSB0aGlzX2xpbmVucl90eHR9I3tjeWFuIGxpbmV9XCJcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zaG93X2Vycm9yX3dpdGhfc291cmNlX2NvbnRleHQgPSAoIGVycm9yLCBoZWFkbGluZSApIC0+XG4gIGFsZXJ0ICfOqW54aF9fXzInLCByZXZlcnNlIGJvbGQgaGVhZGxpbmVcbiAgYXJyb3doZWFkICAgPSB3aGl0ZSAn4payJ1xuICBhcnJvd3NoYWZ0ICA9IHdoaXRlICfilIInXG4gIHdpZHRoICAgICAgID0gcHJvY2Vzcy5zdGRvdXQuY29sdW1uc1xuICBjYWxsc2l0ZXMgICA9IGdldF9lcnJvcl9jYWxsc2l0ZXMgZXJyb3JcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiAoIG5vdCBjYWxsc2l0ZXM/ICkgb3IgKCBjYWxsc2l0ZXMubGVuZ3RoIGlzIDAgKVxuICAgIHdyaXRlX3RvX3N0ZGVyciByZWQgcmV2ZXJzZSBcIl40NTU3NTZeIGVycm9yIGhhcyBubyBhc3NvY2lhdGVkIGNhbGxzaXRlczpcIlxuICAgIHdyaXRlX3RvX3N0ZGVyciByZWQgcmV2ZXJzZSBycHIgZXJyb3JcbiAgICBhbGVydCAnzqlueGhfX180JywgcmV2ZXJzZSBib2xkIGhlYWRsaW5lXG4gICAgcmV0dXJuIG51bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBjYWxsc2l0ZXMucmV2ZXJzZSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIGNhbGxzaXRlIGluIGNhbGxzaXRlc1xuICAgIHBhdGggPSBjYWxsc2l0ZS5nZXRGaWxlTmFtZSgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3MgcGF0aD9cbiAgICAgIHdyaXRlX3RvX3N0ZGVyciBncmV5ICfigJQnLnJlcGVhdCAxMDhcbiAgICAgIGNvbnRpbnVlXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBsaW5lbnIgICAgICA9IGNhbGxzaXRlLmdldExpbmVOdW1iZXIoKVxuICAgIGNvbG5yICAgICAgID0gY2FsbHNpdGUuZ2V0Q29sdW1uTnVtYmVyKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmICggcGF0aC5zdGFydHNXaXRoICdub2RlOicgKSBvciAoIHBhdGguc3RhcnRzV2l0aCAnaW50ZXJuYWwvJyApXG4gICAgICB3cml0ZV90b19zdGRlcnIgYXJyb3doZWFkLCBncmV5IFwiI3twYXRofSBAICN7bGluZW5yfSwje2NvbG5yfVwiXG4gICAgICBjb250aW51ZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm5hbWUgPSBjYWxsc2l0ZS5nZXRGdW5jdGlvbk5hbWUoKSA/IGNhbGxzaXRlLmdldE1ldGhvZE5hbWUoKSA/IG51bGxcbiAgICB7IHBhdGhcbiAgICAgIGxpbmVuclxuICAgICAgY29sbnIgICB9ID0gZmV0Y2hfbWFwcGVkX2xvY2F0aW9uIHBhdGgsIGxpbmVuciwgY29sbnJcbiAgICByZWxwYXRoICAgICA9IFBBVEgucmVsYXRpdmUgcHJvY2Vzcy5jd2QoKSwgcGF0aFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3dpdGNoIHRydWVcbiAgICAgIHdoZW4gKCAvXFwvbm9kZV9tb2R1bGVzXFwvLy50ZXN0IHBhdGggKSB0aGVuICBwYXRoX2NvbG9yID0gbW9kdWxlc19wYXRoX2NvbG9yXG4gICAgICB3aGVuICggcmVscGF0aC5zdGFydHNXaXRoICcuLi8nICAgICApIHRoZW4gIHBhdGhfY29sb3IgPSBvdXRzaWRlX3BhdGhfY29sb3JcbiAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aF9jb2xvciA9IG93bl9wYXRoX2NvbG9yXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBmbmFtZT9cbiAgICAgICMjIyBUQUlOVCB1c2UgcHJvcGVyIG1ldGhvZHMgdG8gZm9ybWF0IHdpdGggbXVsdGlwbGUgY29sb3JzICMjI1xuICAgICAgZm5hbWVfdHh0ID0gc3RlZWwgZm5hbWVcbiAgICAgIHdpZHRoMSAgICA9IHdpZHRoICsgKCBmbmFtZV90eHQubGVuZ3RoIC0gZm5hbWUubGVuZ3RoIClcbiAgICAgIHdyaXRlX3RvX3N0ZGVyciBhcnJvd2hlYWQsIHBhdGhfY29sb3IgKCBcIiN7cmVscGF0aH0gQCAje2xpbmVucn0sI3tjb2xucn06ICN7Zm5hbWVfdHh0fSgpIFxceDFiWzM4OzA1OzIzNG1cIi5wYWRFbmQgd2lkdGgxLCAn4oCUJyApXG4gICAgZWxzZVxuICAgICAgd3JpdGVfdG9fc3RkZXJyIGFycm93aGVhZCwgcGF0aF9jb2xvciAoIFwiI3tyZWxwYXRofSBAICN7bGluZW5yfSwje2NvbG5yfTogXFx4MWJbMzg7MDU7MjM0bVwiLnBhZEVuZCB3aWR0aCwgJ+KAlCcgKVxuICAgIGZvciBjb250ZXh0X2xpbmUgaW4gZ2V0X2NvbnRleHQgcGF0aCwgbGluZW5yLCBjb2xuciwgd2lkdGhcbiAgICAgIHdyaXRlX3RvX3N0ZGVyciBhcnJvd3NoYWZ0LCBjb250ZXh0X2xpbmVcbiAgYWxlcnQgJ86pbnhoX18xMicsIHJldmVyc2UgYm9sZCBoZWFkbGluZVxuICBpZiBlcnJvci5jYXVzZT9cbiAgICBzaG93X2Vycm9yX3dpdGhfc291cmNlX2NvbnRleHQgZXJyb3IuY2F1c2UsIFwiIENhdXNlOiAje2Vycm9yLmNhdXNlLmNvbnN0cnVjdG9yLm5hbWV9OiAje2Vycm9yLmNhdXNlLm1lc3NhZ2V9IFwiXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuX2V4aXRfaGFuZGxlciA9ICggZXJyb3IsIG9yaWdpbiApIC0+XG4gICMjIyBUQUlOVCBvcmlnaW4gbmV2ZXIgdXNlZCAjIyNcbiAgdHlwZSAgICA9IGVycm9yPy5jb2RlID8gZXJyb3I/LmNvbnN0cnVjdG9yPy5uYW1lID8gZXJyb3I/Lm5hbWUgPyAnRVhDRVBUSU9OJ1xuICBtZXNzYWdlID0gXCIgRXJyb3I6ICN7dHlwZX06IFwiICsgKCBlcnJvcj8ubWVzc2FnZSA/IFwiYW4gdW5yZWNvdmVyYWJsZSBjb25kaXRpb24gb2NjdXJyZWRcIiApXG4gIHNob3dfZXJyb3Jfd2l0aF9zb3VyY2VfY29udGV4dCBlcnJvciwgbWVzc2FnZVxuICByZXR1cm4gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4aXRfaGFuZGxlciA9ICggZXJyb3IsIG9yaWdpbiApIC0+XG4gIF9leGl0X2hhbmRsZXIgZXJyb3IsIG9yaWdpblxuICBzZXRJbW1lZGlhdGUgKCAtPiBwcm9jZXNzLmV4aXQgMTExIClcbiAgcmV0dXJuIG51bGxcblxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdP1xuICBudWxsXG4gIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdID0gdHJ1ZVxuICBwcm9jZXNzLm9uY2UgJ3VuY2F1Z2h0RXhjZXB0aW9uJywgIGV4aXRfaGFuZGxlclxuICBwcm9jZXNzLm9uY2UgJ3VuaGFuZGxlZFJlamVjdGlvbicsIGV4aXRfaGFuZGxlclxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubW9kdWxlLmV4cG9ydHMgPSB7IGV4aXRfaGFuZGxlciwgX2V4aXRfaGFuZGxlciwgfVxuXG4iXX0=
//# sourceURL=../src/main.coffee