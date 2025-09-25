(function() {
  'use strict';
  var SFMODULES, exit_handler, format_stack, write_to_stderr;

  //###########################################################################################################
  // blue    # Слава Україні
  // yellow  # Слава Україні
  SFMODULES = require('bricabrac-sfmodules');

  ({format_stack} = SFMODULES.unstable.require_format_stack());

  //-----------------------------------------------------------------------------------------------------------
  write_to_stderr = function(text) {
    return process.stderr.write(text + '\n');
  };

  //-----------------------------------------------------------------------------------------------------------
  exit_handler = function(error, origin) {
    // _exit_handler error, origin
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLGVBQUE7Ozs7O0VBTUEsU0FBQSxHQUE0QixPQUFBLENBQVEscUJBQVI7O0VBQzVCLENBQUEsQ0FBRSxZQUFGLENBQUEsR0FBNEIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBbkIsQ0FBQSxDQUE1QixFQVBBOzs7RUFVQSxlQUFBLEdBQWtCLFFBQUEsQ0FBRSxJQUFGLENBQUE7V0FBWSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsSUFBQSxHQUFPLElBQTVCO0VBQVosRUFWbEI7OztFQWFBLFlBQUEsR0FBZSxRQUFBLENBQUUsS0FBRixFQUFTLE1BQVQsQ0FBQSxFQUFBOztJQUViLGVBQUEsQ0FBZ0IsWUFBQSxDQUFhLEtBQWIsQ0FBaEI7SUFDQSxZQUFBLENBQWEsQ0FBRSxRQUFBLENBQUEsQ0FBQTthQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsR0FBYjtJQUFILENBQUYsQ0FBYjtBQUNBLFdBQU87RUFKTSxFQWJmOzs7RUFzQkEsSUFBTyxtREFBUDtJQUNFO0lBQ0EsTUFBTSxDQUFFLE1BQU0sQ0FBQyxHQUFQLENBQVcsdUJBQVgsQ0FBRixDQUFOLEdBQStDO0lBQy9DLE9BQU8sQ0FBQyxJQUFSLENBQWEsbUJBQWIsRUFBbUMsWUFBbkM7SUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLG9CQUFiLEVBQW1DLFlBQW5DLEVBSkY7R0F0QkE7OztFQThCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUFFLFlBQUY7QUE5QmpCIiwic291cmNlc0NvbnRlbnQiOlsiXG4ndXNlIHN0cmljdCdcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgYmx1ZSAgICAjINCh0LvQsNCy0LAg0KPQutGA0LDRl9C90ZZcbiMgeWVsbG93ICAjINCh0LvQsNCy0LAg0KPQutGA0LDRl9C90ZZcblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdicmljYWJyYWMtc2Ztb2R1bGVzJ1xueyBmb3JtYXRfc3RhY2ssICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zvcm1hdF9zdGFjaygpXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxud3JpdGVfdG9fc3RkZXJyID0gKCB0ZXh0ICkgLT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUgdGV4dCArICdcXG4nXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhpdF9oYW5kbGVyID0gKCBlcnJvciwgb3JpZ2luICkgLT5cbiAgIyBfZXhpdF9oYW5kbGVyIGVycm9yLCBvcmlnaW5cbiAgd3JpdGVfdG9fc3RkZXJyIGZvcm1hdF9zdGFjayBlcnJvclxuICBzZXRJbW1lZGlhdGUgKCAtPiBwcm9jZXNzLmV4aXQgMTExIClcbiAgcmV0dXJuIG51bGxcblxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xudW5sZXNzIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdP1xuICBudWxsXG4gIGdsb2JhbFsgU3ltYm9sLmZvciAnY25kLWV4Y2VwdGlvbi1oYW5kbGVyJyBdID0gdHJ1ZVxuICBwcm9jZXNzLm9uY2UgJ3VuY2F1Z2h0RXhjZXB0aW9uJywgIGV4aXRfaGFuZGxlclxuICBwcm9jZXNzLm9uY2UgJ3VuaGFuZGxlZFJlamVjdGlvbicsIGV4aXRfaGFuZGxlclxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xubW9kdWxlLmV4cG9ydHMgPSB7IGV4aXRfaGFuZGxlciwgfVxuXG4iXX0=
