(function() {
  'use strict';
  var FS, GUY, PATH, _exit_handler, _get_context, alert, blue, bold, cyan, debug, echo, exit_handler, fetch_mapped_location, get_context, get_error_callsites, gold, green, grey, inspect, lime, load_source_map, log, modules_path_color, orange, outside_path_color, own_path_color, plum, red, reverse, rpr, show_error_with_source_context, steel, underline, white, write_to_stderr, yellow;

  //###########################################################################################################
  GUY = require('guy');

  ({alert, debug} = GUY.trm.get_loggers('NODEXH'));

  ({rpr, inspect, echo, log} = GUY.trm);

  get_error_callsites = require('error-callsites');

  load_source_map = (require('util')).promisify(require('load-source-map'));

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
      if ((path.startsWith('node:')) || (path.startsWith('internal/'))) {
        write_to_stderr(arrowhead, grey(`${path} @ ${linenr},${colnr}`));
        continue;
      }
      //.......................................................................................................
      fname = (ref = (ref1 = callsite.getFunctionName()) != null ? ref1 : callsite.getMethodName()) != null ? ref : null;
      ({path, linenr, colnr} = (await fetch_mapped_location(path, linenr, colnr)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsWUFBQSxFQUFBLHFCQUFBLEVBQUEsV0FBQSxFQUFBLG1CQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxlQUFBLEVBQUEsR0FBQSxFQUFBLGtCQUFBLEVBQUEsTUFBQSxFQUFBLGtCQUFBLEVBQUEsY0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSw4QkFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxNQUFBOzs7RUFJQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsQ0FBQSxHQUM0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsUUFBcEIsQ0FENUI7O0VBRUEsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEdBSEYsQ0FBQSxHQUc0QixHQUFHLENBQUMsR0FIaEM7O0VBSUEsbUJBQUEsR0FBNEIsT0FBQSxDQUFRLGlCQUFSOztFQUM1QixlQUFBLEdBQTRCLENBQUUsT0FBQSxDQUFRLE1BQVIsQ0FBRixDQUFrQixDQUFDLFNBQW5CLENBQStCLE9BQUEsQ0FBUSxpQkFBUixDQUEvQjs7RUFDNUIsRUFBQSxHQUE0QixPQUFBLENBQVEsSUFBUjs7RUFDNUIsSUFBQSxHQUE0QixPQUFBLENBQVEsTUFBUjs7RUFDNUIsQ0FBQSxDQUFFLEdBQUYsRUFDRSxLQURGLEVBRUUsS0FG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QyxPQUFBLEdBQVUsRUFBQSxDQUFBLENBQUksSUFBSixDQUFBLEVBQUEsQ0FBQSxHQUFlLGtFQUFtQixxQ0FBbkI7SUFDekIsTUFBTSw4QkFBQSxDQUErQixLQUEvQixFQUFzQyxPQUF0QztBQUNOLFdBQU87RUFMTyxFQS9JaEI7OztFQXVKQSxZQUFBLEdBQWUsTUFBQSxRQUFBLENBQUUsS0FBRixFQUFTLE1BQVQsQ0FBQTtJQUNiLE1BQU0sYUFBQSxDQUFjLEtBQWQsRUFBcUIsTUFBckI7SUFDTixZQUFBLENBQWEsQ0FBRSxRQUFBLENBQUEsQ0FBQTthQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsR0FBYjtJQUFILENBQUYsQ0FBYjtBQUNBLFdBQU87RUFITSxFQXZKZjs7O0VBK0pBLElBQU8sbURBQVA7SUFDRTtJQUNBLE1BQU0sQ0FBRSxNQUFNLENBQUMsR0FBUCxDQUFXLHVCQUFYLENBQUYsQ0FBTixHQUErQztJQUMvQyxPQUFPLENBQUMsSUFBUixDQUFhLG1CQUFiLEVBQW1DLFlBQW5DO0lBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxvQkFBYixFQUFtQyxZQUFuQyxFQUpGO0dBL0pBOzs7RUF1S0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsQ0FBRSxZQUFGLEVBQWdCLGFBQWhCO0FBdktqQiIsInNvdXJjZXNDb250ZW50IjpbIlxuJ3VzZSBzdHJpY3QnXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1ZyAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ05PREVYSCdcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbmdldF9lcnJvcl9jYWxsc2l0ZXMgICAgICAgPSByZXF1aXJlICdlcnJvci1jYWxsc2l0ZXMnXG5sb2FkX3NvdXJjZV9tYXAgICAgICAgICAgID0gKCByZXF1aXJlICd1dGlsJyApLnByb21pc2lmeSAoIHJlcXVpcmUgJ2xvYWQtc291cmNlLW1hcCcgKVxuRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG57IHJlZFxuICBncmVlblxuICBzdGVlbFxuICBjeWFuXG4gIGJvbGRcbiAgbGltZVxuICBnb2xkXG4gIHdoaXRlXG4gIHBsdW1cbiAgb3JhbmdlXG4gIGJsdWUgICAgIyDQodC70LDQstCwINCj0LrRgNCw0ZfQvdGWXG4gIHllbGxvdyAgIyDQodC70LDQstCwINCj0LrRgNCw0ZfQvdGWXG4gIHJldmVyc2VcbiAgdW5kZXJsaW5lXG4gIGJvbGQgfSAgICAgICAgICAgICAgICAgID0gR1VZLnRybVxuZ3JleSAgICAgICAgICAgICAgICAgICAgICA9IEdVWS50cm0uQkFTRTFcblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm1vZHVsZXNfcGF0aF9jb2xvciAgPSAoIFAuLi4gKSAtPiByZXZlcnNlIGJvbGQgb3JhbmdlICcnLCBQLi4uLCAnJ1xub3V0c2lkZV9wYXRoX2NvbG9yICA9ICggUC4uLiApIC0+IHJldmVyc2UgYm9sZCBwbHVtICAgJycsIFAuLi4sICcnXG5vd25fcGF0aF9jb2xvciAgICAgID0gKCBQLi4uICkgLT4gcmV2ZXJzZSBib2xkIGxpbWUgICAnJywgUC4uLiwgJydcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG53cml0ZV90b19zdGRlcnIgPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZGVyci53cml0ZSAnICcgKyAoIEdVWS50cm0ucGVuIFAuLi4gKSArICdcXG4nXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZmV0Y2hfbWFwcGVkX2xvY2F0aW9uID0gKCBwYXRoLCBsaW5lbnIsIGNvbG5yICkgLT5cbiAgdHJ5XG4gICAgc291cmNlbWFwID0gYXdhaXQgbG9hZF9zb3VyY2VfbWFwIHBhdGhcbiAgICBzbXAgICAgICAgPSBzb3VyY2VtYXAub3JpZ2luYWxQb3NpdGlvbkZvciB7IGxpbmU6IGxpbmVuciwgY29sdW1uOiBjb2xuciwgfVxuICBjYXRjaCBlcnJvclxuICAgIHJldHVybiB7IHBhdGgsIGxpbmVuciwgY29sbnIsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiAoIHNtcD8gKSBhbmQgKCBzbXAuc291cmNlPyApIGFuZCAoIHNtcC5zb3VyY2UgaXNudCAnJyApIGFuZCAoIHNtcC5saW5lPyApIGFuZCAoIHNtcC5jb2x1bW4/IClcbiAgICBtYXBwZWRfcGF0aCA9IFBBVEguam9pbiAoIFBBVEguZGlybmFtZSBwYXRoICksIHNtcC5zb3VyY2VcbiAgICByZXR1cm4geyBwYXRoOiBtYXBwZWRfcGF0aCwgbGluZW5yOiBzbXAubGluZSwgY29sbnI6IHNtcC5jb2x1bW4sIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4geyBwYXRoLCBsaW5lbnIsIGNvbG5yLCB9XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZ2V0X2NvbnRleHQgPSAoIHBhdGgsIGxpbmVuciwgY29sbnIsIHdpZHRoICkgLT5cbiAgdHJ5IHJldHVybiAoIF9nZXRfY29udGV4dCBwYXRoLCBsaW5lbnIsIGNvbG5yLCB3aWR0aCApIGNhdGNoIGVycm9yXG4gICAgdGhyb3cgZXJyb3IgdW5sZXNzIGVycm9yLmNvZGUgaXMgJ0VOT0VOVCdcbiAgcmV0dXJuIFtdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuX2dldF9jb250ZXh0ID0gKCBwYXRoLCBsaW5lbnIsIGNvbG5yLCB3aWR0aCApIC0+XG4gIGxpbmVzICAgICA9ICggRlMucmVhZEZpbGVTeW5jIHBhdGgsIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSApLnNwbGl0ICdcXG4nXG4gIGRlbHRhICAgICA9IDFcbiAgY29sZGVsdGEgID0gNVxuICBlZmZlY3QgICAgPSByZXZlcnNlXG4gIGZpcnN0X2lkeCA9IE1hdGgubWF4IDAsIGxpbmVuciAtIDEgLSBkZWx0YVxuICBsYXN0X2lkeCAgPSBNYXRoLm1pbiBsaW5lcy5sZW5ndGggLSAxLCBsaW5lbnIgLSAxICsgZGVsdGFcbiAgUiAgICAgICAgID0gW11cbiAgZm9yIGxpbmUsIGlkeCBpbiBsaW5lc1sgZmlyc3RfaWR4IC4uIGxhc3RfaWR4IF1cbiAgICB0aGlzX2xpbmVuciAgICAgPSBmaXJzdF9pZHggKyBpZHggKyAxXG4gICAgdGhpc19saW5lbnJfdHh0ID0gKCB0aGlzX2xpbmVuci50b1N0cmluZygpLnBhZFN0YXJ0IDQgKSArICfilIIgJ1xuICAgIGlmIHRoaXNfbGluZW5yIGlzbnQgbGluZW5yXG4gICAgICAjIyMgVEFJTlQgc2hvdWxkIGFkanVzdCBvdmVybG9uZyBjb250ZXh0IGxpbmVzIGFzIHdlbGwgIyMjXG4gICAgICBSLnB1c2ggIFwiI3tncmV5IHRoaXNfbGluZW5yX3R4dH0je2dyZXkgbGluZX1cIlxuICAgICAgY29udGludWVcbiAgICAjIyMgVEFJTlQgcGVyZm9ybSBsaW5lIGxlbmd0aCBhZGp1c3RtZW50LCBoaWxpdGluZyBpbiBkZWRpY2F0ZWQgbWV0aG9kICMjI1xuICAgIGMwICAgICAgPSBjb2xuciAtIDFcbiAgICBjMSAgICAgID0gY29sbnIgKyBjb2xkZWx0YVxuICAgIGhpbGl0ZSAgPSBlZmZlY3QgbGluZVsgYzAgLi4uIGMxIF1cbiAgICBsaW5lICAgID0gbGluZVsgLi4uIGMwIF0gKyBoaWxpdGUgKyBsaW5lWyBjMSAuLiBdXG4gICAgaWYgYzEgPiB3aWR0aFxuICAgICAgd2lkdGgyICA9IE1hdGguZmxvb3Igd2lkdGggLyAyXG4gICAgICBsaW5lICAgID0gJy4uLiAnICsgbGluZVsgYzEgLSB3aWR0aDIgLi4gYzEgKyBoaWxpdGUubGVuZ3RoIC0gKCBjMSAtIGMwICkgKyB3aWR0aDIgXSArICcgLi4uJ1xuICAgIGVsc2VcbiAgICAgIGxpbmUgID0gbGluZVsgLi4gd2lkdGggXVxuICAgIFIucHVzaCAgXCIje2dyZXkgdGhpc19saW5lbnJfdHh0fSN7Y3lhbiBsaW5lfVwiXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2hvd19lcnJvcl93aXRoX3NvdXJjZV9jb250ZXh0ID0gKCBlcnJvciwgaGVhZGxpbmUgKSAtPlxuICBhbGVydCAnXjc3NzY1LTFeJywgcmV2ZXJzZSBib2xkIGhlYWRsaW5lXG4gIGFycm93aGVhZCAgID0gd2hpdGUgJ+KWsidcbiAgYXJyb3dzaGFmdCAgPSB3aGl0ZSAn4pSCJ1xuICB3aWR0aCAgICAgICA9IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnNcbiAgY2FsbHNpdGVzICAgPSBnZXRfZXJyb3JfY2FsbHNpdGVzIGVycm9yXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgKCBub3QgY2FsbHNpdGVzPyApIG9yICggY2FsbHNpdGVzLmxlbmd0aCBpcyAwIClcbiAgICB3cml0ZV90b19zdGRlcnIgcmVkIHJldmVyc2UgXCJeNDU1NzU2XiBlcnJvciBoYXMgbm8gYXNzb2NpYXRlZCBjYWxsc2l0ZXM6XCJcbiAgICB3cml0ZV90b19zdGRlcnIgcmVkIHJldmVyc2UgcnByIGVycm9yXG4gICAgcmV0dXJuIG51bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBjYWxsc2l0ZXMucmV2ZXJzZSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIGNhbGxzaXRlIGluIGNhbGxzaXRlc1xuICAgIHBhdGggPSBjYWxsc2l0ZS5nZXRGaWxlTmFtZSgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3MgcGF0aD9cbiAgICAgIHdyaXRlX3RvX3N0ZGVyciBncmV5ICfigJQnLnJlcGVhdCAxMDhcbiAgICAgIGNvbnRpbnVlXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBsaW5lbnIgICAgICA9IGNhbGxzaXRlLmdldExpbmVOdW1iZXIoKVxuICAgIGNvbG5yICAgICAgID0gY2FsbHNpdGUuZ2V0Q29sdW1uTnVtYmVyKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmICggcGF0aC5zdGFydHNXaXRoICdub2RlOicgKSBvciAoIHBhdGguc3RhcnRzV2l0aCAnaW50ZXJuYWwvJyApXG4gICAgICB3cml0ZV90b19zdGRlcnIgYXJyb3doZWFkLCBncmV5IFwiI3twYXRofSBAICN7bGluZW5yfSwje2NvbG5yfVwiXG4gICAgICBjb250aW51ZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm5hbWUgPSBjYWxsc2l0ZS5nZXRGdW5jdGlvbk5hbWUoKSA/IGNhbGxzaXRlLmdldE1ldGhvZE5hbWUoKSA/IG51bGxcbiAgICB7IHBhdGhcbiAgICAgIGxpbmVuclxuICAgICAgY29sbnIgICB9ID0gYXdhaXQgZmV0Y2hfbWFwcGVkX2xvY2F0aW9uIHBhdGgsIGxpbmVuciwgY29sbnJcbiAgICByZWxwYXRoICAgICA9IFBBVEgucmVsYXRpdmUgcHJvY2Vzcy5jd2QoKSwgcGF0aFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3dpdGNoIHRydWVcbiAgICAgIHdoZW4gKCAvXFwvbm9kZV9tb2R1bGVzXFwvLy50ZXN0IHBhdGggKSB0aGVuICBwYXRoX2NvbG9yID0gbW9kdWxlc19wYXRoX2NvbG9yXG4gICAgICB3aGVuICggcmVscGF0aC5zdGFydHNXaXRoICcuLi8nICAgICApIHRoZW4gIHBhdGhfY29sb3IgPSBvdXRzaWRlX3BhdGhfY29sb3JcbiAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aF9jb2xvciA9IG93bl9wYXRoX2NvbG9yXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBmbmFtZT9cbiAgICAgICMjIyBUQUlOVCB1c2UgcHJvcGVyIG1ldGhvZHMgdG8gZm9ybWF0IHdpdGggbXVsdGlwbGUgY29sb3JzICMjI1xuICAgICAgZm5hbWVfdHh0ID0gc3RlZWwgZm5hbWVcbiAgICAgIHdpZHRoMSAgICA9IHdpZHRoICsgKCBmbmFtZV90eHQubGVuZ3RoIC0gZm5hbWUubGVuZ3RoIClcbiAgICAgIHdyaXRlX3RvX3N0ZGVyciBhcnJvd2hlYWQsIHBhdGhfY29sb3IgKCBcIiN7cmVscGF0aH0gQCAje2xpbmVucn0sI3tjb2xucn06ICN7Zm5hbWVfdHh0fSgpIFxceDFiWzM4OzA1OzIzNG1cIi5wYWRFbmQgd2lkdGgxLCAn4oCUJyApXG4gICAgZWxzZVxuICAgICAgd3JpdGVfdG9fc3RkZXJyIGFycm93aGVhZCwgcGF0aF9jb2xvciAoIFwiI3tyZWxwYXRofSBAICN7bGluZW5yfSwje2NvbG5yfTogXFx4MWJbMzg7MDU7MjM0bVwiLnBhZEVuZCB3aWR0aCwgJ+KAlCcgKVxuICAgIGZvciBjb250ZXh0X2xpbmUgaW4gYXdhaXQgZ2V0X2NvbnRleHQgcGF0aCwgbGluZW5yLCBjb2xuciwgd2lkdGhcbiAgICAgIHdyaXRlX3RvX3N0ZGVyciBhcnJvd3NoYWZ0LCBjb250ZXh0X2xpbmVcbiAgYWxlcnQgJ143Nzc2NS0yXicsIHJldmVyc2UgYm9sZCBoZWFkbGluZVxuICByZXR1cm4gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbl9leGl0X2hhbmRsZXIgPSAoIGVycm9yLCBvcmlnaW4gKSAtPlxuICAjIyMgVEFJTlQgb3JpZ2luIG5ldmVyIHVzZWQgIyMjXG4gIHR5cGUgICAgPSBlcnJvci5jb2RlID8gZXJyb3IubmFtZSA/ICdFWENFUFRJT04nXG4gIG1lc3NhZ2UgPSBcIiAje3R5cGV9OiBcIiArICggZXJyb3I/Lm1lc3NhZ2UgPyBcImFuIHVucmVjb3ZlcmFibGUgY29uZGl0aW9uIG9jY3VycmVkXCIgKVxuICBhd2FpdCBzaG93X2Vycm9yX3dpdGhfc291cmNlX2NvbnRleHQgZXJyb3IsIG1lc3NhZ2VcbiAgcmV0dXJuIG51bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leGl0X2hhbmRsZXIgPSAoIGVycm9yLCBvcmlnaW4gKSAtPlxuICBhd2FpdCBfZXhpdF9oYW5kbGVyIGVycm9yLCBvcmlnaW5cbiAgc2V0SW1tZWRpYXRlICggLT4gcHJvY2Vzcy5leGl0IDExMSApXG4gIHJldHVybiBudWxsXG5cblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbnVubGVzcyBnbG9iYWxbIFN5bWJvbC5mb3IgJ2NuZC1leGNlcHRpb24taGFuZGxlcicgXT9cbiAgbnVsbFxuICBnbG9iYWxbIFN5bWJvbC5mb3IgJ2NuZC1leGNlcHRpb24taGFuZGxlcicgXSA9IHRydWVcbiAgcHJvY2Vzcy5vbmNlICd1bmNhdWdodEV4Y2VwdGlvbicsICBleGl0X2hhbmRsZXJcbiAgcHJvY2Vzcy5vbmNlICd1bmhhbmRsZWRSZWplY3Rpb24nLCBleGl0X2hhbmRsZXJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbm1vZHVsZS5leHBvcnRzID0geyBleGl0X2hhbmRsZXIsIF9leGl0X2hhbmRsZXIsIH1cblxuIl19
//# sourceURL=../src/main.coffee