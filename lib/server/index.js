var expr = require("./app.js");
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require('os');
var sys = os.platform();
var hosts = require("hosts-group");
var config = require('../sysconfig');


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

