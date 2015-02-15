/**
 * Olice player 
 * 
 * Content XML replacement 
 * re-written as node module to avoid run-time evaluation 
 *
 */

// Requires
var fs = require('fs');
var cheerio = require('cheerio');
var glob = require('glob');
var q = require('q');

// The module itself
module.exports = {

    /**
     * The base directory for HTML files
     * @var string
     */
    baseDir : 'dist/',


    /**
     * Content data from XML files
     * @var object
     */
    content : {},


    /**
     * Load text data from all content.xml files
     */
    loadContentXml : function(cb) {

        var pattern = this.baseDir + '/**/content.xml';

        var self = this;

        // Find XML files in directory
        glob(pattern, function (er, files) {

          for(i in files) {
            var xmlFile = files[i];

            // Load the XML file
            var data = fs.readFileSync(xmlFile);

            // Get the raw XML from content.xml as a string
            var xml = data.toString();

            // Parse the XMl using cheerio, similar to jQuery
            var $ = cheerio.load(xml, {xmlMode : true});

            // For each 'content' node in the content.xml
            $('content').each(function(i, el) {

              var contentId = $(el).attr('id');

              self.content[contentId] = {};

              // For each text node 
              $(el).children('text').each(function(j, textNode) {
                var textId = $(textNode).attr('id');
                var text   = $(textNode).text();
                self.content[contentId][textId] = text;
              });

              // For title node
              $(el).children('title').each(function(j, titleNode) {
                self.content[contentId]['title'] = $(titleNode).text();
              });
            });

     
          }
          cb();
       });
    },

    /**
     * Process translations in folder
     */
    process : function(cb) {

        //var deferred = q.defer();

        var self = this;

        // Load content.xml files 
        this.loadContentXml(function() {

          // Search pattern for HTML files
          var pattern = self.baseDir + '/**/*.html';

          // Find HTML files
          glob(pattern, function (er, files) {

            // Go through HTML files
            for(i in files) {

              // HTML file path
              var htmlFile = files[i];

              // Convert HTML file to player ID
              var contentId = htmlFile.replace(self.baseDir, '').replace(/\//g, '_').replace('.html', '');
                
              if(contentId in self.content) {

                // Get HTML file data as string
                var data = fs.readFileSync(htmlFile);

                // Parse the HTML using cheerio, similar to jQuery
                var $ = cheerio.load(data.toString());

                // Replace the content
                for(textId in self.content[contentId]) {

                  // The text to insert
                  var text = self.content[contentId][textId];

                  // Find HTML node
                  $('[data-text-id=' + textId + ']').each(function(j, ele) {
                      // console.log(ele.name);
                    switch(ele.name.toLowerCase()) {

                      // IMG tags - replace alt tag
                      case 'img':
                        $(ele).attr('alt', text);
                        break;

                      // Default tags - replace HTML content
                      default:
                        $(ele).html(text);

                    }
                  });
                }; 

                // Write HTML file
                fs.writeFileSync(htmlFile, $.html());
              }
              else {
                console.log(contentId + ' not in content.xml');
              }
            }

            // Resolve the promise
            cb();
       
          });

        });

    }


};