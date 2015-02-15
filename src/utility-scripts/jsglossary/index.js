/**
 * Olice player 
 * 
 * References replacement 
 * re-written as node module to avoid run-time evaluation 
 *
 */

// Requires
var fs = require('fs');
var cheerio = require('cheerio');
var glob = require('glob');
var  _ = require('underscore');

// The module itself
module.exports = {

    /**
     * The base directory for HTML files
     * @var string
     */
    baseDir : 'dist/',

    /**
     * Glossary terms from XML files
     * @var object
     */
    terms : [],

    /**
     * The selector to run the glossary on 
     * @var string
     */
    selector : 'p,li',

    /**
     * The class to add to glossary links
     * @var string
     */
    linkClass : 'glossary',


    /**
     * Load text data from all content.xml files
     */
    loadGlossaryXml : function(cb) {

        var pattern = this.baseDir + '/**/glossary.xml';

        var self = this;

        // Find XML files in directory
        glob(pattern, function (er, files) {

          for(i in files) {
            var xmlFile = files[i];

            // Load the file
            var data = fs.readFileSync(xmlFile);

            // Parse the XML using cheerio, similar to jQuery
            var $ = cheerio.load(data.toString(), {xmlMode : true});

            $('entry').each(function(j, glossaryNode) {

              var term = {};
                              
              $(glossaryNode).children().each(function(j, child) {
                var tagName = child.name;
                term[tagName] = $(child).text();
              });
                
              self.terms.push(term);

            });

          }
        });
    },

    /**
     * Escape text for use in regex
     * @param string the string to escape
     * @return string
     */
    regexEscape : function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    },

    /**
     * Process the glossary on a single node
     */
    processNode : function($, ele) {

        var self = this;

        // Store matched terms in array
        var matched = [];

        // Original HTML
        var html = $(ele).html();

        // Look-ahead - this defines what the term must not be followed by
        var after = '(?![a-zA-Z0-9])';

        // Defines what term must not be preceded by
        var before = new RegExp('[a-z0-9]', 'i');

        _.each(self.terms, function(termObj, j) {

            // Create regex
            var r = new RegExp(self.regexEscape(termObj.term) + after, 'g' + (termObj.matchcase ? '' : 'i'));
            
            // Perform match
            while ((match = r.exec(html)) != null) {

                // Create string
                var termId = '#term-' + matched.length + '#';
                var matchStr = match.toString();

                // This approximates negative look-behind.  We need to check the previous 
                // character to see if end of another word
                var previousChar = match.index == 0 ? null : html.substr(match.index - 1, 1);
                if (previousChar && previousChar.match(before)) {
                    continue;
                }

                // Add to matched array
                matched.push({
                    matchStr: matchStr,
                    termId: termId,
                    termObj: termObj
                });

                // Perform replacement
                var part1 = html.substr(0, match.index);
                var part2 = html.substr(match.index + matchStr.length);

                // Update the HTML with the replacement string
                html = part1 + termId + part2;

            }

        });

        // Perform string replacement
        _.each(matched, function(matchObj, i) {
            // Create HTML link 
            var a = '<a href="#" class="' + self.linkClass + '" data-glossary-definition="' + matchObj.termObj.definition + '" data-glossary-term="' + matchObj.termObj.term + '">' + matchObj.matchStr + '</a>';
            html = html.replace(matchObj.termId, a);
        });


        // Replace the HTML
        $(ele).html(html);

    },



    /**
     * Process references in folder
     */
    process : function() {

      var self = this;

      // Load in glossary terms from XML files
      this.loadGlossaryXml();

      // Search pattern for HTML files
      var pattern = self.baseDir + '/**/*.html';

      // Find HTML files
      glob(pattern, function (er, files) {

        // Go through HTML files
        for(i in files) {

          // HTML file path
          var htmlFile = files[i];

          // Load in with Cheerio
          var html = fs.readFileSync(htmlFile).toString();

          // Parse the HTML using cheerio, similar to jQuery
          var $ = cheerio.load(html);

          // Find elements that match selector
          $(self.selector).each(function(i, ele) {
            self.processNode($, ele);
          });

          // Output file
          fs.writeFileSync(htmlFile, $.html());
        }
        
      });
    }

};