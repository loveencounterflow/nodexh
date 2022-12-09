
'use strict'


############################################################################################################
GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'NODEXH'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
types                     = new ( require 'intertype' ).Intertype()
{ isa
  type_of }               = types
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
  bold }                  = GUY.trm

#-----------------------------------------------------------------------------------------------------------
write_to_stderr = ( P... ) -> process.stderr.write ' ' + ( GUY.trm.pen P... ) + '\n'

#-----------------------------------------------------------------------------------------------------------
fetch_mapped_location = ( path, linenr, colnr ) ->
  try
    sourcemap = await load_source_map path
    smp       = sourcemap.originalPositionFor { line: linenr, column: colnr, }
  catch error
    # warn '^7763-3^', "!!!!!!!!!!!!!!!!!", { path, }
    # warn '^7763-3^', "!!!!!!!!!!!!!!!!!", error.message
    return { path, linenr, colnr, }
  #.........................................................................................................
  if ( smp? ) and ( smp.source? ) and ( smp.source isnt '' ) and ( smp.line? ) and ( smp.column? )
    mapped_path = PATH.join ( PATH.dirname path ), smp.source
    return { path: mapped_path, linenr: smp.line, colnr: smp.column, }
  #.........................................................................................................
  return { path, linenr, colnr, }

#-----------------------------------------------------------------------------------------------------------
get_context = ( path, linenr, colnr, width ) ->
  try return ( _get_context path, linenr, colnr, width ) catch error
    throw error unless error.code is 'ENOENT'
    # return [ ( red "!!! #{rpr error.message} !!!" ), ]
  return []

#-----------------------------------------------------------------------------------------------------------
_get_context = ( path, linenr, colnr, width ) ->
  lines     = ( FS.readFileSync path, { encoding: 'utf-8' } ).split '\n'
  delta     = 1
  coldelta  = 5
  effect    = reverse
  first_idx = Math.max 0, linenr - 1 - delta
  last_idx  = Math.min lines.length - 1, linenr - 1 + delta
  R         = []
  for line, idx in lines[ first_idx .. last_idx ]
    this_linenr     = first_idx + idx + 1
    this_linenr_txt = ( this_linenr.toString().padStart 4 ) + '│ '
    if this_linenr isnt linenr
      ### TAINT should adjust overlong context lines as well ###
      R.push  "#{grey this_linenr_txt}#{grey line}"
      continue
    ### TAINT perform line length adjustment, hiliting in dedicated method ###
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
  # R = R.join '\n'
  return R

#-----------------------------------------------------------------------------------------------------------
show_error_with_source_context = ( error, headline ) ->
  ### From https://github.com/watson/stackman#gotchas: "This module works because V8 (the JavaScript engine
      behind Node.js) allows us to hook into the stack trace generator function before that stack trace is
      generated. It's triggered by accessing the .stack property on the Error object, so please don't do
      that before parsing the error to stackman, else this will not work!" ###
  alert '^77765-1^', reverse bold headline
  arrowhead   = white '▲'
  arrowshaft  = white '│'
  width       = process.stdout.columns
  callsites   = get_error_callsites error
  #.........................................................................................................
  if ( not callsites? ) or ( callsites.length is 0 )
    write_to_stderr red reverse "^455756^ error has no associated callsites:"
    write_to_stderr red reverse rpr error
    return null
  #.........................................................................................................
  callsites.reverse()
  #.........................................................................................................
  for callsite in callsites
    path = callsite.getFileName()
    #.......................................................................................................
    unless path?
      write_to_stderr grey '—'.repeat 108
      continue
    #.......................................................................................................
    linenr      = callsite.getLineNumber()
    colnr       = callsite.getColumnNumber()
    #.......................................................................................................
    if ( path.startsWith 'node:internal/' ) or ( path.startsWith 'internal/' )
      write_to_stderr arrowhead, grey "#{path} @ #{linenr},#{colnr}"
      continue
    #.......................................................................................................
    # write_to_stderr()
    # write_to_stderr steel bold reverse ( "#{relpath} ##{linenr}:" ).padEnd 108
    fname = callsite.getFunctionName() ? callsite.getMethodName() ? null
    { path
      linenr
      colnr   } = await fetch_mapped_location path, linenr, colnr
    relpath     = PATH.relative process.cwd(), path
    if fname?
      ### TAINT use proper methods to format with multiple colors ###
      fname_txt = steel fname
      width1    = width + ( fname_txt.length - fname.length )
      write_to_stderr arrowhead, gold ( "#{relpath} @ #{linenr},#{colnr}: #{fname_txt}() \x1b[38;05;234m".padEnd width1, '—' )
    else
      write_to_stderr arrowhead, gold ( "#{relpath} @ #{linenr},#{colnr}: \x1b[38;05;234m".padEnd width, '—' )
    for context_line in await get_context path, linenr, colnr, width
      write_to_stderr arrowshaft, context_line
  alert '^77765-2^', reverse bold headline
  # urge "^94843^ error.stack:", rpr error.stack
  # urge "^94843^ error.message:", rpr error.message
  # urge "^94843^ error.code:", rpr error.code
  # urge "^94843^ error.name:", rpr error.name
  # urge "^94843^ error.type:", rpr error.type
  # urge "^94843^ error.toString():", rpr error.toString()
  # urge "^94843^ error:", rpr error
  # CATALOGUING = require '../../multimix/lib/cataloguing'
  # urge "^94843^", ( CATALOGUING.all_keys_of error )
  return null

#-----------------------------------------------------------------------------------------------------------
_exit_handler = ( error, origin ) ->
  ### TAINT origin never used ###
  # show_stacktracey error
  # debug '^4488^', error
  # debug '^4488^', await origin
  # return null
  type    = error.code ? error.name ? 'EXCEPTION'
  message = " #{type}: " + ( error?.message ? "an unrecoverable condition occurred" )
  await show_error_with_source_context error, message
  return null

#-----------------------------------------------------------------------------------------------------------
exit_handler = ( error, origin ) ->
  await _exit_handler error, origin
  setImmediate ( -> process.exit 111 )
  return null

############################################################################################################
############################################################################################################
############################################################################################################

get_stacktracey = ( error ) ->
  StackTracey               = require 'stacktracey'
  stack = ( new StackTracey error ).withSources()
  # stack = stack.clean()
  R     = []
  for idx in [ stack.items.length - 1 .. 0 ] by -1
    d = stack.items[ idx ]
    # debug '^2798^', ( k for k of d )
    s =
      # target_path:    d.file
      relpath:        d.fileRelative # fileShort
      native:         d.native
      # is_nodejs:      d.native
      is_other:       d.thirdParty
      line:           d.line
      column:         d.column
      source:         d.sourceLine
      error:          d.error
    # for k in [ 'sourceLine', 'native', 'file', 'line', 'column', 'calleeShort', 'fileRelative', 'fileShort', 'fileName', 'thirdParty', 'name',]
    #   debug k, rpr d[ k ]
    R.push s
  # info '\n' + stack.asTable()
  return R

show_stacktracey = ( error ) ->
  for d in get_stacktracey error
    echo steel '^44872^ ' + "#{d.relpath} @ #{d.line}:#{d.column}"
    ### NOTE errors:
      ENOENT: no such file or directory
      EISDIR: illegal operation on a directory, read
      'Cannot read property 'originalPositionFor' of undefined'
    ###
    if d.error? then  echo red    '^44873^ ' + ( d.error.message ? "an error occurred" )
    else              echo yellow '^44874^ ' + "#{rpr d.source[ .. 100 ]}"
  return null

############################################################################################################
############################################################################################################
############################################################################################################


############################################################################################################
unless global[ Symbol.for 'cnd-exception-handler' ]?
  null
  global[ Symbol.for 'cnd-exception-handler' ] = true
  process.once 'uncaughtException',  exit_handler
  process.once 'unhandledRejection', exit_handler

  # do =>
  # process.stderr.on 'data', ( data ) => debug "^6863-1^ (stderr.on 'data'):", rpr data
  # process.stdout.on 'data', ( data ) => debug "^6863-2^ (stdout.on 'data'):", rpr data
  # process.stderr.on 'end', => debug "^6863-1^ (stderr.on 'end')"
  # process.stdout.on 'end', => debug "^6863-2^ (stdout.on 'end')"
  # debug '^6456^'
  # echo "^4564^ echo to stdout"
  # warn "^4564^ warn to stderr"
  # process.stderr.write "this goes to stderr\n"
  # process.stdout.write "this goes to stdout\n"
  # process.on 'message', ( message ) -> debug "^6863-3^' (process.on 'message'):", rpr message
  # process.on 'warning', ( warning ) -> debug "^6863-3^' (process.on 'warning'):", rpr warning
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

module.exports = { exit_handler, _exit_handler, }
