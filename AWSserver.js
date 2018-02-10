//To do: create an array of sensor names, then reference the array number.



var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var fs = require('fs');
//var cron = require('node-cron');
var CronJob = require('cron').CronJob;




var app = express();
app.use(bodyParser.json());


var AQLCloudDataRequestString;
var AQLData;                     //JSON Object containing the data from the GET data request from cloud



//// cloud.aeroqual.com  API details:  ////

var username = 'johntest@test.test'          // Variable to hold username from browser
var password = 'password!'; 

//Use POST to log in 
var POSToptions = {
  method: 'POST',
  url: 'https://cloud.aeroqual.com/api/account/login',
  forever: true,
  jar: true,
  form: { UserName: username, Password: password }
};


//Use GET to log in
var GETInstrumentData = {
    method: 'GET',
    url: 'https://cloud.aeroqual.com/api/instrument',
    forever: true,
    jar: true,
 };



//Call this function from the commnad line like this: require('./server.js').login();

module.exports.login = function () {  
console.log('Login attempted with Login =: '+POSToptions.form.UserName+' and Password = '+POSToptions.form.Password);

// POST request method should be called first, it passes in the JSON object (containing the UN and PW) and the cookie is found as part of the response
request(POSToptions, function (error, response, body) {
  if (error) {
    throw new Error(error);
  }
  //First log the HTTP Status Code: Should be 200
  PostHTTPStatusCode = response.statusCode;
  console.log('POST HTTP status code: ' + PostHTTPStatusCode);
  
});
}


//This function sends a GET request to cloud.aeroqua.com for some data, the details are set in the formatDateTimeForAQL function
//Call this function from the commnad line by typing  require('./server.js').GetData();
//You must have called require('./server.js').login(); first before calling this function

module.exports.GetData = function () {  

//First set the date and time for the cloud.aeroqual.com GET request by calling: module.exports.formatDateTimeForAQL();
module.exports.formatDateTimeForAQL();

//Then execute the GET request
request(GETInstrumentData, function (error, response, body) {
  if (error) {
    throw new Error(error);
  }
  //First log the HTTP Status Code: Should be 200
  GETHTTPStatusCode = response.statusCode;
  console.log('cloud.aeroqual.com GET HTTP status code: ' + GETHTTPStatusCode); 
  AQLData = JSON.parse(body);
  
  console.log('Number of data points returned from cloud.aeroqual.com: '+ AQLData.data.length);
  //This should be three data sets, one per minute but it is possible one or more data points will not be available from 
  //cloud.aeroqual.com for some reason. 
  
  console.log(' ');
  console.log('Data from cloud.aeroqual.com for this request: ');
  for (i = 0; i < AQLData.data.length; i++)  {
  console.log(AQLData.data[i].Time + '  Temp: '+AQLData.data[i]["TEMP"]);
  console.log(AQLData.data[i].Time + '  RH  : '+AQLData.data[i]["RH"]);
  console.log(AQLData.data[i].Time + '  CO  : '+AQLData.data[i]["CO"]);
  console.log(AQLData.data[i].Time + '  ITEMP  : '+AQLData.data[i]["ITEMP"]);
  console.log(AQLData.data[i].Time + '  NO2  : '+AQLData.data[i]["NO2"]);
  console.log(AQLData.data[i].Time + '  O3  : '+AQLData.data[i]["O3"]);
  console.log(AQLData.data[i].Time + '  O3 AQIfull  : '+AQLData.data[i]["O3 AQIfull"]);
  console.log(AQLData.data[i].Time + '  PID  : '+AQLData.data[i]["PID"]);
  console.log(AQLData.data[i].Time + '  PM1  : '+AQLData.data[i]["PM1"]);
  console.log(AQLData.data[i].Time + '  PM10  : '+AQLData.data[i]["PM10"]);
  console.log(AQLData.data[i].Time + '  PM2.5  : '+AQLData.data[i]["PM2.5"]);
  console.log(AQLData.data[i].Time + '  TSP  : '+AQLData.data[i]["TSP"]);
  console.log(AQLData.data[i].Time + '  SO2  : '+AQLData.data[i]["SO2"]);
  console.log(AQLData.data[i].Time + '  TestVirtualChannel  : '+AQLData.data[i]["TestVirtualChannel"]);
  console.log(AQLData.data[i].Time + '  WD  : '+AQLData.data[i]["WD"]);
  console.log(AQLData.data[i].Time + '  WS  : '+AQLData.data[i]["WS"]);
  console.log(AQLData.data[i].Time + '  8PC0.3  : '+AQLData.data[i]["8PC0.3"]);
  console.log(AQLData.data[i].Time + '  8PC0.5  : '+AQLData.data[i]["8PC0.5"]);
  console.log(AQLData.data[i].Time + '  8PC0.7  : '+AQLData.data[i]["8PC0.7"]);
  console.log(AQLData.data[i].Time + '  8PC1.0  : '+AQLData.data[i]["8PC1.0"]);
  console.log(AQLData.data[i].Time + '  8PC2.0  : '+AQLData.data[i]["8PC2.0"]);
  console.log(AQLData.data[i].Time + '  8PC3.0  : '+AQLData.data[i]["8PC3.0"]);
  console.log(AQLData.data[i].Time + '  8PC5.0  : '+AQLData.data[i]["8PC5.0"]);
  console.log(AQLData.data[i].Time + '  8PC10.0  : '+AQLData.data[i]["8PC10"]); 

  console.log(' ')
  }
  
 
  //Format the data JSON object ready for the PUT request to EagleIO;
  formatDataPutRequestforEagleIO ();
  //Execute the PUT request to EagleIO
  module.exports.EagleIORequest();

});

}


//// end: cloud.aeroqual.com  API details:  ////







//// start: api.eagle.io  API details:  ////

var EagleIOoptions = {
  method: 'PUT',
  url: 'https://api.eagle.io/api/v1/historic',   //This value is set using the XXXXX function prior to calling the Login function().
  headers: {
  	//'content-type': 'application/json',
  	'x-api-key': 'sXJkDI4kNMURXMKQ8ArlTbsJtH5McGtBMcWN87gT'
           },
  body:    
   {
    "docType": "jts",
    "version": "1.0",
      "header" : {
    "startTime" : "2018-01-30T07:30:00",       //This is set by a function below
    "endTime" : "2018-01-30T07:50:00",         //This is set by a function below
    "columns" : {
      "0" : { "id" : "5a692a338e3f61180731ccc6" },    // TEMP
      "1" : { "id" : "5a692a338e3f61180731ccca" },    // RH
      "2" : { "id" : "5a692a338e3f61180731cc82" },    // CO
      "3" : { "id" : "5a692a338e3f61180731ccc2" },    // ITEMP
      "4" : { "id" : "5a692a338e3f61180731cc7a" },    // NO2
      "5" : { "id" : "5a692a338e3f61180731cc72" },    // O3
      "6" : { "id" : "5a692a338e3f61180731ccce" },    // O3 AQIfull (AQI)
      "7" : { "id" : "5a692a338e3f61180731cc86" },    // PID
      "8" : { "id" : "5a692a338e3f61180731cc8e" },    // PM1  (ug m3)
      "9" : { "id" : "5a692a338e3f61180731cc7e" },    // PM10 (ug m3)
      "10" : { "id" : "5a692a338e3f61180731cc92" },   // PM2.5 (ug m3)
      "11" : { "id" : "5a692a338e3f61180731cc96" },   // TSP
      "12" : { "id" : "5a692a338e3f61180731cc8a" },   // SO2
      "13" : { "id" : "5a692a338e3f61180731ccd2" },   // TestVirtualChannel
      "14" : { "id" : "5a692a338e3f61180731ccbe" },   // WD
      "15" : { "id" : "5a692a338e3f61180731ccba" },   // WS
      "16" : { "id" : "5a692a338e3f61180731cc9a" },   // 8PC0.3 (L)
      "17" : { "id" : "5a692a338e3f61180731cc9e" },   // 8PC0.5 (L)
      "18" : { "id" : "5a692a338e3f61180731cca2" },   // 8PC0.7 (L)
      "19" : { "id" : "5a692a338e3f61180731cca6" },   // 8PC1.0 (L)
      "20" : { "id" : "5a692a338e3f61180731ccaa" },   // 8PC2.0 (L)
      "21" : { "id" : "5a692a338e3f61180731ccae" },   // 8PC3.0 (L)
      "22" : { "id" : "5a692a338e3f61180731ccb2" },   // 8PC5.0 (L)
      "23" : { "id" : "5a692a338e3f61180731ccb6" }   // 8PC10.0 (L)
                 }
      },         
   
     "data": [
        {
            "ts": "2018-01-30T07:30+13:00",
            "f": { "0": {"v": 45.05 }, 
                   "1": {"v": 10.6 },
                   "2": {"v": 0.00 },
                   "3": {"v": 0.00 },
                   "4": {"v": 0.00 },
                   "5": {"v": 0.00 },
                   "6": {"v": 0.00 },
                   "7": {"v": 0.00 },
                   "8": {"v": 0.00 },
                   "9": {"v": 0.00 },
                   "10": {"v": 0.00 },
                   "11": {"v": 0.00 },
                   "12": {"v": 0.00 },
                   "13": {"v": 0.00 },
                   "14": {"v": 0.00 },
                   "15": {"v": 0.00 },
                   "16": {"v": 0.00 },
                   "17": {"v": 0.00 },
                   "18": {"v": 0.00 },
                   "19": {"v": 0.00 },
                   "20": {"v": 0.00 },
                   "21": {"v": 0.00 },
                   "22": {"v": 0.00 },
                   "23": {"v": 0.00 }
                 }
        },
        


        {
            "ts": "2018-01-30T07:40+13:00",
            "f": { "0": {"v": 0.00 }, 
                   "1": {"v": 0.00 },
                   "2": {"v": 0.00 },
                   "3": {"v": 0.00 },
                   "4": {"v": 0.00 },
                   "5": {"v": 0.00 },
                   "6": {"v": 0.00 },
                   "7": {"v": 0.00 },
                   "8": {"v": 0.00 },
                   "9": {"v": 0.00 },
                   "10": {"v": 0.00 },
                   "11": {"v": 0.00 },
                   "12": {"v": 0.00 },
                   "13": {"v": 0.00 },
                   "14": {"v": 0.00 },
                   "15": {"v": 0.00 },
                   "16": {"v": 0.00 },
                   "17": {"v": 0.00 },
                   "18": {"v": 0.00 },
                   "19": {"v": 0.00 },
                   "20": {"v": 0.00 },
                   "21": {"v": 0.00 },
                   "22": {"v": 0.00 },
                   "23": {"v": 0.00 }
                 }
        },
        

        {
            "ts": "2018-01-30T07:50+13:00",
            "f": { "0": {"v": 0.00 }, 
                   "1": {"v": 0.00 },
                   "2": {"v": 0.00 },
                   "3": {"v": 0.00 },
                   "4": {"v": 0.00 },
                   "5": {"v": 0.00 },
                   "6": {"v": 0.00 },
                   "7": {"v": 0.00 },
                   "8": {"v": 0.00 },
                   "9": {"v": 0.00 },
                   "10": {"v": 0.00 },
                   "11": {"v": 0.00 },
                   "12": {"v": 0.00 },
                   "13": {"v": 0.00 },
                   "14": {"v": 0.00 },
                   "15": {"v": 0.00 },
                   "16": {"v": 0.00 },
                   "17": {"v": 0.00 },
                   "18": {"v": 0.00 },
                   "19": {"v": 0.00 },
                   "20": {"v": 0.00 },
                   "21": {"v": 0.00 },
                   "22": {"v": 0.00 },
                   "23": {"v": 0.00 }
                 }
        }
    ]
},  
   json:     true,
  };









//This function makes a HTTP PUT request to Egale IO and passes in the EagleIOoptions JSON object. 
module.exports.EagleIORequest = function () {  

request(EagleIOoptions, function (error, response, body) {
  if (error) {
    throw new Error(error);
  }
  //First log the HTTP Status Code: Should be 200
  PutHTTPStatusCode = response.statusCode;
  console.log('PUT HTTP status code: ' + PutHTTPStatusCode+ '  Message: '+body.status.message);
  //details = JSON.parse(body);
  //console.log('body contains: '+body.status.message);
});

}

//// stop: api.eagle.io  API details:  ////















//Online resourse for manipulating data time in javascript  https://www.w3schools.com/jsref/jsref_obj_date.asp
//This function formats the date and time in a format that cloud.aeroqual.com and eagleIO.com can read
//The function returns an array, the first item in the array is the DateTime string for egaleIO
//The second item in the array is the DateTime string for aeroqual.com
// aeroqual.com requires the string to be in this format: yyyy-mm-ddThh:mm:ss
// eagleIO.com  requires the string to be in this format: yyyy-mm-ddThh:mm:ss.000Z


function getDateTime(offset) {

    var date = new Date();

    date.setHours(date.getHours()+13);
    date.setMinutes(date.getMinutes()-offset);

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return [
           year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec,
           year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec 
           ]
     
}




// Date Time needs to be in the format yyyy-mm-ddThh:mm:ss for cloud.aeroqual.com
// This function formats the URL for the cloud.aeroqual.com GET request.
// The URL is formatted to requests data from the last 3 minutes in one miunte averages
// This function also sets the date and time stamps in the eagle IO options JSON object ready to be sent to eagle IO.

//This function is called by the GetData() function
module.exports.formatDateTimeForAQL = function ()  {

var DateTimeString; 
var FromDateTime;
var ToDateTime;

ToDateTime = getDateTime(2);
MidDateTime = getDateTime(3);
EagleIOFromDateTime = getDateTime(4);
AQLFromDateTime = getDateTime(5);

//console.log(ToDateTime[0]);
//console.log(FromDateTime[1]);
DateTimeString = ('from='+AQLFromDateTime[0]+'&to='+ToDateTime[0]+'&averagingperiod=1&includejournal=false');
URLprefix      = ('https://cloud.aeroqual.com/api/data/AQM65%2010052017-591?')
GETInstrumentData.url = (URLprefix+DateTimeString);
console.log('Date and time range for cloud.aeroqual.com GET request: '+GETInstrumentData.url);


//Format the JSON object time stamps for the eagle IO data object
formatDateTimePutRequestforEagleIO (ToDateTime,EagleIOFromDateTime,MidDateTime);

}


                                                          
//This function formats the EagleIO.options.body JSON object ready to be used in a PUT request

function formatDateTimePutRequestforEagleIO (ToDateTime,FromDateTime,MidDateTime) {


//First set the start time and end time (ts) values in the header:
EagleIOoptions.body.header.endTime = (ToDateTime[1]) ;
EagleIOoptions.body.header.startTime   = (FromDateTime[1]) ;

//console.log(EagleIOoptions.body.startTime);
//console.log(EagleIOoptions.body.endTime);

//Second set the time (ts) values in the body:
//console.log(EagleIOoptions.body.data);

EagleIOoptions.body.data[0].ts = (FromDateTime[1]+'+13:00');
EagleIOoptions.body.data[1].ts = (MidDateTime[1]+'+13:00');
EagleIOoptions.body.data[2].ts = (ToDateTime[1]+'+13:00');
console.log('Time sent to eagleIO  '+(ToDateTime[1]+'+13:00'));


}


//This function is called after the GetData request (cloud.aeroqual.com).
//This function takes data from the Global AQL Data Object

function formatDataPutRequestforEagleIO () {

//Third set the actual data values:
//console.log(EagleIOoptions.body.data[0].f["0"].v);
//console.log(EagleIOoptions.body.data[0].f["1"].v);

//console.log(EagleIOoptions.body.data[1].f["0"].v);
//console.log(EagleIOoptions.body.data[1].f["1"].v);

//console.log(EagleIOoptions.body.data[2].f["0"].v);
//console.log(EagleIOoptions.body.data[2].f["1"].v);



//Note this needs to be turned in to a for loop, in case only two minutes
// worth of data is returned. 


//Newest data
EagleIOoptions.body.data[0].f["0"].v =  AQLData.data[0]["TEMP"];
EagleIOoptions.body.data[0].f["1"].v =  AQLData.data[0]["RH"];
EagleIOoptions.body.data[0].f["2"].v =  AQLData.data[0]["CO"];
EagleIOoptions.body.data[0].f["3"].v =  AQLData.data[0]["ITEMP"];
EagleIOoptions.body.data[0].f["4"].v =  AQLData.data[0]["NO2"];
EagleIOoptions.body.data[0].f["5"].v =  AQLData.data[0]["O3"];
EagleIOoptions.body.data[0].f["6"].v =  AQLData.data[0]["O3 AQIfull"];
EagleIOoptions.body.data[0].f["7"].v =  AQLData.data[0]["PID"];
EagleIOoptions.body.data[0].f["8"].v =  AQLData.data[0]["PM1"];
EagleIOoptions.body.data[0].f["9"].v =  AQLData.data[0]["PM10"];
EagleIOoptions.body.data[0].f["10"].v = AQLData.data[0]["PM2.5"];
EagleIOoptions.body.data[0].f["11"].v = AQLData.data[0]["TSP"];
EagleIOoptions.body.data[0].f["12"].v = AQLData.data[0]["SO2"];
EagleIOoptions.body.data[0].f["13"].v = AQLData.data[0]["TestVirtualChannel"];
EagleIOoptions.body.data[0].f["14"].v = AQLData.data[0]["WD"];
EagleIOoptions.body.data[0].f["15"].v = AQLData.data[0]["WS"];
EagleIOoptions.body.data[0].f["16"].v = AQLData.data[0]["8PC0.3"];
EagleIOoptions.body.data[0].f["17"].v = AQLData.data[0]["8PC0.5"];
EagleIOoptions.body.data[0].f["18"].v = AQLData.data[0]["8PC0.7"];
EagleIOoptions.body.data[0].f["19"].v = AQLData.data[0]["8PC1.0"];
EagleIOoptions.body.data[0].f["20"].v = AQLData.data[0]["8PC2.0"];
EagleIOoptions.body.data[0].f["21"].v = AQLData.data[0]["8PC3.0"];
EagleIOoptions.body.data[0].f["22"].v = AQLData.data[0]["8PC5.0"];
EagleIOoptions.body.data[0].f["23"].v = AQLData.data[0]["8PC10"];

//Middle data
EagleIOoptions.body.data[1].f["0"].v =  AQLData.data[1]["TEMP"];
EagleIOoptions.body.data[1].f["1"].v =  AQLData.data[1]["RH"];
EagleIOoptions.body.data[1].f["2"].v =  AQLData.data[1]["CO"];
EagleIOoptions.body.data[1].f["3"].v =  AQLData.data[1]["ITEMP"];
EagleIOoptions.body.data[1].f["4"].v =  AQLData.data[1]["NO2"];
EagleIOoptions.body.data[1].f["5"].v =  AQLData.data[1]["O3"];
EagleIOoptions.body.data[1].f["6"].v =  AQLData.data[1]["O3 AQIfull"];
EagleIOoptions.body.data[1].f["7"].v =  AQLData.data[1]["PID"];
EagleIOoptions.body.data[1].f["8"].v =  AQLData.data[1]["PM1"];
EagleIOoptions.body.data[1].f["9"].v =  AQLData.data[1]["PM10"];
EagleIOoptions.body.data[1].f["10"].v = AQLData.data[1]["PM2.5"];
EagleIOoptions.body.data[1].f["11"].v = AQLData.data[1]["TSP"];
EagleIOoptions.body.data[1].f["12"].v = AQLData.data[1]["SO2"];
EagleIOoptions.body.data[1].f["13"].v = AQLData.data[1]["TestVirtualChannel"];
EagleIOoptions.body.data[1].f["14"].v = AQLData.data[1]["WD"];
EagleIOoptions.body.data[1].f["15"].v = AQLData.data[1]["WS"];
EagleIOoptions.body.data[1].f["16"].v = AQLData.data[1]["8PC0.3"];
EagleIOoptions.body.data[1].f["17"].v = AQLData.data[1]["8PC0.5"];
EagleIOoptions.body.data[1].f["18"].v = AQLData.data[1]["8PC0.7"];
EagleIOoptions.body.data[1].f["19"].v = AQLData.data[1]["8PC1.0"];
EagleIOoptions.body.data[1].f["20"].v = AQLData.data[1]["8PC2.0"];
EagleIOoptions.body.data[1].f["21"].v = AQLData.data[1]["8PC3.0"];
EagleIOoptions.body.data[1].f["22"].v = AQLData.data[1]["8PC5.0"];
EagleIOoptions.body.data[1].f["23"].v = AQLData.data[1]["8PC10"];

//Oldest data
EagleIOoptions.body.data[2].f["0"].v =  AQLData.data[2]["TEMP"];
EagleIOoptions.body.data[2].f["1"].v =  AQLData.data[2]["RH"];
EagleIOoptions.body.data[2].f["2"].v =  AQLData.data[2]["CO"];
EagleIOoptions.body.data[2].f["3"].v =  AQLData.data[2]["ITEMP"];
EagleIOoptions.body.data[2].f["4"].v =  AQLData.data[2]["NO2"];
EagleIOoptions.body.data[2].f["5"].v =  AQLData.data[2]["O3"];
EagleIOoptions.body.data[2].f["6"].v =  AQLData.data[2]["O3 AQIfull"];
EagleIOoptions.body.data[2].f["7"].v =  AQLData.data[2]["PID"];
EagleIOoptions.body.data[2].f["8"].v =  AQLData.data[2]["PM1"];
EagleIOoptions.body.data[2].f["9"].v =  AQLData.data[2]["PM10"];
EagleIOoptions.body.data[2].f["10"].v = AQLData.data[2]["PM2.5"];
EagleIOoptions.body.data[2].f["11"].v = AQLData.data[2]["TSP"];
EagleIOoptions.body.data[2].f["12"].v = AQLData.data[2]["SO2"];
EagleIOoptions.body.data[2].f["13"].v = AQLData.data[2]["TestVirtualChannel"];
EagleIOoptions.body.data[2].f["14"].v = AQLData.data[2]["WD"];
EagleIOoptions.body.data[2].f["15"].v = AQLData.data[2]["WS"];
EagleIOoptions.body.data[2].f["16"].v = AQLData.data[2]["8PC0.3"];
EagleIOoptions.body.data[2].f["17"].v = AQLData.data[2]["8PC0.5"];
EagleIOoptions.body.data[2].f["18"].v = AQLData.data[2]["8PC0.7"];
EagleIOoptions.body.data[2].f["19"].v = AQLData.data[2]["8PC1.0"];
EagleIOoptions.body.data[2].f["20"].v = AQLData.data[2]["8PC2.0"];
EagleIOoptions.body.data[2].f["21"].v = AQLData.data[2]["8PC3.0"];
EagleIOoptions.body.data[2].f["22"].v = AQLData.data[2]["8PC5.0"];
EagleIOoptions.body.data[2].f["23"].v = AQLData.data[2]["8PC10"];

//console.log(EagleIOoptions.body);
console.log('8PC0.3 value '+EagleIOoptions.body.data[2].f["16"].v);

}



//Define the timming parameters
var job = new CronJob('03 * * * * *', function() {
var date = new Date();
console.log('The time is: '+date.getMinutes()+ ' API cron job');
module.exports.GetData();
},

false );


module.exports.login();
job.start();




