//OUT OF DATE, SEE AUTHENTICATION.JS FOR PROPER REQUEST IMPLEMENTATION
var querystring = require("querystring");
var OAuth = require("oauth-1.0a");
var https = require("https");
var nreq = require("./noderequester");
var wp_scope="*";
/* routing functions */

//response = the response we send
//request = the request that we recieved
//search = filter parameters I think

//TODO: clean this stuff up
//DELETED testAuth(): moved functionality to authentication/leg1

//TODO: Clean up TK
//request = the response we send
function events(search, response, request) {
    var requrl = "https://desertcommunityrobotics.com/wp-json/ee/v4.8.29/events";
    https.get(requrl, function (res) {
        var resBody = ""; //the response we get
        res.on("data", function (chunk) {
            resBody += chunk; //we're going to wait until we have everything to send anything in case we want to deserialize the JSON or modify it in some way
        });
        res.on("end", function () {
            var parsedObj = JSON.parse(resBody); //parse the events
            response = easyHeader(response);

            for(var i = 0; i < parsedObj.length; i++){ //iterate through events
                // response.write("Event ID: " + parsedObj[i]["EVT_ID"] +"\n");
                //TODO: attach datetimes
                //TODO: use get /"extraction" functions that build these links, are passed events or whatever
                parsedObj[i]["ticket_link"]="https://desertcommunityrobotics.com/wp-json/ee/v4.8.36/tickets?include=TKT_name%26where[Datetime.Event.EVT_ID]="+parsedObj[i]["EVT_ID"];
                // response.write("\t https://desertcommunityrobotics.com/wp-json/ee/v4.8.36/tickets?include=TKT_name%26where[Datetime.Event.EVT_ID]="+parsedObj[i]["EVT_ID"]+"\n");
            }
            response.write(JSON.stringify(parsedObj)); //Like I said, waiting until data retrieval ends. Shouldn't really slow anything down as this app should have a near-instant connection to the wp
            response.end();
        });
    });
}

function classes(search, response, request) {
    response = easyHeader(response);
    response.write("Hello world! This request was made to /classes");
    response.end();
}
function camps(search, response, request) {
    response = easyHeader(response);
    response.write("Hello world! this request was made to /camps with the filter \"" + search +"\"");
    response.end();
}
function authcallback(search, response, request){
    // console.log(request);\
    var passback = querystring.parse(search);
    var request_data = { //Options for oauth.authorize
        url: 'https://desertcommunityrobotics.com/oauth1/access',
        method: 'POST',
        data: {
            oauth_token: passback["oauth_token"],
            oauth_verifier: passback["oauth_verifier"],
            wp_scope: '*'
        }
    };
    var authInfo = oauth.authorize(request_data);
    console.log(authInfo);
    var data = querystring.stringify(authInfo);
    console.log(data);
    var options = { //options required for the https request
        hostname: 'desertcommunityrobotics.com',
        port: 443,
        path: '/oauth1/access',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };
    var req = https.request(options, function(res){ //create the https request
        var resBody = "";
        res.on("data", function(d) { //get the response body and save it
            resBody+=d;
            // console.log("d: "+d);
        });
        res.on("end", function () {  //response is back, redirect the user and pass the oauth token.  SHOULD THIS BE POSTED?
            response = easyHeader(response);

            response.write(resBody);
            response.end();
        });
    });
    req.write(data);  //write the authorization info to the request
    req.end();

    req.on('error', (e) => {
        console.error(e);
    });


}

/* Useful functions */

function jsFriendlyJSONStringify(s) {
    return JSON.stringify(s, null, 2);
}

function easyHeader(response){
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.writeHead(200, {
        "Content-Type": "text/plain"
    });
    return response;
}



exports.camps = camps;
exports.classes = classes;
exports.events = events;
exports.testAuth = testAuth;
exports.authcallback = authcallback;
