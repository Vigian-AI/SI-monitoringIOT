// Registry terpusat untuk services — elak circular dependency antara server.js dan routes
let _services = {};

function setServices(services) {
  _services = services;
}

function getServices() {
  return _services;
}

module.exports = { setServices, getServices };
