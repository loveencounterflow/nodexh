

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
alertxxx = ( P... ) -> process.stderr.write ' ' + CND.pen P...

#-----------------------------------------------------------------------------------------------------------
get_context = ( path, linenr, colnr ) ->
  ### TAINT use stackman.sourceContexts() instead ###
  try
    lines     = ( FS.readFileSync path, { encoding: 'utf-8' } ).split '\n'
    delta     = 1
    coldelta  = 5
    ### TAINT use more meaningful limit like n times the terminal width, assuming default of 100 ###
    colnr_max = 100
    # effect    = underline
    # effect    = bold
    effect    = reverse
    first_idx = Math.max 0, linenr - 1 - delta
    last_idx  = Math.min lines.length - 1, linenr - 1 + delta
    R         = []
    for line, idx in lines[ first_idx .. last_idx ]
      this_linenr = first_idx + idx + 1
      lnr = ( this_linenr.toString().padStart 4 ) + '│ '
      if this_linenr is linenr
        c0      = colnr - 1
        c1      = colnr + coldelta
        hilite  = effect line[ c0 ... c1 ]
        line    = line[ ... c0 ] + hilite + line[ c1 .. ]
        if c1 > colnr_max
          colnr_max2  = Math.floor colnr_max / 2
          line        = '... ' + line[ c1 - colnr_max2 .. c1 + hilite.length - ( c1 - c0 ) + colnr_max2 ] + ' ...'
        else
          line  = line[ .. colnr_max ]
        R.push  "#{grey lnr}#{cyan line}"
      else
        R.push  "#{grey lnr}#{grey line}"
    # R = R.join '\n'
  catch error
    throw error unless error.code is 'ENOENT'
    # return [ ( red "!!! #{rpr error.message} !!!" ), ]
    return []
  return R

#-----------------------------------------------------------------------------------------------------------
resolve_locations = ( frames, handler ) ->
  load_source_map = require 'load-source-map'
  debug '^3334^', ( k for k of load_source_map )
  for frame in frames
    path  = frame.file
    path  = null if path in [ '', undefined, ]
    continue unless path?
    do ( path ) ->
      load_source_map path, ( lsm_error, sourcemap ) ->
        return if lsm_error?
        return unless sourcemap?
        # return handler error if error?
        # return handler() unless sourcemap?
        position  = sourcemap.originalPositionFor { line: linenr, column: colnr, }
        linenr    = position.line
        colnr     = position.column
        # debug '^3387^', ( k for k of sourcemap )
        whisper 'load-source-map', position
        whisper 'load-source-map', { path, linenr, colnr, }
  handler()
  return null

#-----------------------------------------------------------------------------------------------------------
show_error_with_source_context = ( error, headline ) ->
  ### From https://github.com/watson/stackman#gotchas: "This module works because V8 (the JavaScript engine
      behind Node.js) allows us to hook into the stack trace generator function before that stack trace is
      generated. It's triggered by accessing the .stack property on the Error object, so please don't do
      that before parsing the error to stackman, else this will not work!" ###
  arrowhead   = white '▲'
  arrowshaft  = white '│'
  width       = process.stdout.columns
  callsites   = get_error_callsites error
  callsites.reverse()
  callsites.forEach ( callsite ) ->
    unless ( path = callsite.getFileName() )?
      alertxxx grey '—'.repeat 108
      return null
    linenr    = callsite.getLineNumber()
    colnr     = callsite.getColumnNumber()
    relpath     = PATH.relative process.cwd(), path
    # debug "^8887^ #{rpr {path, linenr, callsite:callsite.getFileName(),sourceContexts:null}}"
    if path.startsWith 'internal/'
      alertxxx arrowhead, grey "#{relpath} ##{linenr}"
      return null
    # alertxxx()
    # alertxxx steel bold reverse ( "#{relpath} ##{linenr}:" ).padEnd 108
    alertxxx arrowhead, gold ( "#{relpath} @ #{linenr},#{colnr}: \x1b[38;05;234m".padEnd width, '—' )
    source      = get_context path, linenr, colnr
    alertxxx arrowshaft, line for line in source
    return null
    alert reverse bold headline
  # if error?.message?
  return null

#-----------------------------------------------------------------------------------------------------------
@exit_handler = ( error ) ->
  message             = ' EXCEPTION: ' + ( error?.message ? "an unrecoverable condition occurred" )
  # if stack = error?.where ? error?.stack ? null
  #   message += '\n--------------------\n' + stack + '\n--------------------'
  # [ head, tail..., ]  = message.split '\n'
  # # debug '^222766^', { stack, }
  # # debug '^222766^', { message, tail, }
  # alert reverse ' ' + head + ' '
  # warn line for line in tail
  # if error?.stack?
  #   debug '^4445^', "show_error_with_source_context"
  #   show_error_with_source_context error, ' ' + head + ' '
  # else
  #   whisper error?.stack ? "(error undefined, no stack)"
  # process.exitCode = 1
  # debug '^33333442-1^'
  #.........................................................................................................
  show_error_with_source_context error, "+++ HEADLINE GOES HERE +++" # ' ' + head + ' '
  setImmediate ( -> process.exit 111 )
  # process.exit 111
@exit_handler = @exit_handler.bind @


############################################################################################################
unless global[ Symbol.for 'cnd-exception-handler' ]?
  global[ Symbol.for 'cnd-exception-handler' ] = true
  process.on 'uncaughtException',  @exit_handler
  process.on 'unhandledRejection', @exit_handler

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

