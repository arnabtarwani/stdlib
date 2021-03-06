'use strict';

// MODULES //

var spawn = require( 'child_process' ).spawn;


// FUNCTIONS //

/**
* Callback invoked upon encountering an error.
*
* @private
* @param {Error} error - error object
*/
function onError( error ) {
	process.exitCode = 1;
	console.error( 'Error: %s', error.message ); // eslint-disable-line no-console
} // end FUNCTION onError()

/**
* Callback invoked upon child process close.
*
* @private
* @param {number} code - exit code
* @returns {void}
*/
function onFinish( code ) {
	if ( code !== 0 ) {
		process.exitCode = code;
		return console.error( 'Child process exited with code `'+code + '`.' ); // eslint-disable-line no-console
	}
} // end FUNCTION onFinish()

/**
* Callback invoked upon receiving data from `stdout`.
*
* @private
* @param {Buffer} data - standard output
*/
function stdout( data ) {
	process.stdout.write( data );
} // end FUNCTION stdout()

/**
* Callback invoked upon receiving data from `stderr`.
*
* @private
* @param {Buffer} data - standard error
*/
function stderr( data ) {
	process.stderr.write( data );
} // end FUNCTION stderr()


// MAIN //

/**
* Plugin to view a test coverage report.
*
* @param {string} dir - Makefile directory
* @param {string} cwd - current working directory
* @param {string} subpath - subdirectory path
*/
function plugin( dir ) {
	var opts;
	var args;
	var proc;

	opts = {};
	opts.cwd = dir;

	args = new Array( 1 );

	// Target:
	args[ 0 ] = 'view-cov';

	proc = spawn( 'make', args, opts );
	proc.on( 'error', onError );
	proc.stdout.on( 'data', stdout );
	proc.stderr.on( 'data', stderr );
	proc.on( 'close', onFinish );
} // end FUNCTION plugin()


// EXPORTS //

module.exports = plugin;
