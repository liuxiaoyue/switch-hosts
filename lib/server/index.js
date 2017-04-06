var expr = require("./app.js");
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require('os');
var sys = os.platform();
var hosts = require("hosts-group");
var config = require('../sysconfig');
var configManager = require('../configManager');
var logger = require('../log/logger');
var fs = require('fs');


function openUrl(url) {
  switch (sys) {
  case "darwin":
    exec('open ' + url);
    break;
  case "win32":
    exec('start ' + url);
    break;
  default:
    spawn('xdg-open', [url]);
    break;
  }
}

function setConfig(){
  var configPath = configManager.getPath();
  var content = {
      config: {
          "vhost": {}
      }
  };

  if (!fs.existsSync(configPath)) {
      configManager.set(content.config);
      logger.info("auto product config.json success.....");
  }
}
setConfig();
// function master(){
//   expr.listen(3003);
//   openUrl('http://127.0.0.1:3003/');
// }
// module.exports = master;

hosts.set('hosts', config.uipage.ip, {
  disabled: false
});
expr.listen(3003);
openUrl('http://hosts:3003/');

