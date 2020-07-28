

'use strict'


############################################################################################################
############################################################################################################
############################################################################################################
### see https://medium.com/@nodejs/source-maps-in-node-js-482872b56116
############################################################################################################
############################################################################################################
############################################################################################################


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'nodexh'
log                       = CND.get_logger 'plain',     badge
debug                     = CND.get_logger 'debug',     badge
info                      = CND.get_logger 'info',      badge
warn                      = CND.get_logger 'warn',      badge
alert                     = CND.get_logger 'alert',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
# stackman                  = ( require 'stackman' )()
get_error_callsites       = require 'error-callsites'
load_source_map           = ( require 'util' ).promisify ( require 'load-source-map' )
FS                        = require 'fs'
PATH                      = require 'path'
{ red
  green
  steel
  grey
  cyan
  bold
  gold
  white
  yellow
  reverse
  underline
  bold }                  = CND
# types                     = new ( require '../../intertype' ).Intertype()
# { isa }                   = types.export()

#-----------------------------------------------------------------------------------------------------------
write_to_stderr = ( P... ) -> process.stderr.write ' ' + CND.pen P...

#-----------------------------------------------------------------------------------------------------------
fetch_mapped_location = ( path, linenr, colnr ) ->
  try
    sourcemap = await load_source_map path
    smp       = sourcemap.originalPositionFor { line: linenr, column: colnr, }
  catch error
    warn '^7763-3^', "!!!!!!!!!!!!!!!!!", error.message
    return { path, linenr, colnr, }
  #.........................................................................................................
  if ( smp? ) and ( smp.source? ) and ( smp.source isnt '' ) and ( smp.line? ) and ( smp.column? )
    mapped_path = PATH.join ( PATH.dirname path ), smp.source
    return { path: mapped_path, linenr: smp.line, colnr: smp.column, }
  #.........................................................................................................
  return { path, linenr, colnr, }

#-----------------------------------------------------------------------------------------------------------
get_context = ( path, linenr, colnr, width ) ->
  #.........................................................................................................
  try
    lines     = ( FS.readFileSync path, { encoding: 'utf-8' } ).split '\n'
    delta     = 1
    coldelta  = 5
    ### TAINT use more meaningful limit like n times the terminal width, assuming default of 100 ###
    # effect    = underline
    # effect    = bold
    effect    = reverse
    first_idx = Math.max 0, linenr - 1 - delta
    last_idx  = Math.min lines.length - 1, linenr - 1 + delta
    R         = []
    for line, idx in lines[ first_idx .. last_idx ]
      this_linenr     = first_idx + idx + 1
      this_linenr_txt = ( this_linenr.toString().padStart 4 ) + '│ '
      if this_linenr is linenr
        c0      = colnr - 1
        c1      = colnr + coldelta
        hilite  = effect line[ c0 ... c1 ]
        line    = line[ ... c0 ] + hilite + line[ c1 .. ]
        if c1 > width
          width2  = Math.floor width / 2
          line    = '... ' + line[ c1 - width2 .. c1 + hilite.length - ( c1 - c0 ) + width2 ] + ' ...'
        else
          line  = line[ .. width ]
        R.push  "#{grey this_linenr_txt}#{cyan line}"
      else
        R.push  "#{grey this_linenr_txt}#{grey line}"
    # R = R.join '\n'
  catch error
    throw error unless error.code is 'ENOENT'
    # return [ ( red "!!! #{rpr error.message} !!!" ), ]
    return []
  return R

#-----------------------------------------------------------------------------------------------------------
show_error_with_source_context = ( error, headline ) ->
  ### From https://github.com/watson/stackman#gotchas: "This module works because V8 (the JavaScript engine
      behind Node.js) allows us to hook into the stack trace generator function before that stack trace is
      generated. It's triggered by accessing the .stack property on the Error object, so please don't do
      that before parsing the error to stackman, else this will not work!" ###
  arrowhead   = white '▲'
  arrowshaft  = white '│'
  width       = process.stdout.columns
  #.........................................................................................................
  for callsite in ( get_error_callsites error ).reverse()
    path = callsite.getFileName()
    #.......................................................................................................
    unless path?
      write_to_stderr grey '—'.repeat 108
      continue
    #.......................................................................................................
    linenr      = callsite.getLineNumber()
    colnr       = callsite.getColumnNumber()
    #.......................................................................................................
    if path.startsWith 'internal/'
      write_to_stderr arrowhead, grey "#{path} ##{linenr}"
      continue
    #.......................................................................................................
    # debug '^344463^', { relpath, linenr, colnr, }
    # write_to_stderr()
    # write_to_stderr steel bold reverse ( "#{relpath} ##{linenr}:" ).padEnd 108
    { path
      linenr
      colnr   } = await fetch_mapped_location path, linenr, colnr
    relpath     = PATH.relative process.cwd(), path
    write_to_stderr arrowhead, gold ( "#{relpath} @ #{linenr},#{colnr}: \x1b[38;05;234m".padEnd width, '—' )
    for context_line in await get_context path, linenr, colnr, width
      write_to_stderr arrowshaft, context_line
  alert '^77765^', reverse bold headline
  # if error?.message?
  return null

#-----------------------------------------------------------------------------------------------------------
exit_handler = ( error ) ->
  message             = ' EXCEPTION: ' + ( error?.message ? "an unrecoverable condition occurred" )
  # if stack = error?.where ? error?.stack ? null
  #.........................................................................................................
  await show_error_with_source_context error, message
  # setImmediate ( -> process.exit 111 )
  # process.exit 111
  return null



############################################################################################################
unless global[ Symbol.for 'cnd-exception-handler' ]?
  global[ Symbol.for 'cnd-exception-handler' ] = true
  process.on 'uncaughtException',  exit_handler
  process.on 'unhandledRejection', exit_handler

###
callsite.getThis() - returns the value of this
callsite.getTypeName() - returns the type of this as a string. This is the name of the function stored in the constructor field of this, if available, otherwise the object's [[Class]] internal property.
callsite.getFunction() - returns the current function
callsite.getFunctionName() - returns the name of the current function, typically its name property. If a name property is not available an attempt will be made to try to infer a name from the function's context.
callsite.getMethodName() - returns the name of the property of this or one of its prototypes that holds the current function
callsite.getFileName() - if this function was defined in a script returns the name of the script
callsite.getLineNumber() - if this function was defined in a script returns the current line number
callsite.getColumnNumber() - if this function was defined in a script returns the current column number
callsite.getEvalOrigin() - if this function was created using a call to eval returns a CallSite object representing the location where eval was called
callsite.isToplevel() - is this a toplevel invocation, that is, is this the global object?
callsite.isEval() - does this call take place in code defined by a call to eval?
callsite.isNative() - is this call in native V8 code?
callsite.isConstructor() - is this a constructor c
###

