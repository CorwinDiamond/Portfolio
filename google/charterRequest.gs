/**
 * This Script copies Google form data into a template spreadsheet and emails
 * the pdf to the bus dispatch company and the requesters email
 */

/**
 * Retrieves all the rows in the active spreadsheet that contain data and logs the
 * values for each row.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */

function runall(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Requests");
  var lastRow = sheet.getLastRow();
  for(var r = 2; r <= lastRow; r++)
  {
    if(sheet.getRange(r,1).getBackground() != '#ffff00')
    {
      newCharter(r);
      sheet.getRange(r,1).setBackground('#ffff00');
    };
  };
};

function test(){
  newCharter(6);
};

function newCharter(row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var fSheet = ss.getSheetByName("Requests");
  var cSheet = ss.getSheetByName("CharterNumbers");
  var mSheet = ss.getSheetByName("Master Reply");
  var inRange = fSheet.getRange(row, 2, 1, 59);
  var data = new Array(58);
  var outData = new Array(33);

  for(var i = 0; i < 58; i++)
    data[i] = inRange.getCell(1, 1+i).getValue();

  outData = organizeData(data);
  outData[6] = chartNum(cSheet, outData[7]);
  inRange.getCell(1,57).setValue(outData[6]);

  Logger.log(outData[6]);

  //var newSheet = SpreadsheetApp.create(outData[6]);
  //var range = newSheet.getActiveSheet().getRange(1,1,1,33);
  //var newMsheet =
  var ssnew = SpreadsheetApp.create(outData[6]);
  inRange.getCell(1,58).setValue(ssnew.getId());
  Logger.log("FILE ID" + ssnew.getId());
  inRange.getCell(1,58).setValue(0);
  var newSheet = mSheet.copyTo(ssnew).setName(outData[6]);

  //for(var i = 0; i<33; i++)
    //range.getCell(1,i+1).setValue(outData[i]);
  var pop = populate(newSheet, outData, ssnew,row);
  Logger.log("pop" + pop);
    inRange.getCell(1,58).setBackground('#ffff00');

};

function organizeData(data){
  var returnA = new Array(33);
  returnA[0] = data[4]; //company org
  returnA[1] = data[3]; //billing name
  returnA[2] = data[5]; //billing address1
  returnA[3] = data[6]; //billing address2
  returnA[4] = data[7]; //billing city state zip
  returnA[5] = data[8]; //billing phone
  //returnA[6] =          //reserve for charter number
  returnA[7] = data[11]; //Date of Trip
  returnA[8] = data[12];//# of busses
  returnA[9] = data[16];  //Type of Charter
  returnA[10] = data[13];        //# Trailers
  returnA[11] = data[14];        //# of W/C
  returnA[12] = data[9];        //Group Leader
  returnA[13] = data[10];        //Leaders Phone #
  returnA[14] = data[15];        //Additional Information
  returnA[15] = nonBlank(data[28], data[42], data[53]);      //Notes
  returnA[16] = nonBlank(data[17], data[29], data[43]);      //Pickup Name
  returnA[17] = nonBlank(data[18], data[30], data[44]);      //P address 1
  returnA[18] = nonBlank(data[19], data[54], data[45]);      //p address 2
  returnA[19] = nonBlank(data[20], data[31], data[46]);      //p city state zip
  returnA[20] = nonBlank(data[21], data[32], data[47]);      //loading time
  returnA[21] = nonBlank(data[22], data[33], data[48]);      //departure time
  returnA[22] = nonBlank(data[23], data[34], data[49]);      //due at dest
  returnA[23] = nonBlank(data[24], data[38], data[50]);      //destination name
  returnA[24] = nonBlank(data[25], data[39], data[51]);      //Dest address 1
  returnA[25] = nonBlank(data[26], data[40], data[55]);      //dest address 2
  returnA[26] = nonBlank(data[27], data[41], data[52]);      //dest city state zip
  returnA[27] = data[35];    //Return Loading Time
  returnA[28] = data[36];    //Depart time
  returnA[29] = data[37];    //due at dest
  returnA[30] = data[0];        // requesting person
  returnA[31] = data[1];        // request phone #
  returnA[32] = data[2];        // request e-mail

  return returnA;
};

function chartNum(sheet, DSate)
{
  var date = Utilities.formatDate(DSate, "CST", "yyMMdd");
  var charterNumber = -1;
  var rowIndex = onSearch(date,1,sheet);
  Logger.log(date + "-DATE ROWINDEX_" + rowIndex);

  if(rowIndex != -1) charterNumber = endofRow(rowIndex, sheet);
  else charterNumber = newRow(sheet,date);

  //charterNumber = date*1000 + charterNumber;
  charterNumber = Utilities.formatString("%d %03d", date, charterNumber);
  Logger.log(charterNumber);

  return charterNumber;
};

function endofRow(rowIndex, sheet){
  var i=0;
  var range = sheet.getRange(rowIndex,1,1,sheet.getMaxColumns()+2);
  Logger.log(rowIndex);
  while(range.getCell(1,i+1).getValue() != -1)
     {
       Logger.log(i + " - " + range.getCell(1,i++ +1).getValue())
     };  //-1 is sentinal value for a date.  find index of sentinal.

  range.getCell(1,i+1).setValue(i);
  range.getCell(1,i+2).setValue(-1);
  return i;
};

function newRow(sheet,date){
  sheet.appendRow([date,0,-1]); //0 is current charter and -1 marks end of charters for this date.
  return 0;
};

function onSearch(searchString, column, sheet){
    var columnValues = sheet.getRange(1, column, sheet.getLastRow()).getValues(); //1st is header row
    var searchResult = columnValues.findIndex(searchString); //Row Index - 2
    Logger.log(searchString);

    return searchResult;
};

Array.prototype.findIndex = function(search){
  var returnvalue = -1
  if(search == "") returnvalue = false;
  for (var i=0; i<this.length; i++)
    if (this[i] == search) returnvalue = i+1; //result is actual row index because of +1

  return returnvalue;
};


function nonBlank(v1, v2, v3){
  var returnValue = "";
  if(v1 != "") returnValue = v1;
  else if(v2 != "") returnValue = v2;
  else returnValue = v3;
  Logger.log(v1 + "-     -" + v2 + "-      -" + v3 + "-   _" + returnValue);
  return returnValue;
};

function populate(newsheet, data, ssnew, row)
{
  var range = newsheet.getRange(1,1,50,9);
  if(data[0] != undefined) range.getCell(2,5).setValue(data[0]);//Company or Organization
  if(data[1] != undefined) range.getCell(3,5).setValue(data[1]);//Billing Name
  if(data[2] != undefined) range.getCell(4,5).setValue(data[2]);//Billing Address 1
  if(data[3] != undefined) range.getCell(5,5).setValue(data[3]);//Billing Address 2
  if(data[4] != undefined) range.getCell(6,5).setValue(data[4]);//Billing City, State, Zip
  if(data[5] != undefined) range.getCell(7,5).setValue(data[5]);//Billing Phone Number

  if(data[6] != undefined) range.getCell(10,7).setValue(data[6]);//Charter Number
  if(data[7] != undefined) range.getCell(11,7).setValue(Utilities.formatDate(data[7], "CST", "MM/dd/yy"));//Date of Trip
  if(data[8] != undefined) range.getCell(12,7).setValue(data[8]);//# of busses
  if(data[9] != undefined) range.getCell(13,7).setValue(data[9]);//Type of Charter
  if(data[10] != undefined) range.getCell(14,7).setValue(data[10]);//# of Trailers
  if(data[11] != undefined) range.getCell(15,7).setValue(data[11]);//# of W/C

  if(data[12] != undefined) range.getCell(17,6).setValue(data[12]);//Group Leader
  if(data[13] != undefined) range.getCell(18,6).setValue(data[13]);//Leaders Phone #

  if(data[14] != undefined) range.getCell(21,5).setValue(data[14]);//Additional Info
  if(data[15] != undefined) range.getCell(32,5).setValue(data[15]);//Notes

  if(data[16] != undefined) range.getCell(6,2).setValue(data[16]);//Pickup Name
  if(data[17] != undefined) range.getCell(7,2).setValue(data[17]);//Pickup Address 1
  if(data[18] != undefined) range.getCell(8,2).setValue(data[18]);//Pickup Address 2
  if(data[19] != undefined) range.getCell(9,2).setValue(data[19]);//Pickup City state zip

  if(data[20] != undefined) range.getCell(11,2).setValue(Utilities.formatDate(data[20], "CST", "h:mm a"));//Loading Time
  if(data[21] != undefined) range.getCell(12,2).setValue(Utilities.formatDate(data[21], "CST", "h:mm a"));//Departure Time
  if(data[22] != undefined) range.getCell(13,2).setValue(Utilities.formatDate(data[22], "CST", "h:mm a"));//Due at Dest

  if(data[23] != undefined) range.getCell(15,2).setValue(data[23]);//Destination Name
  if(data[24] != undefined) range.getCell(16,2).setValue(data[24]);//Destination Address 1
  if(data[25] != undefined) range.getCell(17,2).setValue(data[25]);//Destination Address 2
  if(data[26] != undefined) range.getCell(18,2).setValue(data[26]);//Destination City State Zip

  if(data[9] != "One way drop"){
     if(data[27] != undefined) range.getCell(20,2).setValue(Utilities.formatDate(data[27], "CST", "h:mm a"));//Return Loading Time
     if(data[28] != undefined) range.getCell(21,2).setValue(Utilities.formatDate(data[28], "CST", "h:mm a"));//destination departure Time
     if(data[29] != undefined) range.getCell(22,2).setValue(Utilities.formatDate(data[29], "CST", "h:mm a"));//Due at dest time
  };

  var adr1 = Utilities.formatString("%s %s, %s", data[17], data[18], data[19]);
  var adr2 = Utilities.formatString("%s %s, %s", data[24], data[25], data[26]);

  ssnew.deleteSheet(ssnew.getSheetByName("Sheet1"));
  //getDrivingDirections(adr1, adr2, ssnew);  // ----! TO DO!
  emailusr(data[32], data[30], data[31], ssnew, data[6]);
  Logger.log("EMAIL");
  return 1;
};

// ----! TO DO!
// ----! this function is not called, a bad address input causes script to crash
// ----! to lazy to figure out address verification in 2014
function getDrivingDirections(start, end, ss){
  var drout = ss.getSheetByName("Sheet1");
  var lastRow = drout.getLastRow();

  // These regular expressions will be used to strip out
  // unneeded HTML tags
  var r1 = new RegExp('<b>', 'g');
  var r2 = new RegExp('</b>', 'g');
  var r3 = new RegExp('<div style="font-size:0.9em">', 'g');
  var r4 = new RegExp('</div>', 'g');

  // points is used for storing the points in the step-by-step directions
  var points = [];

  // currentLabel is used for number the steps in the directions
  var currentLabel = 0;

  // This will be the map on which we display the path
  var map = Maps.newStaticMap().setSize(500, 350);

  // Create a new UI Application, which we use to display the map
  var ui = UiApp.createApplication();
  // Create a Flow Panel widget, which we use for the directions text
  var directionsPanel = ui.createFlowPanel();

  // Create a new DirectionFinder with our start and end addresses, and request the directions
  // The response is a JSON object, which contains the directions
  var directions = Maps.newDirectionFinder().setOrigin(start).setDestination(end).getDirections();

  // Much of this code is based on the template referenced in
  // http://googleappsdeveloper.blogspot.com/2010/06/automatically-generate-maps-and.html
  for (var i in directions.routes) {
    for (var j in directions.routes[i].legs) {
      for (var k in directions.routes[i].legs[j].steps) {
        // Parse out the current step in the directions
        var step = directions.routes[i].legs[j].steps[k];

        if(step.polyline)
        {
           // Call Maps.decodePolyline() to decode the polyline for
           // this step into an array of latitudes and longitudes
           var path = Maps.decodePolyline(step.polyline.points);
           points = points.concat(path);

           // Pull out the direction information from step.html_instructions
           // Because we only want to display text, we will strip out the
           // HTML tags that are present in the html_instructions
           var text = step.html_instructions;
           text = text.replace(r1, ' ');
           text = text.replace(r2, ' ');
           text = text.replace(r3, ' ');
           text = text.replace(r4, ' ');

           // Add each step in the directions to the directionsPanel
           directionsPanel.add(ui.createLabel((++currentLabel) + ' - ' + text));
           drout.getRange(++lastRow,1).setValue((currentLabel) + ' - ' + text);
        };
      }
    }
  }

  // be conservative and only sample 100 times to create our polyline path
  var lpoints=[];
  if (points.length < 200)
    lpoints = points;
  else {
    var pCount = (points.length / 2);
    var step = parseInt(pCount / 100);
    for (var i = 0; i < 100; ++i) {
      lpoints.push(points[i * step * 2]);
      lpoints.push(points[(i * step * 2) + 1]);
    }
  }

  // make the polyline
  if (lpoints.length > 0) {
    // Maps.encodePolyline turns an array of latitudes and longitudes
    // into an encoded polyline
    var pline = Maps.encodePolyline(lpoints);

    // Once we have the encoded polyline, add that path to the map
    map.addPath(pline);
  }

  // Create a FlowPanel to hold the map
  var panel = ui.createFlowPanel().setSize('500px', '350px');

  // Get the URL of the map and use that to create an image and add
  // it to the panel.
  panel.add(ui.createImage(map.getMapUrl()));

  // Add both the map panel and the directions panel to the UI instance
  ui.add(panel);
  ui.add(directionsPanel);

  // Next set the title, height, and width of the UI instance
  ui.setTitle('Driving Directions');
  ui.setHeight(525);
  ui.setWidth(500);

  // Finally, display the UI within the spreadsheet
  //SpreadsheetApp.getActiveSpreadsheet().show(ui);

  drout.insertImage(map.getMapUrl(),1,++lastRow,0,0); //url, col, row, pix off x, pix off y
};

function emailusr(email, reqname, phone, ss, charnum){
  //return value = 0;
  SpreadsheetApp.flush();
  var eSubject = Utilities.formatString("Transportation Request %s", charnum);
  var eBody1 = Utilities.formatString("Hi %s,\nYour field trip transportation request has been sent to Dispatch@email.", reqname);
  var eBody2 ="  This email was automatically generated and is not a confirmation to your request.";
  var eBody3 = Utilities.formatString("  Please call us, Phone Number, or Email us, Dispatch@Email, two weeks before the trip to confirm request number %s:\n\n", charnum);
  //var eBody3 = Utilities.formatString("%s\n%s\n%s\n\n", reqname, email, phone);
  var eBody4 = "If you have any questions, comments, changes to the request, or concerns please email Charters@mtibus.com or call (952)935.1990.\n\n";
  var eBody5 = "Thanks,\nDispatch\nCompany Name\nAddress\nDispatch@email\nPhoneNumber";
  var body = Utilities.formatString("%s%s%s%s%s", eBody1, eBody2, eBody3, eBody4, eBody5);
  var mail = GmailApp.sendEmail('Dispatch@email', eSubject, body, {attachments: [ss.getAs('application/pdf')], name: 'Auto Response', replyTo: 'replyTo@mtibus.com', cc: email});
  Logger.log("EMAIL SENT" + mail);
  return mail;
};
