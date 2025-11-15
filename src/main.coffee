
'use strict'


############################################################################################################
# blue    # Слава Україні
# yellow  # Слава Україні
SFMODULES                 = require 'bricabrac-sfmodules'
{ format_stack,         } = SFMODULES.unstable.require_format_stack()
{ inspect,              } = require 'node:util'

#-----------------------------------------------------------------------------------------------------------
write_to_stderr = ( text ) -> process.stderr.write text + '\n'

#-----------------------------------------------------------------------------------------------------------
exit_handler = ( error, origin ) ->
  # _exit_handler error, origin
  unless Error.isError error
    error = new Error "Ωnodexh___5 (not a JS Error value) #{inspect error}"
  write_to_stderr format_stack error
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

