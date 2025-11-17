(function() {
  'use strict';
  var SFMODULES, debug, exit_handler, format_stack, inspect, write_to_stderr;

  //###########################################################################################################
  // blue    # Слава Україні
  // yellow  # Слава Україні
  // SFMODULES                 = require '../../bricabrac-sfmodules'
  SFMODULES = require('bricabrac-sfmodules');

  ({format_stack} = SFMODULES.unstable.require_format_stack());

  ({inspect} = require('node:util'));

  ({debug} = console);

  //-----------------------------------------------------------------------------------------------------------
  write_to_stderr = function(text) {
    return process.stderr.write(text + '\n');
  };

  //-----------------------------------------------------------------------------------------------------------
  exit_handler = function(error, origin) {
    var secondary_error, stack_rpr;
    // _exit_handler error, origin
    // debug "Ωnodexh___1 received non-error value (before) #{inspect error}"
    // debug 'Ωnodexh___2', Error.isError error
    if (!Error.isError(error)) {
      error = new Error(`Ωnodexh___3 (not a JS Error value) ${inspect(error)}`);
      debug(`Ωnodexh___4 received non-error value (after) ${error}`);
    }
    try {
      //.........................................................................................................
      stack_rpr = format_stack(error);
    } catch (error1) {
      secondary_error = error1;
      debug('Ωnodexh___5');
      debug('Ωnodexh___6', '-'.repeat(108));
      debug('Ωnodexh___7');
      debug("Ωnodexh___8 when trying to call `format_stack()`, an error was thrown:");
      debug('Ωnodexh___9');
      debug('Ωnodexh__10', inspect(secondary_error));
      debug('Ωnodexh__11');
      debug('Ωnodexh__12', '-'.repeat(108));
      debug('Ωnodexh__13');
      stack_rpr = new Error(`Ωnodexh__14 (not a JS Error value) ${inspect(error)}`);
    }
    //.........................................................................................................
    write_to_stderr(stack_rpr);
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
  module.exports = {exit_handler};

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxPQUFBLEVBQUEsZUFBQTs7Ozs7O0VBT0EsU0FBQSxHQUE0QixPQUFBLENBQVEscUJBQVI7O0VBQzVCLENBQUEsQ0FBRSxZQUFGLENBQUEsR0FBNEIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBbkIsQ0FBQSxDQUE1Qjs7RUFDQSxDQUFBLENBQUUsT0FBRixDQUFBLEdBQTRCLE9BQUEsQ0FBUSxXQUFSLENBQTVCOztFQUNBLENBQUEsQ0FBRSxLQUFGLENBQUEsR0FBNEIsT0FBNUIsRUFWQTs7O0VBYUEsZUFBQSxHQUFrQixRQUFBLENBQUUsSUFBRixDQUFBO1dBQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLElBQUEsR0FBTyxJQUE1QjtFQUFaLEVBYmxCOzs7RUFnQkEsWUFBQSxHQUFlLFFBQUEsQ0FBRSxLQUFGLEVBQVMsTUFBVCxDQUFBO0FBQ2YsUUFBQSxlQUFBLEVBQUEsU0FBQTs7OztJQUdFLEtBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLENBQVA7TUFDRSxLQUFBLEdBQVEsSUFBSSxLQUFKLENBQVUsQ0FBQSxtQ0FBQSxDQUFBLENBQXNDLE9BQUEsQ0FBUSxLQUFSLENBQXRDLENBQUEsQ0FBVjtNQUNSLEtBQUEsQ0FBTSxDQUFBLDZDQUFBLENBQUEsQ0FBZ0QsS0FBaEQsQ0FBQSxDQUFOLEVBRkY7O0FBSUE7O01BQ0UsU0FBQSxHQUFZLFlBQUEsQ0FBYSxLQUFiLEVBRGQ7S0FFQSxjQUFBO01BQU07TUFDSixLQUFBLENBQU0sYUFBTjtNQUNBLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLEdBQUcsQ0FBQyxNQUFKLENBQVcsR0FBWCxDQUFyQjtNQUNBLEtBQUEsQ0FBTSxhQUFOO01BQ0EsS0FBQSxDQUFNLHdFQUFOO01BQ0EsS0FBQSxDQUFNLGFBQU47TUFDQSxLQUFBLENBQU0sYUFBTixFQUFxQixPQUFBLENBQVEsZUFBUixDQUFyQjtNQUNBLEtBQUEsQ0FBTSxhQUFOO01BQ0EsS0FBQSxDQUFNLGFBQU4sRUFBcUIsR0FBRyxDQUFDLE1BQUosQ0FBVyxHQUFYLENBQXJCO01BQ0EsS0FBQSxDQUFNLGFBQU47TUFDQSxTQUFBLEdBQVksSUFBSSxLQUFKLENBQVUsQ0FBQSxtQ0FBQSxDQUFBLENBQXNDLE9BQUEsQ0FBUSxLQUFSLENBQXRDLENBQUEsQ0FBVixFQVZkO0tBVEY7O0lBcUJFLGVBQUEsQ0FBZ0IsU0FBaEI7SUFDQSxZQUFBLENBQWEsQ0FBRSxRQUFBLENBQUEsQ0FBQTthQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsR0FBYjtJQUFILENBQUYsQ0FBYjtBQUNBLFdBQU87RUF4Qk0sRUFoQmY7OztFQTZDQSxJQUFPLG1EQUFQO0lBQ0U7SUFDQSxNQUFNLENBQUUsTUFBTSxDQUFDLEdBQVAsQ0FBVyx1QkFBWCxDQUFGLENBQU4sR0FBK0M7SUFDL0MsT0FBTyxDQUFDLElBQVIsQ0FBYSxtQkFBYixFQUFtQyxZQUFuQztJQUNBLE9BQU8sQ0FBQyxJQUFSLENBQWEsb0JBQWIsRUFBbUMsWUFBbkMsRUFKRjtHQTdDQTs7O0VBcURBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLENBQUUsWUFBRjtBQXJEakIiLCJzb3VyY2VzQ29udGVudCI6WyJcbid1c2Ugc3RyaWN0J1xuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuIyBibHVlICAgICMg0KHQu9Cw0LLQsCDQo9C60YDQsNGX0L3RllxuIyB5ZWxsb3cgICMg0KHQu9Cw0LLQsCDQo9C60YDQsNGX0L3RllxuIyBTRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vYnJpY2FicmFjLXNmbW9kdWxlcydcblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdicmljYWJyYWMtc2Ztb2R1bGVzJ1xueyBmb3JtYXRfc3RhY2ssICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zvcm1hdF9zdGFjaygpXG57IGluc3BlY3QsICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnbm9kZTp1dGlsJ1xueyBkZWJ1ZywgICAgICAgICAgICAgICAgfSA9IGNvbnNvbGVcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG53cml0ZV90b19zdGRlcnIgPSAoIHRleHQgKSAtPiBwcm9jZXNzLnN0ZGVyci53cml0ZSB0ZXh0ICsgJ1xcbidcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leGl0X2hhbmRsZXIgPSAoIGVycm9yLCBvcmlnaW4gKSAtPlxuICAjIF9leGl0X2hhbmRsZXIgZXJyb3IsIG9yaWdpblxuICAjIGRlYnVnIFwizqlub2RleGhfX18xIHJlY2VpdmVkIG5vbi1lcnJvciB2YWx1ZSAoYmVmb3JlKSAje2luc3BlY3QgZXJyb3J9XCJcbiAgIyBkZWJ1ZyAnzqlub2RleGhfX18yJywgRXJyb3IuaXNFcnJvciBlcnJvclxuICB1bmxlc3MgRXJyb3IuaXNFcnJvciBlcnJvclxuICAgIGVycm9yID0gbmV3IEVycm9yIFwizqlub2RleGhfX18zIChub3QgYSBKUyBFcnJvciB2YWx1ZSkgI3tpbnNwZWN0IGVycm9yfVwiXG4gICAgZGVidWcgXCLOqW5vZGV4aF9fXzQgcmVjZWl2ZWQgbm9uLWVycm9yIHZhbHVlIChhZnRlcikgI3tlcnJvcn1cIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHRyeVxuICAgIHN0YWNrX3JwciA9IGZvcm1hdF9zdGFjayBlcnJvclxuICBjYXRjaCBzZWNvbmRhcnlfZXJyb3JcbiAgICBkZWJ1ZyAnzqlub2RleGhfX181J1xuICAgIGRlYnVnICfOqW5vZGV4aF9fXzYnLCAnLScucmVwZWF0IDEwOFxuICAgIGRlYnVnICfOqW5vZGV4aF9fXzcnXG4gICAgZGVidWcgXCLOqW5vZGV4aF9fXzggd2hlbiB0cnlpbmcgdG8gY2FsbCBgZm9ybWF0X3N0YWNrKClgLCBhbiBlcnJvciB3YXMgdGhyb3duOlwiXG4gICAgZGVidWcgJ86pbm9kZXhoX19fOSdcbiAgICBkZWJ1ZyAnzqlub2RleGhfXzEwJywgaW5zcGVjdCBzZWNvbmRhcnlfZXJyb3JcbiAgICBkZWJ1ZyAnzqlub2RleGhfXzExJ1xuICAgIGRlYnVnICfOqW5vZGV4aF9fMTInLCAnLScucmVwZWF0IDEwOFxuICAgIGRlYnVnICfOqW5vZGV4aF9fMTMnXG4gICAgc3RhY2tfcnByID0gbmV3IEVycm9yIFwizqlub2RleGhfXzE0IChub3QgYSBKUyBFcnJvciB2YWx1ZSkgI3tpbnNwZWN0IGVycm9yfVwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgd3JpdGVfdG9fc3RkZXJyIHN0YWNrX3JwclxuICBzZXRJbW1lZGlhdGUgKCAtPiBwcm9jZXNzLmV4aXQgMTExIClcbiAgcmV0dXJuIG51bGxcblxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdP1xuICBudWxsXG4gIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdID0gdHJ1ZVxuICBwcm9jZXNzLm9uY2UgJ3VuY2F1Z2h0RXhjZXB0aW9uJywgIGV4aXRfaGFuZGxlclxuICBwcm9jZXNzLm9uY2UgJ3VuaGFuZGxlZFJlamVjdGlvbicsIGV4aXRfaGFuZGxlclxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubW9kdWxlLmV4cG9ydHMgPSB7IGV4aXRfaGFuZGxlciwgfVxuXG4iXX0=
