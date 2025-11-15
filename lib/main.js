(function() {
  'use strict';
  var SFMODULES, exit_handler, format_stack, inspect, write_to_stderr;

  //###########################################################################################################
  // blue    # Слава Україні
  // yellow  # Слава Україні
  SFMODULES = require('bricabrac-sfmodules');

  ({format_stack} = SFMODULES.unstable.require_format_stack());

  ({inspect} = require('node:util'));

  //-----------------------------------------------------------------------------------------------------------
  write_to_stderr = function(text) {
    return process.stderr.write(text + '\n');
  };

  //-----------------------------------------------------------------------------------------------------------
  exit_handler = function(error, origin) {
    // _exit_handler error, origin
    if (!Error.isError(error)) {
      error = new Error(`Ωnodexh___5 (not a JS Error value) ${inspect(error)}`);
    }
    write_to_stderr(format_stack(error));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLE9BQUEsRUFBQSxlQUFBOzs7OztFQU1BLFNBQUEsR0FBNEIsT0FBQSxDQUFRLHFCQUFSOztFQUM1QixDQUFBLENBQUUsWUFBRixDQUFBLEdBQTRCLFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW5CLENBQUEsQ0FBNUI7O0VBQ0EsQ0FBQSxDQUFFLE9BQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsV0FBUixDQUE1QixFQVJBOzs7RUFXQSxlQUFBLEdBQWtCLFFBQUEsQ0FBRSxJQUFGLENBQUE7V0FBWSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsSUFBQSxHQUFPLElBQTVCO0VBQVosRUFYbEI7OztFQWNBLFlBQUEsR0FBZSxRQUFBLENBQUUsS0FBRixFQUFTLE1BQVQsQ0FBQSxFQUFBOztJQUViLEtBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLENBQVA7TUFDRSxLQUFBLEdBQVEsSUFBSSxLQUFKLENBQVUsQ0FBQSxtQ0FBQSxDQUFBLENBQXNDLE9BQUEsQ0FBUSxLQUFSLENBQXRDLENBQUEsQ0FBVixFQURWOztJQUVBLGVBQUEsQ0FBZ0IsWUFBQSxDQUFhLEtBQWIsQ0FBaEI7SUFDQSxZQUFBLENBQWEsQ0FBRSxRQUFBLENBQUEsQ0FBQTthQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsR0FBYjtJQUFILENBQUYsQ0FBYjtBQUNBLFdBQU87RUFOTSxFQWRmOzs7RUF5QkEsSUFBTyxtREFBUDtJQUNFO0lBQ0EsTUFBTSxDQUFFLE1BQU0sQ0FBQyxHQUFQLENBQVcsdUJBQVgsQ0FBRixDQUFOLEdBQStDO0lBQy9DLE9BQU8sQ0FBQyxJQUFSLENBQWEsbUJBQWIsRUFBbUMsWUFBbkM7SUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLG9CQUFiLEVBQW1DLFlBQW5DLEVBSkY7R0F6QkE7OztFQWlDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUFFLFlBQUY7QUFqQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiXG4ndXNlIHN0cmljdCdcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgYmx1ZSAgICAjINCh0LvQsNCy0LAg0KPQutGA0LDRl9C90ZZcbiMgeWVsbG93ICAjINCh0LvQsNCy0LAg0KPQutGA0LDRl9C90ZZcblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdicmljYWJyYWMtc2Ztb2R1bGVzJ1xueyBmb3JtYXRfc3RhY2ssICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zvcm1hdF9zdGFjaygpXG57IGluc3BlY3QsICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnbm9kZTp1dGlsJ1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbndyaXRlX3RvX3N0ZGVyciA9ICggdGV4dCApIC0+IHByb2Nlc3Muc3RkZXJyLndyaXRlIHRleHQgKyAnXFxuJ1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4aXRfaGFuZGxlciA9ICggZXJyb3IsIG9yaWdpbiApIC0+XG4gICMgX2V4aXRfaGFuZGxlciBlcnJvciwgb3JpZ2luXG4gIHVubGVzcyBFcnJvci5pc0Vycm9yIGVycm9yXG4gICAgZXJyb3IgPSBuZXcgRXJyb3IgXCLOqW5vZGV4aF9fXzUgKG5vdCBhIEpTIEVycm9yIHZhbHVlKSAje2luc3BlY3QgZXJyb3J9XCJcbiAgd3JpdGVfdG9fc3RkZXJyIGZvcm1hdF9zdGFjayBlcnJvclxuICBzZXRJbW1lZGlhdGUgKCAtPiBwcm9jZXNzLmV4aXQgMTExIClcbiAgcmV0dXJuIG51bGxcblxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdP1xuICBudWxsXG4gIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdID0gdHJ1ZVxuICBwcm9jZXNzLm9uY2UgJ3VuY2F1Z2h0RXhjZXB0aW9uJywgIGV4aXRfaGFuZGxlclxuICBwcm9jZXNzLm9uY2UgJ3VuaGFuZGxlZFJlamVjdGlvbicsIGV4aXRfaGFuZGxlclxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubW9kdWxlLmV4cG9ydHMgPSB7IGV4aXRfaGFuZGxlciwgfVxuXG4iXX0=
