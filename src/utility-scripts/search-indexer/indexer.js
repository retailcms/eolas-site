// These are the content.xml files to load
var xmlFiles = [
	'../../content/m1/content.xml'
];

// These are glossary files to index
var glossaryFiles = [
	//'../../content/global-assets/xml/glossary.xml'
];

// Where to place the search index file
var dest = '../../content/search-index.json';

// fs module required for file system reading
var fs = require('fs');

// cheerio implements jQuery-like behaviour for server side
var cheerio = require('cheerio');

// Include Lunr which we will need to generate the index
var lunr = require('lunr');

// Create Lunr index
var index = lunr(function(){
	this.ref('id');								// Page ID
	this.field('title', { boost: 20 });			// Page title
	this.field('term', { boost: 100});			// Glossary term
	this.field('body');							// Page body / glossary definition
});

// File counter
var count 		= 0;
var totalFiles	= xmlFiles.length + glossaryFiles.length;
console.log('Total XML files in index: ' + totalFiles);

// A function to write the index file
function writeIndexFile() {
	// Write search index file once all files processed
	if(count == totalFiles) {
		var json = JSON.stringify(index);
		fs.writeFile(dest, json);
	}
};


// Read in glossary XML files
glossaryFiles.forEach(function(xmlFile) {
	console.log(xmlFile);
	fs.readFile(xmlFile, function(err, data) {

		// Get the raw XML from content.xml as a string
		var xml = data.toString();

		// Parse the XMl using cheerio, similar to jQuery
		var $ = cheerio.load(xml, {xmlMode : true});

		// For each 'content' node in the content.xml
		$('entry').each(function(i, el){

			var doc = {
				id 		: 'glossary-' + i,
				term    : $(el).children('term').text(),
				body    : $(el).children('definition').text(),
				title   : ''
			};

			// Add our document to the Lunr index
			index.add(doc);

		});

		// Increment the counter for the number of XML files processed 
		count++;

		// Write search index file once all files processed
		writeIndexFile();

	});
});


// Read in an XML file
xmlFiles.forEach(function(xmlFile) {

	console.log(xmlFile);
	
	fs.readFile(xmlFile, function(err, data) {
		
		// Get the raw XML from content.xml as a string
		var xml = data.toString();

		// Parse the XMl using cheerio, similar to jQuery
		var $ = cheerio.load(xml, {xmlMode : true});

		// For each 'content' node in the content.xml
		$('content').each(function(i, el){


			// Check whether this page has a 'search=false' attribute
			if($(el).attr('search') === 'false') {
				console.log('Skipped page ' + $(el).attr('id') + ' - search=false attribute');
				return;
			}

			var doc = {
				id 		: $(el).attr('id'),
				title   : $(el).children('text[id=title]').text(),
				body    : '',
				term    : '' 
			};

			// Go through each 'text' node in content.xml to build a body string 
			$(el).children().each(function(j, textNode) {
				doc.body = doc.body + $(textNode).text();
			});

			// Add our document to the Lunr index
			index.add(doc);

		});

		// Increment the counter for the number of XML files processed 
		count++;

		// Write search index file once all files processed
		writeIndexFile();

		// if(count == xmlFiles.length) {
		//		var json = JSON.stringify(index);
		//	fs.writeFile(dest, json);
		// } 

	});
});




