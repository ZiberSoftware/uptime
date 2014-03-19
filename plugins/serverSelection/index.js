/**
 * HTTP options plugin
 *
 * Add options to a HTTP/HTTPS poller on a per-check basis
 *
 * Installation
 * ------------
 * This plugin is enabled by default. To disable it, remove its entry 
 * from the `plugins` key of the configuration:
 *
 *   // in config/production.yaml
 *   plugins:
 *     # - ./plugins/httpOptions
 *
 * Usage
 * -----
 * Add the custom HTTP/HTTPS options in the 'HTTP Options' textarea displayed 
 * in the check Edit page, in YAML format. For instance:
 *
 * method: HEAD
 * headers:
 *   User-Agent: This Is Uptime Calling
 *   X-My-Custom-Header: FooBar
 *
 * See the Node documentation for a list of available options.
 *
 * When Uptime polls a HTTP or HTTPS check, the custom options override
 * the ClientRequest options.
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

		console.log(config.cookieName, '=', server);
   
		poller.target.headers['Cookie'] = config.cookieName + '=' + server;

    if (!options) return;
    return;
  });

};
