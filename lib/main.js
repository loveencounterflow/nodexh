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
      // switch true
      //   when ( path.startsWith 'node:diagnostics_channel' )
      //     write_to_stderr arrowhead, blue "#{path} @ #{linenr},#{colnr}"
      //     continue
      //   when ( path.startsWith 'node:internal/' ) or ( path.startsWith 'internal/' )
      //     write_to_stderr arrowhead, grey "#{path} @ #{linenr},#{colnr}"
      //     continue
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLGFBQUEsRUFBQSxZQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsWUFBQSxFQUFBLHFCQUFBLEVBQUEsV0FBQSxFQUFBLG1CQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxlQUFBLEVBQUEsR0FBQSxFQUFBLGtCQUFBLEVBQUEsTUFBQSxFQUFBLGtCQUFBLEVBQUEsY0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSw4QkFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxNQUFBOzs7RUFJQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsQ0FBQSxHQUM0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsUUFBcEIsQ0FENUI7O0VBRUEsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEdBSEYsQ0FBQSxHQUc0QixHQUFHLENBQUMsR0FIaEM7O0VBSUEsbUJBQUEsR0FBNEIsT0FBQSxDQUFRLGlCQUFSOztFQUM1QixlQUFBLEdBQTRCLENBQUUsT0FBQSxDQUFRLE1BQVIsQ0FBRixDQUFrQixDQUFDLFNBQW5CLENBQStCLE9BQUEsQ0FBUSxpQkFBUixDQUEvQjs7RUFDNUIsRUFBQSxHQUE0QixPQUFBLENBQVEsSUFBUjs7RUFDNUIsSUFBQSxHQUE0QixPQUFBLENBQVEsTUFBUjs7RUFDNUIsQ0FBQSxDQUFFLEdBQUYsRUFDRSxLQURGLEVBRUUsS0FG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RUFBb0M7SUFDcEMsT0FBQSxHQUFVLEVBQUEsQ0FBQSxDQUFJLElBQUosQ0FBQSxFQUFBLENBQUEsR0FBZSxrRUFBbUIscUNBQW5CO0lBQ3pCLE1BQU0sOEJBQUEsQ0FBK0IsS0FBL0IsRUFBc0MsT0FBdEM7QUFDTixXQUFPO0VBTE8sRUF0SmhCOzs7RUE4SkEsWUFBQSxHQUFlLE1BQUEsUUFBQSxDQUFFLEtBQUYsRUFBUyxNQUFULENBQUE7SUFDYixNQUFNLGFBQUEsQ0FBYyxLQUFkLEVBQXFCLE1BQXJCO0lBQ04sWUFBQSxDQUFhLENBQUUsUUFBQSxDQUFBLENBQUE7YUFBRyxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7SUFBSCxDQUFGLENBQWI7QUFDQSxXQUFPO0VBSE0sRUE5SmY7OztFQXNLQSxJQUFPLG1EQUFQO0lBQ0U7SUFDQSxNQUFNLENBQUUsTUFBTSxDQUFDLEdBQVAsQ0FBVyx1QkFBWCxDQUFGLENBQU4sR0FBK0M7SUFDL0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxtQkFBYixFQUFtQyxZQUFuQztJQUNBLE9BQU8sQ0FBQyxJQUFSLENBQWEsb0JBQWIsRUFBbUMsWUFBbkMsRUFKRjtHQXRLQTs7O0VBOEtBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLENBQUUsWUFBRixFQUFnQixhQUFoQjtBQTlLakIiLCJzb3VyY2VzQ29udGVudCI6WyJcbid1c2Ugc3RyaWN0J1xuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWcgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdOT0RFWEgnXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG5nZXRfZXJyb3JfY2FsbHNpdGVzICAgICAgID0gcmVxdWlyZSAnZXJyb3ItY2FsbHNpdGVzJ1xubG9hZF9zb3VyY2VfbWFwICAgICAgICAgICA9ICggcmVxdWlyZSAndXRpbCcgKS5wcm9taXNpZnkgKCByZXF1aXJlICdsb2FkLXNvdXJjZS1tYXAnIClcbkZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcblBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xueyByZWRcbiAgZ3JlZW5cbiAgc3RlZWxcbiAgY3lhblxuICBib2xkXG4gIGxpbWVcbiAgZ29sZFxuICB3aGl0ZVxuICBwbHVtXG4gIG9yYW5nZVxuICBibHVlICAgICMg0KHQu9Cw0LLQsCDQo9C60YDQsNGX0L3RllxuICB5ZWxsb3cgICMg0KHQu9Cw0LLQsCDQo9C60YDQsNGX0L3RllxuICByZXZlcnNlXG4gIHVuZGVybGluZVxuICBib2xkIH0gICAgICAgICAgICAgICAgICA9IEdVWS50cm1cbmdyZXkgICAgICAgICAgICAgICAgICAgICAgPSBHVVkudHJtLkJBU0UxXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5tb2R1bGVzX3BhdGhfY29sb3IgID0gKCBQLi4uICkgLT4gcmV2ZXJzZSBib2xkIG9yYW5nZSAnJywgUC4uLiwgJydcbm91dHNpZGVfcGF0aF9jb2xvciAgPSAoIFAuLi4gKSAtPiByZXZlcnNlIGJvbGQgcGx1bSAgICcnLCBQLi4uLCAnJ1xub3duX3BhdGhfY29sb3IgICAgICA9ICggUC4uLiApIC0+IHJldmVyc2UgYm9sZCBsaW1lICAgJycsIFAuLi4sICcnXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxud3JpdGVfdG9fc3RkZXJyID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUgJyAnICsgKCBHVVkudHJtLnBlbiBQLi4uICkgKyAnXFxuJ1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmZldGNoX21hcHBlZF9sb2NhdGlvbiA9ICggcGF0aCwgbGluZW5yLCBjb2xuciApIC0+XG4gIHRyeVxuICAgIHNvdXJjZW1hcCA9IGF3YWl0IGxvYWRfc291cmNlX21hcCBwYXRoXG4gICAgc21wICAgICAgID0gc291cmNlbWFwLm9yaWdpbmFsUG9zaXRpb25Gb3IgeyBsaW5lOiBsaW5lbnIsIGNvbHVtbjogY29sbnIsIH1cbiAgY2F0Y2ggZXJyb3JcbiAgICByZXR1cm4geyBwYXRoLCBsaW5lbnIsIGNvbG5yLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgKCBzbXA/ICkgYW5kICggc21wLnNvdXJjZT8gKSBhbmQgKCBzbXAuc291cmNlIGlzbnQgJycgKSBhbmQgKCBzbXAubGluZT8gKSBhbmQgKCBzbXAuY29sdW1uPyApXG4gICAgbWFwcGVkX3BhdGggPSBQQVRILmpvaW4gKCBQQVRILmRpcm5hbWUgcGF0aCApLCBzbXAuc291cmNlXG4gICAgcmV0dXJuIHsgcGF0aDogbWFwcGVkX3BhdGgsIGxpbmVucjogc21wLmxpbmUsIGNvbG5yOiBzbXAuY29sdW1uLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIHsgcGF0aCwgbGluZW5yLCBjb2xuciwgfVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldF9jb250ZXh0ID0gKCBwYXRoLCBsaW5lbnIsIGNvbG5yLCB3aWR0aCApIC0+XG4gIHRyeSByZXR1cm4gKCBfZ2V0X2NvbnRleHQgcGF0aCwgbGluZW5yLCBjb2xuciwgd2lkdGggKSBjYXRjaCBlcnJvclxuICAgIHRocm93IGVycm9yIHVubGVzcyBlcnJvci5jb2RlIGlzICdFTk9FTlQnXG4gIHJldHVybiBbXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbl9nZXRfY29udGV4dCA9ICggcGF0aCwgbGluZW5yLCBjb2xuciwgd2lkdGggKSAtPlxuICBsaW5lcyAgICAgPSAoIEZTLnJlYWRGaWxlU3luYyBwYXRoLCB7IGVuY29kaW5nOiAndXRmLTgnIH0gKS5zcGxpdCAnXFxuJ1xuICBkZWx0YSAgICAgPSAxXG4gIGNvbGRlbHRhICA9IDVcbiAgZWZmZWN0ICAgID0gcmV2ZXJzZVxuICBmaXJzdF9pZHggPSBNYXRoLm1heCAwLCBsaW5lbnIgLSAxIC0gZGVsdGFcbiAgbGFzdF9pZHggID0gTWF0aC5taW4gbGluZXMubGVuZ3RoIC0gMSwgbGluZW5yIC0gMSArIGRlbHRhXG4gIFIgICAgICAgICA9IFtdXG4gIGZvciBsaW5lLCBpZHggaW4gbGluZXNbIGZpcnN0X2lkeCAuLiBsYXN0X2lkeCBdXG4gICAgdGhpc19saW5lbnIgICAgID0gZmlyc3RfaWR4ICsgaWR4ICsgMVxuICAgIHRoaXNfbGluZW5yX3R4dCA9ICggdGhpc19saW5lbnIudG9TdHJpbmcoKS5wYWRTdGFydCA0ICkgKyAn4pSCICdcbiAgICBpZiB0aGlzX2xpbmVuciBpc250IGxpbmVuclxuICAgICAgIyMjIFRBSU5UIHNob3VsZCBhZGp1c3Qgb3ZlcmxvbmcgY29udGV4dCBsaW5lcyBhcyB3ZWxsICMjI1xuICAgICAgUi5wdXNoICBcIiN7Z3JleSB0aGlzX2xpbmVucl90eHR9I3tncmV5IGxpbmV9XCJcbiAgICAgIGNvbnRpbnVlXG4gICAgIyMjIFRBSU5UIHBlcmZvcm0gbGluZSBsZW5ndGggYWRqdXN0bWVudCwgaGlsaXRpbmcgaW4gZGVkaWNhdGVkIG1ldGhvZCAjIyNcbiAgICBjMCAgICAgID0gY29sbnIgLSAxXG4gICAgYzEgICAgICA9IGNvbG5yICsgY29sZGVsdGFcbiAgICBoaWxpdGUgID0gZWZmZWN0IGxpbmVbIGMwIC4uLiBjMSBdXG4gICAgbGluZSAgICA9IGxpbmVbIC4uLiBjMCBdICsgaGlsaXRlICsgbGluZVsgYzEgLi4gXVxuICAgIGlmIGMxID4gd2lkdGhcbiAgICAgIHdpZHRoMiAgPSBNYXRoLmZsb29yIHdpZHRoIC8gMlxuICAgICAgbGluZSAgICA9ICcuLi4gJyArIGxpbmVbIGMxIC0gd2lkdGgyIC4uIGMxICsgaGlsaXRlLmxlbmd0aCAtICggYzEgLSBjMCApICsgd2lkdGgyIF0gKyAnIC4uLidcbiAgICBlbHNlXG4gICAgICBsaW5lICA9IGxpbmVbIC4uIHdpZHRoIF1cbiAgICBSLnB1c2ggIFwiI3tncmV5IHRoaXNfbGluZW5yX3R4dH0je2N5YW4gbGluZX1cIlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnNob3dfZXJyb3Jfd2l0aF9zb3VyY2VfY29udGV4dCA9ICggZXJyb3IsIGhlYWRsaW5lICkgLT5cbiAgYWxlcnQgJ143Nzc2NS0xXicsIHJldmVyc2UgYm9sZCBoZWFkbGluZVxuICBhcnJvd2hlYWQgICA9IHdoaXRlICfilrInXG4gIGFycm93c2hhZnQgID0gd2hpdGUgJ+KUgidcbiAgd2lkdGggICAgICAgPSBwcm9jZXNzLnN0ZG91dC5jb2x1bW5zXG4gIGNhbGxzaXRlcyAgID0gZ2V0X2Vycm9yX2NhbGxzaXRlcyBlcnJvclxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmICggbm90IGNhbGxzaXRlcz8gKSBvciAoIGNhbGxzaXRlcy5sZW5ndGggaXMgMCApXG4gICAgd3JpdGVfdG9fc3RkZXJyIHJlZCByZXZlcnNlIFwiXjQ1NTc1Nl4gZXJyb3IgaGFzIG5vIGFzc29jaWF0ZWQgY2FsbHNpdGVzOlwiXG4gICAgd3JpdGVfdG9fc3RkZXJyIHJlZCByZXZlcnNlIHJwciBlcnJvclxuICAgIHJldHVybiBudWxsXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgY2FsbHNpdGVzLnJldmVyc2UoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZvciBjYWxsc2l0ZSBpbiBjYWxsc2l0ZXNcbiAgICBwYXRoID0gY2FsbHNpdGUuZ2V0RmlsZU5hbWUoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdW5sZXNzIHBhdGg/XG4gICAgICB3cml0ZV90b19zdGRlcnIgZ3JleSAn4oCUJy5yZXBlYXQgMTA4XG4gICAgICBjb250aW51ZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgbGluZW5yICAgICAgPSBjYWxsc2l0ZS5nZXRMaW5lTnVtYmVyKClcbiAgICBjb2xuciAgICAgICA9IGNhbGxzaXRlLmdldENvbHVtbk51bWJlcigpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIHN3aXRjaCB0cnVlXG4gICAgIyAgIHdoZW4gKCBwYXRoLnN0YXJ0c1dpdGggJ25vZGU6ZGlhZ25vc3RpY3NfY2hhbm5lbCcgKVxuICAgICMgICAgIHdyaXRlX3RvX3N0ZGVyciBhcnJvd2hlYWQsIGJsdWUgXCIje3BhdGh9IEAgI3tsaW5lbnJ9LCN7Y29sbnJ9XCJcbiAgICAjICAgICBjb250aW51ZVxuICAgICMgICB3aGVuICggcGF0aC5zdGFydHNXaXRoICdub2RlOmludGVybmFsLycgKSBvciAoIHBhdGguc3RhcnRzV2l0aCAnaW50ZXJuYWwvJyApXG4gICAgIyAgICAgd3JpdGVfdG9fc3RkZXJyIGFycm93aGVhZCwgZ3JleSBcIiN7cGF0aH0gQCAje2xpbmVucn0sI3tjb2xucn1cIlxuICAgICMgICAgIGNvbnRpbnVlXG4gICAgaWYgKCBwYXRoLnN0YXJ0c1dpdGggJ25vZGU6JyApIG9yICggcGF0aC5zdGFydHNXaXRoICdpbnRlcm5hbC8nIClcbiAgICAgIHdyaXRlX3RvX3N0ZGVyciBhcnJvd2hlYWQsIGdyZXkgXCIje3BhdGh9IEAgI3tsaW5lbnJ9LCN7Y29sbnJ9XCJcbiAgICAgIGNvbnRpbnVlXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBmbmFtZSA9IGNhbGxzaXRlLmdldEZ1bmN0aW9uTmFtZSgpID8gY2FsbHNpdGUuZ2V0TWV0aG9kTmFtZSgpID8gbnVsbFxuICAgIHsgcGF0aFxuICAgICAgbGluZW5yXG4gICAgICBjb2xuciAgIH0gPSBhd2FpdCBmZXRjaF9tYXBwZWRfbG9jYXRpb24gcGF0aCwgbGluZW5yLCBjb2xuclxuICAgIHJlbHBhdGggICAgID0gUEFUSC5yZWxhdGl2ZSBwcm9jZXNzLmN3ZCgpLCBwYXRoXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgd2hlbiAoIC9cXC9ub2RlX21vZHVsZXNcXC8vLnRlc3QgcGF0aCApIHRoZW4gIHBhdGhfY29sb3IgPSBtb2R1bGVzX3BhdGhfY29sb3JcbiAgICAgIHdoZW4gKCByZWxwYXRoLnN0YXJ0c1dpdGggJy4uLycgICAgICkgdGhlbiAgcGF0aF9jb2xvciA9IG91dHNpZGVfcGF0aF9jb2xvclxuICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoX2NvbG9yID0gb3duX3BhdGhfY29sb3JcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIGZuYW1lP1xuICAgICAgIyMjIFRBSU5UIHVzZSBwcm9wZXIgbWV0aG9kcyB0byBmb3JtYXQgd2l0aCBtdWx0aXBsZSBjb2xvcnMgIyMjXG4gICAgICBmbmFtZV90eHQgPSBzdGVlbCBmbmFtZVxuICAgICAgd2lkdGgxICAgID0gd2lkdGggKyAoIGZuYW1lX3R4dC5sZW5ndGggLSBmbmFtZS5sZW5ndGggKVxuICAgICAgd3JpdGVfdG9fc3RkZXJyIGFycm93aGVhZCwgcGF0aF9jb2xvciAoIFwiI3tyZWxwYXRofSBAICN7bGluZW5yfSwje2NvbG5yfTogI3tmbmFtZV90eHR9KCkgXFx4MWJbMzg7MDU7MjM0bVwiLnBhZEVuZCB3aWR0aDEsICfigJQnIClcbiAgICBlbHNlXG4gICAgICB3cml0ZV90b19zdGRlcnIgYXJyb3doZWFkLCBwYXRoX2NvbG9yICggXCIje3JlbHBhdGh9IEAgI3tsaW5lbnJ9LCN7Y29sbnJ9OiBcXHgxYlszODswNTsyMzRtXCIucGFkRW5kIHdpZHRoLCAn4oCUJyApXG4gICAgZm9yIGNvbnRleHRfbGluZSBpbiBhd2FpdCBnZXRfY29udGV4dCBwYXRoLCBsaW5lbnIsIGNvbG5yLCB3aWR0aFxuICAgICAgd3JpdGVfdG9fc3RkZXJyIGFycm93c2hhZnQsIGNvbnRleHRfbGluZVxuICBhbGVydCAnXjc3NzY1LTJeJywgcmV2ZXJzZSBib2xkIGhlYWRsaW5lXG4gIHJldHVybiBudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuX2V4aXRfaGFuZGxlciA9ICggZXJyb3IsIG9yaWdpbiApIC0+XG4gICMjIyBUQUlOVCBvcmlnaW4gbmV2ZXIgdXNlZCAjIyNcbiAgdHlwZSAgICA9IGVycm9yLmNvZGUgPyBlcnJvci5uYW1lID8gJ0VYQ0VQVElPTidcbiAgbWVzc2FnZSA9IFwiICN7dHlwZX06IFwiICsgKCBlcnJvcj8ubWVzc2FnZSA/IFwiYW4gdW5yZWNvdmVyYWJsZSBjb25kaXRpb24gb2NjdXJyZWRcIiApXG4gIGF3YWl0IHNob3dfZXJyb3Jfd2l0aF9zb3VyY2VfY29udGV4dCBlcnJvciwgbWVzc2FnZVxuICByZXR1cm4gbnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4aXRfaGFuZGxlciA9ICggZXJyb3IsIG9yaWdpbiApIC0+XG4gIGF3YWl0IF9leGl0X2hhbmRsZXIgZXJyb3IsIG9yaWdpblxuICBzZXRJbW1lZGlhdGUgKCAtPiBwcm9jZXNzLmV4aXQgMTExIClcbiAgcmV0dXJuIG51bGxcblxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdP1xuICBudWxsXG4gIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdID0gdHJ1ZVxuICBwcm9jZXNzLm9uY2UgJ3VuY2F1Z2h0RXhjZXB0aW9uJywgIGV4aXRfaGFuZGxlclxuICBwcm9jZXNzLm9uY2UgJ3VuaGFuZGxlZFJlamVjdGlvbicsIGV4aXRfaGFuZGxlclxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubW9kdWxlLmV4cG9ydHMgPSB7IGV4aXRfaGFuZGxlciwgX2V4aXRfaGFuZGxlciwgfVxuXG4iXX0=
//# sourceURL=../src/main.coffee