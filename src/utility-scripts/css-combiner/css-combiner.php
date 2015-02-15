<?php

/**
 * Process old modules to new format
 */


include 'lessc.inc.php';

// The directory to read for CSS files
$src = '../../content/m7/';

// Find all CSS files in the folder above
$css = glob($src . 'page*/*.css');

// Create a new LESS CSS compiler
$less = new lessc;

// A string containing all the combined CSS files
$cssCombined = '';

foreach($css as $cssFile) {

	// Get the page CSS 
	$css = file_get_contents($cssFile);

	// Build the CSS class name to use as a namespace for the CSS, this will be eg content_page-1-1_page-1-1
	$parts = explode('/', str_replace('../', '', $cssFile));
	$class = implode('_', array_slice($parts, 0, -1)) . '_' . $parts[count($parts)-2];

	// Output debug info
	echo '<li>';
	echo 'CSS file: ' . $cssFile;
	echo ' CSS class: ' . $class;

	// Correct relative URLs in CSS file so they point to the page folder
	$newUrlPath = $parts[count($parts)-2] . '/';
	$css = str_replace('url(', 'url(' . $newUrlPath, $css);

	// If we're IE8, namespace it further for this browser
	if(strpos($cssFile, 'ie8.css') !== false) {
		$class = 'html.ie8 .' . $class;
	}
	else {
		$class = '.' . $class;
	}

	// Add the namespace as a LESS CSS rule wrapping the existing CSS, eg .content_page-1-1_page-1-1 { /* all old page CSS here */ }
	$lessCss = $class . ' {' . $css . '}';

	// Compile the LESS CSS to normal CSS, and combine into a single file
	$cssCombined .= '/* ------------- PAGE CSS for ' .  $cssFile . ' --------------- */';
	$cssCombined .= "\n\n";
	$cssCombined .= $less->compile($lessCss);
	$cssCombined .= "\n\n";

	
}

// Output to a file
$outputFile = $src . 'm3.css';
file_put_contents($outputFile, $cssCombined);

