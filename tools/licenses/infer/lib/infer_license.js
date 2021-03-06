'use strict';

// MODULES //

var debug = require( 'debug' )( 'licenses:infer:license' );
var getKeys = require( 'object-keys' ).shim();
var replace = require( '@stdlib/string/replace' );
var removePunctuation = require( '@stdlib/string/remove-punctuation' );
var RE_WHITESPACE = require( './re_whitespace.js' );
var RE_LIST_MARKS = require( './re_list_marks.js' );
var LICENSES = require( './db.js' );


// VARIABLES //

var KEYS = getKeys( LICENSES );


// MAIN //

/**
* Attempts to infer one or more licenses from file content.
*
* @private
* @param {string} file - file content
* @returns {(StringArray|EmptyArray)} inferred license(s)
*/
function infer( file ) {
	var license;
	var out;
	var i;

	debug( 'Normalizing file content...' );
	file = removePunctuation( file );
	file = replace( file, RE_LIST_MARKS, '' );
	file = replace( file, RE_WHITESPACE, '|' );

	// TODO: maybe use distance measure, like lev dist, and threshold (?); could be tricky as some licenses are quite similar and may have to weight based on license length.
	debug( 'Inferring licenses...' );
	out = [];
	for ( i = 0; i < KEYS.length; i++ ) {
		license = LICENSES[ KEYS[i] ];
		if ( file.indexOf( license.text ) > -1 ) {
			debug( 'Found matching license text. Inferred license: %s.', license.spdx );
			out.push( license.spdx );
		} else if ( file.indexOf( '|'+license.spdx+'|' ) > -1 ) {
			debug( 'Found matching license SPDX identifier. Inferred license: %s.', license.spdx );
			out.push( license.spdx );
		}
	}
	debug( 'Inferred %d licenses.', out.length );
	return out;
} // end FUNCTION infer()


// EXPORTS //

module.exports = infer;
