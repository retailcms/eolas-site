<?php 

/*
A script to Automatically create the English version 
- Update templates
- Any tag without an ID, and with some text, give it an ID and put the text in the XML file 
- XML file per page
- Read in the HTML, automatically generate XML, HTML files might be in sub-folders, 1 level deep

Logic is:
- If it has an ID, leave it as is, and the attribute
- If not, make one up, and set both the ID and attribute 
- Maybe one big XML file in per language 

<body data-page=“1”>
<page id=“1”>
          <content id=“interactive-1”>
</page>

*/

error_reporting(E_ALL);

// Load in class files
include 'SimpleXMLExtended.php';
include 'OliceTranslation.php';
//include 'OliceXmlSplitter.php';
include 'OliceXmlHelper.php';


// Reads in HTML files, automatically extracts content from P, H1-H6, LI tags and places
// in XML file.  Automatically adds data attribute to source HTML file

$olice = new OliceTranslation();
$olice->setSrcPath('../../content/m8/');
//$olice->setTestMode(true);
$olice->findHtmlFiles();

// Where to place processed HTML files
$olice->setHtmlPath('../../content/m7-temp/');
$olice->parseFiles();
$olice->exportXml('content.xml');



// Split an XML file out into individual files for each lang
/*
$splitter = new OliceXmlSplitter();
$splitter->setSrcXml('content_en.xml')
			   ->setDestPath('Glossary/Test Module/content_es/')
			   ->setLang('es-la');
$splitter->export();
*/


