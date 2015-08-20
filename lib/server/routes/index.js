/*
 * GET home page.
 */
var logger = require('../../log/logger.js');
var fs = require("fs");
var path = require("path");
var hosts = require('hosts-group');
var utils = require('../../utils');
var os = require('os');
var configManager = require('../../configManager');

function getScope() {
	var host = hosts.get();
	var json = configManager.getJson();
	json['hosts'] = host;
	return json;
}

exports.index = function(req, res) {
	var ifaces = os.networkInterfaces();
	var ip = [];
	for (var dev in ifaces) {
		var alias = 0;
		ifaces[dev].forEach(function(details) {
			if (details.family == 'IPv4') {
				ip.push([dev + (alias ? ':' + alias: ''), details.address]); ++alias;
			}
		});
	}
	res.render('index', {
		title: 'switch-hosts admin',
		ip: ip
	});
};

exports.scope = function(req, res) {
	var data = getScope();
	res.json(data);
};

exports.save = function(req, res) {
	var data = req.body;
	var olddata = getScope();
	var newdata = utils._.extend(olddata, data);
	configManager.set(newdata);
	res.json(newdata);
};

exports.removeHost = function(req, res) {
	var host = hosts.get();
	var domain = req.body.domain;
	var olddata = getScope();
	delete olddata['vhost'][domain];
	configManager.set(olddata);
	olddata['hosts'] = host;
	res.json(olddata);
};

exports.toggleHost = function(req, res) {
	var host = hosts.get();
	var domain = req.body.domain;
	var olddata = getScope();
	olddata['vhost'][domain]['status'] = ! olddata['vhost'][domain]['status'];
	configManager.set(olddata);
	olddata['hosts'] = host;
	res.json(olddata);
};

exports.removeGroup = function(req, res) {
	var groupname = req.body.groupname;
	var olddata = getScope();
	olddata['proxyGroup'] = utils._.without(olddata['proxyGroup'], groupname);
	olddata['proxy'] = utils._.filter(olddata['proxy'], function(proxy) {
		return proxy.group != groupname;
	});
	configManager.set(olddata);
	res.json(olddata);
};