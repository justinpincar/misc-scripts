var auth = require("http-auth");
var http = require('http');
var url = require("url");
var sys = require('sys');
var spawn = require('child_process').spawn;
var util = require('util');

var basic = auth.basic({
  realm : "Restricted"
}, function (username, password, callback) {
  callback(username === "irally" && password === "password");
});

http.createServer(basic, function(req, res) {
  var pathname = url.parse(req.url).pathname;
  res.writeHead(200, {"Content-Type": "text/html"});

  if (req.method == "POST" && pathname == "/deploy-irally-tv") {
    deploy(res, "irally-tv");
  } else {
    res.end('This is the **STAGING** web deployment endpoint - please be careful.<br />Only click once, and wait for the page to load.<br /><br /><br /><form action="/deploy-irally-tv" method="post"><input type="submit" value="Deploy staging.irally.tv" /></form>');
  }
}).listen(9999);

function writeHtml(data, label, res) {
  var html = data.toString().replace(/\n/g, '<br />');
  res.write(label.toUpperCase() + ": " + html);
}

function deploy(res, site) {
  util.log("Deploying " + site);
  res.write("Deploying " + site + "... please wait until deploy has FINISHED...<br /><br />");
  child = spawn("/usr/local/bin/cap", ["staging", "deploy"], {cwd: "/home/ubuntu/irally-v3"});

  child.stdout.on('data', function(data) {
    writeHtml(data, 'stdout', res);
  });

  child.stderr.on('data', function(data) {
    writeHtml(data, 'stderr', res);
  });

  child.on('close', function(code) {
    res.end('<br /><br />FINISHED with code: ' + code);
  });
}

