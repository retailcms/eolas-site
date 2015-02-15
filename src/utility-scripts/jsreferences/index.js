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

    // The first regex matches multiple references 
    groupRegex : new RegExp('\ ?\\\\[\\([0-9 \\(\\)\\[\\]\\,\\\\]+\\]', 'g'),
    
    // The second extracts the reference IDs from a string
    singleRegex : new RegExp('\\(([0-9]+)\\)', 'g'),


    /**
     * Content data from XML files
     * @var object
     */
    references : {},


    /**
     * Checks whether the supplied array is sequencial
     * @param array the array to test
     * @return boolean
     */
    isSequence : function(arr) {
        if(arr.length < 3) {
            return false;
        }
        var isSequence = true;
        _.each(arr, function(val, i) {
            if(i > 0) {
                var thisVal = parseInt(val);
                var lastVal = parseInt(arr[i-1]);
                if((thisVal-lastVal) != 1) {
                    isSequence = false;
                }
            }
        });
        return isSequence;
    },



    /**
     * Load text data from all content.xml files
     */
    loadReferencesXml : function(cb) {

        var pattern = this.baseDir + '/**/references.xml';

        var self = this;

        // Find XML files in directory
        glob(pattern, function (er, files) {

          for(i in files) {
            var xmlFile = files[i];

            // Load the file
            var data = fs.readFileSync(xmlFile);
  
            // Parse the XML using cheerio, similar to jQuery
            var $ = cheerio.load(data.toString(), {xmlMode : true});

            $('references').children('reference').each(function(j, refNode) {
              var id = $(refNode).children('id').text();
              var pub= $(refNode).children('publication').text();
              self.references[id] = {
                publication : pub,
                sequence    : j+1
              };
              
            });
          }

          // Run callback
          cb();

        });
    },

    /**
     * Process references in folder
     */
    process : function(cb) {

        var self = this;

        console.log('References started.');

        this.loadReferencesXml(function() {

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

              var matches = [];

              while ((match = self.groupRegex.exec(html)) !== null) {

                  var startPos    = match.index;
                  var endPos      = match.index + match[0].length;
                  var token       = '#ref-' + matches.length;

                  match.token     = token;
                  match.idMatches = [];

                  // Match reference IDs in the string
                  while((idMatch = self.singleRegex.exec(match[0])) !== null) {
                      match.idMatches.push(idMatch[1]);
                  };
                  
                  // Add match to matches array
                  matches.push(match);

                  // Replace match with tokens
                  html = html.substr(0, startPos) + token + html.substr(endPos);

              };



              // Now replace tokens       
              _.each(matches, function(match, i) {

                  // This is the reference string that will be displayed as a link
                  var temp = [];

                  //var sequence = true;
                  _.each(match.idMatches, function(id, i) {
                    if(!(id in self.references)) {
                      console.log('Reference ID ' + id + ' not found');
                      return;
                    }
                    temp.push(self.references[id].sequence);  
                  });

                  // The string we will display as a link to the user
                  var refStr = temp.length == 1 ? temp[0] 
                    : (self.isSequence(temp) ? _.first(temp) + '-' + _.last(temp) : temp.join(','));
                  var refAttr= match.idMatches.join(',');

                  console.log(temp);
                  console.log(refAttr);
                  console.log(refStr);

                  // Replace in the HTML
                  html = html.replace(match.token, '<sup><a href="#" data-reference-id="' + refAttr + '" class="reference">' + refStr + '</a></sup>');

              });   

              // Output new HTML file
              fs.writeFileSync(htmlFile, html);

            };

            console.log('References finished.');
            cb();




         });

      });



    }


};