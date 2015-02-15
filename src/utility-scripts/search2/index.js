/**
 * Olice player 
 * Search index builder, re-written as a node module so that it can be used
 * easily from within Gulp.
 *
 * Example:
 *  var search = require('./src/utility-scripts/search2/index.js');
 *
 *  search.addXml('src/content/m1/content.xml');
 *  search.build('src/content/search-index.json');
 */

// Requires
var fs = require('fs');
var cheerio = require('cheerio');
var lunr = require('lunr');

// The module itself
module.exports = {

  // Array of content.xml files
  files : [],

  // Array of glossary.xml files
  glossary : [],

  // Counter for number of XML files processed
  count : 0,

  // Create Lunr index
  index : {},

  // The destination output file
  dest : '',

  // Regex of content to remove from search text
  // This can be used to remove the references strings etc that are present
  // in the content.xml from the search result excerpts
  removeRegex : new RegExp('\ ?\\\\[\\([0-9 \\(\\)\\[\\]\\,\\\\]+\\]', 'g'),

  // Initialise Lunr index
  //
  initialiseIndex : function() {
    this.index = lunr(function(){
      this.ref('id');                         // Page ID
      this.field('title', { boost: 20 });     // Page title
      this.field('term', { boost: 100});      // Glossary term
      this.field('body');                     // Page body / glossary definition
    });
  },

  // Add an XML file to the list
  //
  addContentXml : function(xmlFile) {
    this.files.push(xmlFile);
    console.log(this.files);
  },

  // Add a glossary XML file to the list
  //
  addGlossaryXml : function(xmlFile) {
    this.glossary.push(xmlFile);
    console.log(this.glossary);
  },


  // Write search index JSON file
  // @param string dest the file destination 
  write : function() {
    // Only write file when all files processed
    if(this.count == (this.files.length + this.glossary.length)) {
      var json = JSON.stringify(this.index);
      fs.writeFile(this.dest, json); 
      console.log('Search index written to: ' + this.dest);
    }
  },


  // Strips HTML tags from supplied string 
  // @param string
  // @return string
  stripHtmlTags : function(s) {
    return s.replace(/<(?:.|\n)*?>/gm, '');
  },


  // Build Content XML
  // 
  buildContentXml : function() {

    var self = this;

    // Iterate over XML files
    this.files.forEach(function(xmlFile) {
      
      console.log('Building: ' + xmlFile);

      // Read the XML file
      fs.readFile(xmlFile, function(err, data) {
        
        // Get the raw XML from content.xml as a string
        var xml = data.toString();

        // Parse the XMl using cheerio, similar to jQuery
        var $ = cheerio.load(xml, {xmlMode : true});

        // For each 'content' node in the content.xml
        $('content').each(function(i, el) {

          // Check whether this page has a 'search=false' attribute
          if($(el).attr('search') === 'false') {
            console.log('Skipped page ' + $(el).attr('id') + ' - search=false attribute');
            return;
          }

          // Create a document
          var doc = {
            id      : $(el).attr('id'),
            title   : $(el).children('title').text(),     // Now we have a <title> element in the XML file
            body    : '',
            term    : '' 
          };

          // Go through each 'text' node in content.xml to build a body string 
          $(el).children().each(function(j, textNode) {
            var t = self.stripHtmlTags($(textNode).text());
            t = t.replace(self.removeRegex, '');
            doc.body = doc.body + t;
          });

          // Add our document to the Lunr index
          self.index.add(doc);

        });

        // Increment counter
        self.count++;

        // Write to file if done
        self.write();

      })
    });
  },

  // Build Content XML
  // 
  buildGlossaryXml : function() {

    var self = this;

    // Read in glossary XML files
    this.glossary.forEach(function(xmlFile) {

      console.log('Building: ' + xmlFile);

      fs.readFile(xmlFile, function(err, data) {

        // Get the raw XML from content.xml as a string
        var xml = data.toString();

        // Parse the XMl using cheerio, similar to jQuery
        var $ = cheerio.load(xml, {xmlMode : true});

        // For each 'content' node in the content.xml
        $('entry').each(function(i, el){

          var doc = {
            id    : 'glossary-' + i,
            term    : $(el).children('term').text(),
            body    : $(el).children('definition').text(),
            title   : ''
          };

          // Add our document to the Lunr index
          self.index.add(doc);

        });

        // Increment the counter for the number of XML files processed 
        self.count++;

        // Write search index file once all files processed
        self.write();

      });
    });

  },


  // Build the search index
  build : function(dest) {

    var self = this;

    // Set the destination file
    this.dest = dest;

    // Initialise index
    this.initialiseIndex();

    // Reset file counter 
    this.count = 0;

    this.buildContentXml();
    this.buildGlossaryXml();
  }



};