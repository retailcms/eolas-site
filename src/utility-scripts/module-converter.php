<?php

/**
 * Process old modules to new format
 */
 
$src = '../content/m7/';

// Find all pages in the form pagex-x
$pages = glob($src . 'page*/*.html');


function showCode($html) {
  echo '<pre>' . htmlentities($html) . '</pre>';
}

foreach($pages as $page) {

	echo '<li>Processing: ' . $page . '</li>';
	
	// Get base directory for images etc
	$path = substr($page, 0, strrpos ($page, '/')+1);
		
	// Get HTML
	$html = file_get_contents($page);
	
	// Remove head and body tags to leave an HTML fragment
	preg_match('/(<div id="container">[^\2]+(<\/div>))/i', $html, $matches);
	$html = $matches[1];
	
	// Fix paths to image URLs
	$html = str_replace('"images/', '"' . $path . 'images/', $html);

	// Fix paths to interactive and callout directories
	$html = str_replace('"interactive', '"' . $path . 'interactive', $html);
	$html = str_replace('"callout',     '"' . $path . 'callout', $html);
	
	// Save	
	file_put_contents($page, $html);
	
}


// echo json_encode($pages);


// Find all interactive and callout pages in the form calloutx.html, interactivex.html
$popups = glob($src . 'page*/*/*.html');

foreach($popups as $popup) {

	echo '<li>Processing: ' . $popup . '</li>';

	// Get their HTML content
	$html = file_get_contents($popup);

	// Correct the path to the global assets folder
	$html = str_replace('"../../../global_assets', '"../../global-assets', $html);
	
	// Save updated HTML to disk
	file_put_contents($popup, $html);
}


