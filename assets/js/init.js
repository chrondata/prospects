(function( window ) {
'use strict';

// Variation of Paul Irish's log() for my IIFE setup:
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
function log() {
  log.history = log.history || [];
  log.history.push( arguments );
  if ( window.console ) {
    window.console.log( Array.prototype.slice.call( arguments ) );
  }
}

var head = document.getElementsByTagName( 'head' )[ 0 ],
  jsPaths,
  rootPath,
  rootPaths,
  Tap;

rootPath = '//s3.amazonaws.com/chronicle-studio/che_prospects/';


jsPaths = [
  '20130828-demographics.min.js'
];

// Load the required JS files.
(function() {
  var i,
    len,
    path,
    script;

  for ( i = 0, len = jsPaths.length; i < len; i++ ) {
    path = jsPaths[ i ];
    script = document.createElement( 'script' );
    script.setAttribute( 'src', rootPath + path );
    head.appendChild( script );
  }
}());



// Run the application's init function once it's available, assuming we haven't
// previously said not to run it.
function init() {
  Tap = window.Tap;

  if ( Tap && Tap.config ) {
    if ( !Tap.config.initOccurred && !Tap.config.avoidInit ) {
      $( window.document ).ready(function() {
        if ( $( '.tap-advanced-search' ).length !== 0 ) {
          Tap.init();
        }
      });
    }

    return;
  }

  window.setTimeout( init, 100 );
}
init();

}( this ));