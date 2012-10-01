exports.hook_data_post = function (next, connection) {
    connection.notes.discard = true;

    if (!containsAddress(connection, 'exceptions@aux.new.edu')) {
	log("Skipping exception_forward");
	return next();
    } else {
	log("Running exception_forward");
    }

    dumpObject(connection);

    var subject = connection.transaction.header.get('Subject');
    checkAndCreateStory(subject);
    sendEvent();

    return next();
}

function checkAndCreateStory(targetName) {
  log("checkAndCreateStory");
    var options = {
	host: 'www.pivotaltracker.com',
	port: 80,
	path: '/services/v3/projects/311681/stories?filter%3Dlabel%3A%22exception%22%20type%3Abug',
	method: 'GET',
	headers: {
 	    'X-TrackerToken': '2535ba9e34c25cb4666fb0759d372b1f'
	}
    };

    var http = require('http');
    var req = http.get(options, function(res) {
	var pageData = "";
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
	    pageData += chunk;
	});
	
	res.on('end', function(){
	    var libxmljs = require("libxmljs");
	    var xmlDoc = libxmljs.parseXmlString(pageData);
	    var names = xmlDoc.find('//stories/story/name');
	    
	    for (var i=0; i<names.length; i++) {
		var name = names[i].text();

		if (name == targetName) {
                    log("Found existing story, skipping story creation for: " + targetName);
		    return true;
		}
	    }

            log("About to create story for exception: " + targetName);
	    try {
	      createStory(targetName);
	    } catch (err) {
	      log(err);
            }
	});
    });
}

function createStory(storyName) {
  log("createStory");
    var story_xml = "<story><story_type>bug</story_type><labels>exception</labels><name>" + htmlEscape(storyName) + "</name><requested_by>API Robot</requested_by></story>";
    var options = {
	host: 'www.pivotaltracker.com',
	port: 80,
	path: '/services/v3/projects/311681/stories',
	method: 'POST',
	headers: {
 	    'X-TrackerToken': '2535ba9e34c25cb4666fb0759d372b1f',
	    'Content-type': 'application/xml',
	    'Content-Length': story_xml.length
	}
    };

    var http = require('http');
    var req = http.request(options, function(res) {
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
	  log(chunk);	
	});
    });
    req.write(story_xml);
    req.end();
}

function containsAddress(connection, target) {
    var rcpt_tos = connection.transaction.rcpt_to;
    for (var i = 0; i < rcpt_tos.length; i++) {
	var address = rcpt_tos[i].original;
	if (address.indexOf(target) != -1) {
	    return true;
	}
    }

    return false;
}

function dumpObject(object) {
    var sys = require('sys');
    sys.puts(sys.inspect(object));
}

function log(message) {
    var sys = require('sys');
    sys.puts(message);
}

function htmlEscape(target) {
    return target.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sendEvent() {
 log("sendEvent()");
 var options = {
    host: 'aux.new.edu',
    port: 1337,
    path: '/events/exception',
    method: 'GET'
  };
 
  var http = require('http');
  http.get(options, function() {})
    .on('error', function(e) {
      log("e: " + e.message);
    });
}

