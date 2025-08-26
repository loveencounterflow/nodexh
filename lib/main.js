(function() {
  'use strict';
  var SFMODULES, exit_handler, format_stack, write_to_stderr;

  //###########################################################################################################
  // blue    # Слава Україні
  // yellow  # Слава Україні
  SFMODULES = require('bricabrac-single-file-modules');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxFQUFBLGVBQUE7Ozs7O0VBTUEsU0FBQSxHQUE0QixPQUFBLENBQVEsK0JBQVI7O0VBQzVCLENBQUEsQ0FBRSxZQUFGLENBQUEsR0FBNEIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBbkIsQ0FBQSxDQUE1QixFQVBBOzs7RUFVQSxlQUFBLEdBQWtCLFFBQUEsQ0FBRSxJQUFGLENBQUE7V0FBWSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsSUFBQSxHQUFPLElBQTVCO0VBQVosRUFWbEI7OztFQWFBLFlBQUEsR0FBZSxRQUFBLENBQUUsS0FBRixFQUFTLE1BQVQsQ0FBQSxFQUFBOztJQUViLGVBQUEsQ0FBZ0IsWUFBQSxDQUFhLEtBQWIsQ0FBaEI7SUFDQSxZQUFBLENBQWEsQ0FBRSxRQUFBLENBQUEsQ0FBQTthQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsR0FBYjtJQUFILENBQUYsQ0FBYjtBQUNBLFdBQU87RUFKTSxFQWJmOzs7RUFzQkEsSUFBTyxtREFBUDtJQUNFO0lBQ0EsTUFBTSxDQUFFLE1BQU0sQ0FBQyxHQUFQLENBQVcsdUJBQVgsQ0FBRixDQUFOLEdBQStDO0lBQy9DLE9BQU8sQ0FBQyxJQUFSLENBQWEsbUJBQWIsRUFBbUMsWUFBbkM7SUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLG9CQUFiLEVBQW1DLFlBQW5DLEVBSkY7R0F0QkE7OztFQThCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUFFLFlBQUY7QUE5QmpCIiwic291cmNlc0NvbnRlbnQiOlsiXG4ndXNlIHN0cmljdCdcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgYmx1ZSAgICAjINCh0LvQsNCy0LAg0KPQutGA0LDRl9C90ZZcbiMgeWVsbG93ICAjINCh0LvQsNCy0LAg0KPQutGA0LDRl9C90ZZcblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdicmljYWJyYWMtc2luZ2xlLWZpbGUtbW9kdWxlcydcbnsgZm9ybWF0X3N0YWNrLCAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mb3JtYXRfc3RhY2soKVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbndyaXRlX3RvX3N0ZGVyciA9ICggdGV4dCApIC0+IHByb2Nlc3Muc3RkZXJyLndyaXRlIHRleHQgKyAnXFxuJ1xuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4aXRfaGFuZGxlciA9ICggZXJyb3IsIG9yaWdpbiApIC0+XG4gICMgX2V4aXRfaGFuZGxlciBlcnJvciwgb3JpZ2luXG4gIHdyaXRlX3RvX3N0ZGVyciBmb3JtYXRfc3RhY2sgZXJyb3JcbiAgc2V0SW1tZWRpYXRlICggLT4gcHJvY2Vzcy5leGl0IDExMSApXG4gIHJldHVybiBudWxsXG5cblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbnVubGVzcyBnbG9iYWxbIFN5bWJvbC5mb3IgJ2NuZC1leGNlcHRpb24taGFuZGxlcicgXT9cbiAgbnVsbFxuICBnbG9iYWxbIFN5bWJvbC5mb3IgJ2NuZC1leGNlcHRpb24taGFuZGxlcicgXSA9IHRydWVcbiAgcHJvY2Vzcy5vbmNlICd1bmNhdWdodEV4Y2VwdGlvbicsICBleGl0X2hhbmRsZXJcbiAgcHJvY2Vzcy5vbmNlICd1bmhhbmRsZWRSZWplY3Rpb24nLCBleGl0X2hhbmRsZXJcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbm1vZHVsZS5leHBvcnRzID0geyBleGl0X2hhbmRsZXIsIH1cblxuIl19
