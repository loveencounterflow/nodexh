
'use strict'


############################################################################################################
GUY                       = require 'guy'
{ alert
  debug   }               = GUY.trm.get_loggers 'NODEXH'
{ rpr
  inspect
  echo
  log     }               = GUY.trm
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
  blue    # Слава Україні
  yellow  # Слава Україні
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
  return R

#-----------------------------------------------------------------------------------------------------------
show_error_with_source_context = ( error, headline ) ->
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
    if ( /\/node_modules\//.test path )
      path_color = yellow
    else
      path_color = gold
    #.......................................................................................................
    fname = callsite.getFunctionName() ? callsite.getMethodName() ? null
    { path
      linenr
      colnr   } = await fetch_mapped_location path, linenr, colnr
    relpath     = PATH.relative process.cwd(), path
    if fname?
      ### TAINT use proper methods to format with multiple colors ###
      fname_txt = steel fname
      width1    = width + ( fname_txt.length - fname.length )
      write_to_stderr arrowhead, path_color ( "#{relpath} @ #{linenr},#{colnr}: #{fname_txt}() \x1b[38;05;234m".padEnd width1, '—' )
    else
      write_to_stderr arrowhead, path_color ( "#{relpath} @ #{linenr},#{colnr}: \x1b[38;05;234m".padEnd width, '—' )
    for context_line in await get_context path, linenr, colnr, width
      write_to_stderr arrowshaft, context_line
  alert '^77765-2^', reverse bold headline
  return null

#-----------------------------------------------------------------------------------------------------------
_exit_handler = ( error, origin ) ->
  ### TAINT origin never used ###
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
unless global[ Symbol.for 'cnd-exception-handler' ]?
  null
  global[ Symbol.for 'cnd-exception-handler' ] = true
  process.once 'uncaughtException',  exit_handler
  process.once 'unhandledRejection', exit_handler


############################################################################################################
module.exports = { exit_handler, _exit_handler, }

