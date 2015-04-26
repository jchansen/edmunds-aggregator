#!/usr/bin/env node
'use strict';

var Promise = require("bluebird");
var request = require('request');
var program = require('commander');
var valOrQuery = require('../utils').valOrQuery;
var fs = require('fs');

// config options
var delay = 500;
var outputFilename = 'allMakeModelData.json';
var current = Promise.resolve();
var output = {};
var apiKey = "";

// get: make GET request to Edmunds API
// @url: url you want to GET
// @cb: called when request completes
//
// note: the callback only gets called success. If we hit the rate limit,
// the body.status will say "FORBIDDEN".  A more advanced solution would
// continue retrying that request until it succeeds, and then move onto
// to the next request in the queue. Instead, we're just going to throw
// the body response which will cause the script to stop running.  So
// basically, the whole thing succeeds or the whole thing fails.
function get(url, cb){
  request.get({
    url: url,
    qs: {
      fmt: "json",
      api_key: apiKey
    }
  }, function(err, response, body) {
    body = JSON.parse(body);
    if(body.status === 'FORBIDDEN'){
      throw body;
    }
    cb(err, response, body)
  });
}

// getStylesFor: get the available styles for a given make and model
// @make: the make we want to fetch styles for
// @model: the model we want to fetch styles for
//
// This function returns a promise, which is the key to this script
// the promises are executed in order, and there's a delay between when each
// request is sent.  Adjusting the delay is how we can make requests without hitting
// the rate limit
function getStylesFor(make, model){
  return new Promise(function(resolve, reject){
    var url = "https://api.edmunds.com/api/vehicle/v2/" + make.niceName + "/" + model.niceName;
    get(url, function(err, response, body){
      output[make.name].models[model.name] = body;
      console.log(body);
      console.log("waiting...");
      setTimeout(function(){
        resolve();
      }, delay);
    })
  })
}

// getStylesFor: get the available styles for a given make and model
// @make: the make we want to fetch styles for
// @model: the model we want to fetch styles for
//
// This is the main loop.  It iterates over all the makes and models, gets
// the styles for each one, saves it into a giant JSON object, and then writes
// that object to a file once it's completed.
program
  .command('aggregate:data')
  .option('-k, --apiKey [apiKey]', 'Edmunds API Key [apiKey]')
  .action(function(cmd) {
    valOrQuery(cmd.apiKey, 'enter api key').then(function(key) {
      apiKey = key;
      get("https://api.edmunds.com/api/vehicle/v2/makes", function (err, response, body) {
        var makeModels = [];

        body.makes.forEach(function (make) {
          output[make.name] = {
            id: make.id,
            name: make.name,
            niceName: make.niceName,
            models: {}
          };
          make.models.forEach(function (model) {
            console.log(make.niceName + ": " + model.niceName);
            makeModels.push({
              make: make,
              model: model
            })
          });
        });

        Promise.map(makeModels, function (makeModel) {
          current = current.then(function () {
            return getStylesFor(makeModel.make, makeModel.model);
          });
          return current;
        }).then(function () {
          fs.writeFile(outputFilename, JSON.stringify(output, null, 4), function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("JSON saved to " + outputFilename);
            }
          });
        });
      });
    })
  });
