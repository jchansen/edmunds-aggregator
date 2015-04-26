'use strict';

var readline = require('readline');
var Promise = require('bluebird');

function query(prompt) {
  return new Promise(function (resolve) {
    var rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt(prompt + '> ');
    rl.prompt();
    rl.on('line', function(line) {
      rl.close();
      resolve(line);
    });
  });
}

function valOrQuery(value, queryStr) {
  return (function() {
    if (value !== undefined) {
      return new Promise(function(resolve) { resolve(value); });
    } else {
      return query(queryStr);
    }
  })();
}

module.exports = {
  query: query,
  valOrQuery: valOrQuery
};
