#!/usr/bin/env node
'use strict';

var program = require('commander');
var requireDir = require('require-dir');

program
  .version('0.0.1');

// Require all commands in commands/, including subfolders
requireDir('./commands', { recurse: true });

program.parse(process.argv);

if (!program.args.length) program.help();
