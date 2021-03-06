/**
 * Server selection plugin
 *
 * Add options to select a server using a cookie (handy for HAProxy users)
 *
 * Installation
 * ------------
 *
 * Usage
 * -----
 * Add a section named "serverSelection" to the config, with an option 'cookieName' and a collection 'servers'. For instance:
 *
 * serverSelection:
 *   cookieName: SRV
 *   servers:
 *     - web01
 *     - web02
 */
var fs   = require('fs');
var ejs  = require('ejs');
var yaml = require('js-yaml');
var express = require('express');


var template = fs.readFileSync(__dirname + '/views/_detailsEdit.ejs', 'utf8');

exports.initWebApp = function(options) {
	var config = options.config.serverSelection;
	var dashboard =	options.dashboard;

	dashboard.on('populateFromDirtyCheck', function(checkDocument, dirtyCheck, type) {
		if(type !== 'http' && type !== 'https') return;
	
		if(!dirtyCheck.server) return;

		checkDocument.setPollerParam('server', dirtyCheck.server);	
	});

	dashboard.on('checkEdit', function(type, check, partial) {
		if(type !== 'http' && type !== 'https') return;

		var servers = [];
		if(config && config.servers)
			servers = config.servers;

		var render_options = {
			locals : {
				check: check,
				servers : servers
			}
		};
		
		partial.push(ejs.render(template, render_options));

	});

	options.app.use(express.static(__dirname + '/public'));
};

exports.initMonitor = function(options) {
	var config = options.config.serverSelection;

  options.monitor.on('pollerCreated', function(poller, check, details) {
    if (check.type !== 'http' && check.type !== 'https') return;
    var server = check.pollerParams && check.pollerParams.server;

  	if(server) { 
			poller.target.headers['Cookie'] = config.cookieName + '=' + server;
		}

    if (!options) return;
    return;
  });

};
