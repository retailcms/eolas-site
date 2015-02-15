<?php

class OliceTranslation {

	/** 
	 * The path to the source files
	 * @var string
	 */
	protected $srcPath;
	
	/**
	 * The path for the output HTML
	 * @var string
	 */
	protected $htmlPath;
	
	/**
	 * XML file for output
	 * @var SimpleXMLElement
	 */
	protected $xml;
	
	/**
	 * Test mode
	 * @var boolean
	 */
	protected $testMode = false;
	
	/**
	 * Constructor 
	 */
	public function __construct() {
		// Create a new XML output file
		$this->xml 			= new SimpleXMLExtended('<player></player>');
	}
	
	/**
	 * Whether to run in test mode.  If so, some random text is placed in each element
	 * @param boolean $bool
	 */
	public function setTestMode($bool) {
		$this->testMode = (boolean)$bool;
		return $this;
	}
	
	
	/**
	 * Gets random string of text for test purposes
	 * @return string
	 */ 
	private function getRandomText() {
		$text = array(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			'Nulla laoreet massa sed sem ultrices, eu ornare tellus tempus. ',
			'Aliquam erat volutpat. ',
			'Aenean venenatis facilisis nibh, eget ultricies augue gravida quis.',
			'Vestibulum quis rhoncus diam. Sed dictum purus ac turpis pharetra euismod. ',
			'Proin nec iaculis nisl. ',
			'Curabitur mattis nisl condimentum quam fermentum, vitae vehicula nulla tempus.',
			'Phasellus sem velit, mattis sed justo consequat, condimentum aliquam nisl. ',
			'Suspendisse posuere tellus non auctor cursus.'
		);
		return $text[array_rand($text)];
	}
	
	
	/**
	 * Set the HTML destination directory 
	 * @param string $path
	 * @return this
	 */
	public function setHtmlPath($path) {
		$this->htmlPath = $path;
		return $this;
	}
	
	
	/**
	 * Sets the path to the source HTML files
	 * @param string
	 */
	public function setSrcPath($path) {
		$this->srcPath = $path;
		return $this;
	}
	
	/**
	 * Scans the src path for HTML files - returns array of file paths
	 * @return array
	 */
	public function findHtmlFiles() {
		$dir 			= new RecursiveDirectoryIterator($this->srcPath);
		$iterator = new RecursiveIteratorIterator($dir);
		$regex 		= new RegexIterator($iterator, '/^.+\.html$/i', RecursiveRegexIterator::GET_MATCH);
		
		$htmlFiles= array();
		foreach($regex as $item) {
		  $file = (string)$item[0];
		  if(strpos($file, '_proc') === false) {
				$htmlFiles[] = (string)$item[0];
			}
		}
		return $htmlFiles;
	}
	
	
	/**
	 * Generates a string to use as the page ID from the directory/filename
	 * @param string $file the path
	 * @return string the ID
	 */
	public function getPageId($path) {
		$find 		= array('content/',	'../',	'/',	'.html');
		$replace  	= array('',			'',		'_',	'');
		return str_replace($find, $replace, $path);
	}

	/**
	 * Generates page URL - equivalent to the part after the #
	 * @param string $file the path
	 * @return string
	 */
	public function getPageUrl($path) {
		return str_replace('../', '', $path);
	}
	
	/**
	 * Parse the files
	 */
	public function parseFiles() {
		$htmlFiles = $this->findHtmlFiles();
		
		$helper = new OliceXmlHelper();
		
		foreach($htmlFiles as $i => $file) {
		
			// Get the HTML file content
			$pageHtml = file_get_contents($file);

		    // Create XML element child for the new page
			$xmlPage  = $this->xml->addChild('content');
			$xmlPage->addAttribute('id', 		$this->getPageId($file));
			$xmlPage->addAttribute('url',		$this->getPageUrl($file));
			$xmlPage->addAttribute('lang',	'en');
			
			// Load original XML file and merge the content into this new document
			$origXmlFile = str_replace('.html', '.xml', $file);
			$origXmlIds  = array();			// Ids that were present in original XML file
			if(file_exists($origXmlFile)) {
				$origXml = new SimpleXMLElement(file_get_contents($origXmlFile));
				foreach($origXml->content[0] as $child) {
					$attr = $child->attributes();
					$helper->copyNode($xmlPage, $child);
					$origXmlIds[] = (string)$attr['id'];
				}
			}
						
			// Parse HTML into node tree using DOMDocument
			// The xml tag is used to force utf 8 
			$dom = new DomDocument();
			$dom->loadHTML('<?xml encoding="UTF-8">' . $pageHtml);	

			//$dom->loadHTML($pageHtml);
			
			// Use DOMXPath to find paragraph tags etc.
			$xpath 		= new DOMXpath($dom);
			$elements = $xpath->query("//p | //h1 | //h2 | //h3 | //h4 | //h5 | //h6 | //li"); 
			
			foreach($elements as $i => $element) {
	
				// The node's current HTML ID
				$id = $element->getAttribute('id');
					
				// Make up an ID if there isn't one 
				if(empty($id)) {
					$id = 'text-' . $i;
				}
				
				// Set new data attribute 
				$element->setAttribute('data-text-id', $id);
				
				// Don't re-add the same element found via DOMDocument that we already
				// added above from the original XML file
				if(!in_array($id, $origXmlIds)) {
				
					// This is the text only without any tags
					$textContent = $element->textContent;

					// This is the HTML content including parent tag
					$htmlContent = $dom->saveHTML($element);

					// Get inner content of tag
					if($element->hasChildNodes()) {
						$innerContent = '';
						foreach($element->childNodes as $child) {
							$innerContent .= $dom->saveHTML($child);
						}
					}
					else {
						$innerContent = $element->textContent;
					}
				
					// Test mode - get random content
					if($this->testMode) {
						$innerContent = $this->getRandomText();
					}
	
					// Trim content for neatness
					$innerContent = trim($innerContent);
	
					// Use CData for escaping
					$xmlChild = $xmlPage->addChild('text');
					$xmlChild->addCData(wordwrap($innerContent));
					$xmlChild->addAttribute('id', $id);
				}
			}
			
			// Create filename for new HTML file in new directory
			$parts = explode('/', $file);
			$htmlFile = $this->htmlPath . implode('/', array_slice($parts, 3));
			
			// Write new HTML file 
			$dom->preserveWhiteSpace = false;
			$dom->formatOutput = true;
			$htmlModified = $dom->saveHTML();
			file_put_contents($htmlFile, $htmlModified);
			
		}
	}
	
	
	public function exportXml($dest) {
		$helper = new OliceXmlHelper();
		$helper->exportXml($this->xml, $dest);
	}
}