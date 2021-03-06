'use strict';

// MODULES //

var logger = require( 'debug' );
var visit = require( 'unist-util-visit' );
var toSVG = require( '@stdlib/_tools/markdown/inline-svg-equation' );


// VARIABLES //

var debug = logger( 'remark-svg-equations:transformer' );
var EQN_START = /<!-- <equation.*> -->/;
var EQN_END = /<!-- <\/equation> -->/;
var LABEL = /label="([^"]*)"/;
var RAW = /raw="([^"]*)"/;


// MAIN //

/**
* Transforms a Markdown abstract syntax tree (AST) by finding equation markup and inserting rendered SVGs.
*
* @private
* @param {Node} tree -  - abstract syntax tree (AST)
* @param {File} file - file
* @param {Callback} clbk - callback to invoke upon completion
* @returns {void}
*/
function transformer( tree, file, clbk ) {
	var equations;
	var total;
	var idx;

	equations = [];
	idx = -1;

	debug( 'Processing virtual file...' );
	visit( tree, 'html', visitor );

	total = equations.length;
	debug( 'Found %d equations.', total );
	if ( total === 0 ) {
		return done();
	}
	return next();

	/**
	* Callback invoked upon finding a matching node which searches for Markdown equations.
	*
	* @private
	* @param {Node} node - reference node
	* @param {number} index - position of `node` in `parent`
	* @param {Node} parent - parent of `node`
	* @returns {void}
	*/
	function visitor( node, index, parent ) {
		var label;
		var raw;
		var err;

		if ( EQN_START.test( node.value ) === true ) {
			debug( 'Found an equation...' );

			label = LABEL.exec( node.value );
			if ( label === null ) {
				debug( 'Invalid node: %s', node.value );
				err = new Error( 'invalid node. Equation comments must have a valid label. Node: '+node.value+'.' );
				return done( err );
			}
			label = label[ 1 ];
			debug( 'Label: %s', label );

			raw = RAW.exec( node.value );
			if ( raw === null ) {
				debug( 'Invalid node: %s', node.value );
				err = new Error( 'invalid node. Equation comments must have valid equation text. Node: '+node.value+'.' );
				return done( err );
			}
			raw = raw[ 1 ];
			debug( 'Raw equation: %s', raw );

			equations.push({
				'parent': parent,
				'index': index,
				'label': label,
				'raw': raw
			});
		}
	} // end FUNCTION visitor()

	/**
	* Generates the next SVG equation.
	*
	* @private
	*/
	function next() {
		var opts;
		idx += 1;
		opts = {
			'label': equations[ idx ].label,
			'raw': equations[ idx ].raw
		};
		debug( 'Generating an SVG...' );
		toSVG( opts, onSVG );
	} // end FUNCTION next()

	/**
	* Callback invoked upon converting TeX to SVG.
	*
	* @private
	* @param {(Error|null)} error - error object
	* @param {string} svg - SVG string
	* @returns {void}
	*/
	function onSVG( error, svg ) {
		var newNode;
		var parent;
		var i;
		if ( error ) {
			debug( 'Error encountered when attempting to create an SVG: %s', error.message );
			return done( error );
		}
		debug( 'Generated SVG: %s', svg );

		newNode = {
			'type': 'html',
			'value': svg
		};
		parent = equations[ idx ].parent;
		i = equations[ idx ].index;

		// Case 1: insert new node between equation tags...
		if ( EQN_END.test( parent.children[ i+1 ].value ) ) {
			debug( 'Inserting new node...' );
			parent.children.splice( i+1, 0, newNode );
		}
		// Case 2: replace existing node...
		else if ( EQN_END.test( parent.children[ i+2 ].value ) ) {
			debug( 'Replacing existing node...' );
			parent.children[ i+1 ] = newNode;
		}
		else {
			debug( 'Invalid node: %s', parent.children[ idx ].value );
			error = new Error( 'invalid node. Invalid equation comment. Ensure that the Markdown file includes both starting and ending equation comments. Node: `' + parent.children[ idx ].value + '`.' );
			return done( error );
		}
		debug( 'Finished processing Markdown equation.' );
		done();
	} // end FUNCTION onSVG()

	/**
	* Callback invoked once finished processing an AST.
	*
	* @private
	* @param {(Error|null)} error - error object
	* @returns {void}
	*/
	function done( error ) {
		if ( error ) {
			return clbk( error );
		}
		if ( idx === total-1 ) {
			debug( 'Finished processing virtual file.' );
			return clbk( null, tree );
		}
		next();
	} // end FUNCTION done()
} // end FUNCTION transformer()


// EXPORTS //

module.exports = transformer;
