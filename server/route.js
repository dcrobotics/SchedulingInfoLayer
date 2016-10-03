var WP = require('wpapi');
var url  = require('url');

var util  = require('./util.js');

// Create the wpapi JSON objects
const DATA_SITE = 'https://waybright.com/'
const WP_JSON_HEAD = 'wp-json/'
var wpEp = new WP({ endpoint: DATA_SITE + WP_JSON_HEAD,
                 });
var wpEpDiscovery = WP.discover( DATA_SITE );

// Request handlers
var wpRequestHandlers     = require('./wpRequestHandlers.js');
var eeRequestHandlers     = require('./eeRequestHandlers.js');
var reportRequestHandlers = require('./reportRequestHandlers.js');

// 404 not found
var notFound404 = function notFound404(req, rsp, next) {
  rsp.status(404);
  rsp.render('404', {title: '404 Not Found'});
};

var apiRoute = function apiRoute(req, rsp, next) {
  var timeDate = new Date();
  var checkAuth;
  var parse;

  var respond = function respond(data,err){
    if (err) {
      util.sendResponse(rsp, util.contType.TEXT, err );
    } else {
      util.sendResponse(rsp, util.contType.JSON, JSON.stringify(data));
    }
  };

  console.log('Request for ' + req.url + ' received from ' + req.headers['x-forwarded-for'] + ' on ' + timeDate.toString());

  var path = url.parse(req.url).pathname;
  var splitPath = path.split('/')
  var query = url.parse(req.url).query;
  switch (splitPath[1]) {
    case 'wp':
      checkAuth = wpRequestHandlers.wpCheckAuth;
      parse     = wpRequestHandlers.wpParse;
      break;
    case 'ee':
      checkAuth = eeRequestHandlers.eeCheckAuth;
      parse     = eeRequestHandlers.eeParse;
      break;
    case 'report':
      checkAuth = reportRequestHandlers.reportCheckAuth;
      parse     = reportRequestHandlers.reportParse;
      break;
    case 'refresh':
      wpEpDiscovery = WP.discover( DATA_SITE );
      util.sendResponse(rsp, util.contType.TEXT, 'Discovery data has been refreshed.' );
      return;
      break;
    default:
      notFound404(req, rsp, next);
      return;
  }
 // if (checkAuth(splitPath) & !req.isAuthenticated()){
 //   notFound404(req, rsp, next);
 //   return;
 // }
  parse(req, splitPath, query, respond);

};

// Route exports
exports.notFound404 = notFound404;
exports.apiRoute    = apiRoute;

// WPAPI JSON REST API exports
exports.DATA_SITE     = DATA_SITE;
exports.WP_JSON_HEAD  = WP_JSON_HEAD;
exports.wpEp          = wpEp;
exports.wpEpDiscovery = wpEpDiscovery;
