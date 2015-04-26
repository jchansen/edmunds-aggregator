'use strict';

var program = require('commander');
var path = require('path');
var valOrQuery = require('../utils').valOrQuery;
var outputFilename = 'styles.json';
var fs = require('fs');

program
  .command('generate:styles')
  .option('-f, --fileName [fileName]', 'json file to load [fileName]')
  .action(function(cmd) {
    valOrQuery(cmd.fileName, 'enter filename').then(function(fileName) {
      var filePath = path.isAbsolute(fileName) ? fileName : path.join("../", fileName);
      var json = require(filePath);
      var makes = Object.keys(json);
      var styles = {};
      makes.forEach(function(make){
        var make = json[make];
        var models = make.models;
        Object.keys(models).forEach(function(modelName){
          var model = models[modelName];
          model.years.forEach(function(year){
            year.styles.forEach(function(style){
              var submodel = style.submodel;
              console.log(submodel.body);
              styles[submodel.body] = submodel.body;
            });
          });
        });
      });

      fs.writeFile(outputFilename, JSON.stringify(Object.keys(styles), null, 4), function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("JSON saved to " + outputFilename);
        }
      });
    })
  });
