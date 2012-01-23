#!/usr/bin/env node
var spawn = require('child_process').spawn
  , http = require('http')
  , qs = require('querystring')
  , program = require('commander')
  , colors = require('colors')

program
  .version('0.5.0')
  .option('-p, --port [port]', 'Run a webhook server on specified port')
  .option('-b, --branch [branch]', 'Only watch for changes on specified branch [master]', 'master')
  .option('-e, --env [env]', 'Run under specified environment')
  .parse(process.argv)

var log = function() {
  console.log("runner: ".magenta + Array.prototype.slice.call(arguments).join(' '));
}

var regen_site = function(){
  var app, fancypid;
  log('regenerating site');
  app = spawn('jekyll');
  fancypid = ('('+app.pid+') ').grey;

  app.stdout.on('data', function(data){
    process.stdout.write(fancypid);
    process.stdout.write(data);
  })
  app.stderr.on('data', function(data){
    process.stderr.write(fancypid);
    process.stderr.write(data);
  })
  return app;
}
var webhook_server = function(port, branch) {
  log('starting webhook server on port', port)
  log('watching for changes on', branch, 'branch');
  http.createServer(function(req, resp){
    var commitData = '';
    req.on('data', function(incoming){ commitData += incoming; })
    req.on('end', function(){
      var commit, payload;
      resp.end('okay');
      try {
        payload = qs.parse(commitData)['payload'];
        commit = JSON.parse(payload);
      } catch(e) {
        log('ignoring illegal webhook attempt from', req.client.remoteAddress);
        return;
      }
      if (commit.ref.match('refs/heads/' + branch)) {
        log('new deploy at ' + (new Date()).toGMTString())
        pull_new_code(regen_site)
      }
    })
 }).listen(port);
}
var pull_new_code = function(callback) {
  var git = spawn('git', ['pull', 'origin', 'master']);
  var preface = 'git '.magenta
  git.stdout.on('data', function(data){
    process.stdout.write(preface);
    process.stderr.write(data);
  })
  git.stderr.on('data', function(data){
    process.stderr.write(preface);
    process.stderr.write(data);
  })
  git.on('exit', function(code, sig){
    if (code === 0) { callback(); }
  })
}
if (program.port && program.branch) {
  webhook_server(program.port, program.branch);
}
log('pid:', process.pid);

