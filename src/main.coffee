
'use strict'


############################################################################################################
# blue    # Слава Україні
# yellow  # Слава Україні
# SFMODULES                 = require '../../bricabrac-sfmodules'
SFMODULES                 = require 'bricabrac-sfmodules'
{ format_stack,         } = SFMODULES.unstable.require_format_stack()
{ inspect,              } = require 'node:util'
{ debug,                } = console

#-----------------------------------------------------------------------------------------------------------
write_to_stderr = ( text ) -> process.stderr.write text + '\n'

#-----------------------------------------------------------------------------------------------------------
exit_handler = ( error, origin ) ->
  # _exit_handler error, origin
  # debug "Ωnodexh___1 received non-error value (before) #{inspect error}"
  # debug 'Ωnodexh___2', Error.isError error
  unless Error.isError error
    error = new Error "Ωnodexh___3 (not a JS Error value) #{inspect error}"
    debug "Ωnodexh___4 received non-error value (after) #{error}"
  #.........................................................................................................
  try
    stack_rpr = format_stack error
  catch secondary_error
    debug 'Ωnodexh___5'
    debug 'Ωnodexh___6', '-'.repeat 108
    debug 'Ωnodexh___7'
    debug "Ωnodexh___8 when trying to call `format_stack()`, an error was thrown:"
    debug 'Ωnodexh___9'
    debug 'Ωnodexh__10', inspect secondary_error
    debug 'Ωnodexh__11'
    debug 'Ωnodexh__12', '-'.repeat 108
    debug 'Ωnodexh__13'
    stack_rpr = new Error "Ωnodexh__14 (not a JS Error value) #{inspect error}"
  #.........................................................................................................
  write_to_stderr stack_rpr
  setImmediate ( -> process.exit 111 )
  return null



############################################################################################################
unless global[ Symbol.for 'cnd-exception-handler' ]?
  null
  global[ Symbol.for 'cnd-exception-handler' ] = true
  process.once 'uncaughtException',  exit_handler
  process.once 'unhandledRejection', exit_handler


############################################################################################################
module.exports = { exit_handler, }

