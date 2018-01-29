/**
 * The fucntions in this file are used for a check-in assistant writen in
 * templated html, as well as using a time driven trigger to email a pdf of the
 * state of the Check-In spreadsheets for archiving before reseting the sheet
 * for the next day. While it is possible to use revision history, most of the
 * users for the company do not know how to use them.  
 */
var emailsEnabled = true;  //set to value false if you want to disable automatic emails when clearing the board.

// onOpen runs when spreadsheet is opened.  Function is used to add menu items
var htmlroute = 0;         //route number
var routeIndex = -1;       //row of spreadsheet
var htmlroutefound = 0;    //route was found
var htmldriver = "";       //driver name
var htmldriverChecked = 0; //driver checked?
var htmlsdriver = "";      //spare name
var htmlparaOneExist = 0;  //1para on route
var htmlparaOneName = "";  //1para name
var htmlparaOneChecked = 0;//1para checked?
var htmlsparaOne = "";     //1spara name
var htmlparaTwoExist = 0;  //2para on route
var htmlparaTwoName = "";  //2para name
var htmlparaTwoChecked = 0;//2para checked?
var htmlsparaTwo = "";     //2spara name
var userProperties = PropertiesService.getUserProperties();
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();           //specify which spreadsheet to manipulate
  var ui = SpreadsheetApp.getUi();                                   //select gui
  ui.createMenu('Board')                                             //creates new menu object called board
       //.addItem('Check-in Driver', 'checkDriver')                            // add clickible 'sub-menu' which calls 'fucntion'
       //.addItem('Check-in Para', 'checkPara')                                // add clickible 'sub-menu' which calls 'fucntion'
       .addItem('Check-in Assistant','showSidebar')
       .addSeparator()                                                              //------------------------------------------- between submenus
       .addItem('Clear Check-ins', 'clearBoard')                             // add clickible 'sub-menu' which calls 'fucntion'
       .addToUi();                                                   //makes ^it^ so.

};

function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('index')
     .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Check-in Assistant')
      .setWidth(300);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showSidebar(html);
};

function checkRoute(route) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();  //identify and name as an object, the active spreadsheet
  var sheet = spreadsheet.getActiveSheet();                 //select active sheet
  var range = sheet.getDataRange();                         //get the sub set of the sheet that is usefull and small
  var aLength = sheet.getLastRow();                         //identfy expected lenght of data to search

  var array = sheet.getRange(1, 1, aLength).getValues(); //1st is header row
  var searchResult = 0;        //search for 1st instance of route on checkin sheet, returns row number if greater than 1 else -1 or false if invalid search
  var notChecked = 1;
  var driverName;

  htmlroute = route;
  routeIndex = -1;
  htmlroutefound = 0;
  htmldriver = "";
  htmldriverChecked = 0;
  htmlsdriver = "";
  htmlparaOneExist = 0;
  htmlparaOneName = "";
  htmlparaOneChecked = 0;
  htmlsparaOne = "";
  htmlparaTwoExist = 0;
  htmlparaTwoName = "";
  htmlparaTwoChecked = 0;
  htmlsparaTwo = "";
  userProperties.setProperty('rindex', -1);
  var dname;
  var rf;
  var pname1;
  var pname2;

  --aLength;  //depreciate aLength so search does not go past end of array.

  if(route == "") searchResult = false;                      //if not a potentialy valid route to search for, flag false search result
  for (var i=0; i<aLength; i++)                              //parse array for match wit route
    if (array[i] == route)                                   //if match
    {
       searchResult = i+1;                                   //set row index as search result

       if(range.getCell(searchResult,3).getValue() != 'NA')  //if indexed check-in is valid, continue
       {                                                     //check for special case check-in, default is "X"
          htmldriver = Utilities.formatString("%s %s", range.getCell(searchResult,5).getValue(), range.getCell(searchResult,6).getValue());
          htmldriverChecked = isChecked(0, range.getCell(searchResult,3).getValue());
          htmlroutefound = 1;
          doesParaExist(1, range.getCell(searchResult,9).getValue());
          htmlparaOneChecked = isChecked(1, range.getCell(searchResult,8).getValue());
          doesParaExist(2, range.getCell(searchResult,11).getValue());
          htmlparaTwoChecked = isChecked(2, range.getCell(searchResult,10).getValue());
          routeIndex = searchResult;
          userProperties.setProperties({
            'hroute' : htmlroute,
            'rindex' : searchResult});
       };
    };
  //Logger.log("AAA: %s",routeIndex);
  var html = HtmlService.createTemplateFromFile('routeInfo')
                        .evaluate()
                        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
                        .setTitle('Check-in Assistant')
                        .setWidth(300);
  SpreadsheetApp.getUi()
        .showSidebar(html);
};

function doesParaExist(paraNum,paraName){
  if(paraName != 'x'){
    if(paraName != 'X'){
      if(paraNum == 1) {
         htmlparaOneExist = 1;
         htmlparaOneName = paraName;
      };
      if(paraNum == 2) {
         htmlparaTwoExist = 1;
         htmlparaTwoName = paraName;
      };
    };
  };
};

function isChecked(pos,text){   //make spare different return
  var name;
  var return_value = 0;
  if(text != ''){
    return_value = true;
    switch (text){
      case 'x' :
      case 'X' : name = "";
                 return_value = 1;
                 break;
      default  : name = text;
                 return_value = 2;
    };
    switch (pos){
      case 0 : htmlsdriver = text;
               break;
      case 1 : htmlsparaOne = text;
               break;
      case 2 : htmlsparaTwo = text;
    };
  };
  return return_value;
};

function doLog(wtf){
  Logger.log(wtf);
};

function chkemp(name,col){
  var index = userProperties.getProperty('rindex');
  //Logger.log("index: %s name: %s col: %s", index, name, col);
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();  //identify and name as an object, the active spreadsheet
  var sheet = spreadsheet.getActiveSheet();                 //select active sheet
  var range = sheet.getDataRange();                         //get the sub set of the sheet that is usefull and small
  var aLength = sheet.getLastRow();                         //identfy expected lenght of data to search

  range.getCell(index,col).setValue(name);
  checkRoute(userProperties.getProperty('hroute'));
};

function flogger(data){
  Logger.log(data);
};

// checkPara is used to check in para's on the active check-in sheet
function checkPara(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();  //identify and name as an object, the active spreadsheet
  var sheet = spreadsheet.getActiveSheet();                 //select active sheet
  var range = sheet.getDataRange();                         //get the sub set of the sheet that is usefull and small
  var aLength = sheet.getLastRow();                         //identfy expected lenght of data to search

  var ui = SpreadsheetApp.getUi();                          //select gui
  var response = ui.prompt('Para for which Route?');        //ask and recive input for wich route to check in
  var route = response.getResponseText();                   //var route = answer to prompt
  var checkText = "X";                                      //default check-in is "X"

  var array = sheet.getRange(1, 1, aLength).getValues(); //1st is header row

  var searchResult = 0;        //search for 1st instance of route on checkin sheet, returns row number if greater than 1 else -1 or false if invalid search
  var notChecked = 1;

  --aLength;  //depreciate aLength so search does not go past end of array.

  if(route == "") searchResult = false;                      //if not a potentialy valid route to search for, flag false search result
  for (var i=0; i<aLength; i++)                              //parse array for match wit route
    if (array[i] == route)                                   //if match
    {
       searchResult = i+1;                                   //set row index as search result

       if(range.getCell(searchResult,8).getValue() != 'NA')  //if indexed check-in is valid, continue
       {                                                     //check for special case check-in, default is "X"
          if(not(range.getCell(searchResult,11) == 'X' || range.getCell(searchResult,11) == 'x')){
             response = ui.prompt(Utilities.formatString("Check-in route %s", route),
                    Utilities.formatString("If a spare para is riding the route %s, please enter their name below.  Otherwise just click \"OK\" to check the para in", route),
                    ui.ButtonSet.OK_CANCEL);
             if(response.getSelectedButton() == ui.Button.OK) {
                if(response.getResponseText() != "") checkText = response.getResponseText();
             };

             range.getCell(searchResult,8).setValue(checkText); //check rout in
             notChecked = 0; //indicate check-in was succesfull
          } else {
             //response = ui.prompt(Utilities.formatString("Check-in route %s", route),
             //     Utilities.formatString("If a spare para is riding the route %s in place of %s, please enter their name below.  Otherwise click \"OK\" to check %s in", route),
             //     ui.ButtonSet.OK_CANCEL);
          };
       };
    };


  if(notChecked) ui.alert("Error: the route entered was not found exactly as typed!"); //if route was not checked in, display error

  response = ui.alert("Do you want to check-in another Para?", ui.ButtonSet.YES_NO)                  //check in another para?

  if(response == ui.Button.YES) checkPara();                                                                     //if yes, recurse

  response = ui.alert("Do you want to check-in a Driver?", ui.ButtonSet.YES_NO)                      //check in driver instead?

  if(response == ui.Button.YES) checkDriver();                                                                   //if yes, go to driver check in function
};


//same template as para check in but for driver check in for routes.
function checkDriver(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();                //select correct spreadsheet, sheet, and usefull data range
  var sheet = spreadsheet.getActiveSheet();
  var range = sheet.getDataRange();
  var aLength = sheet.getLastRow();                                       //get expected length of usufull data

  var ui = SpreadsheetApp.getUi();                                        //select ui
  var response = ui.prompt('Driver for which Route?');                    //use ui to ask which route to check in.
  var route = response.getResponseText();                                 //save response to search for..
  var checkText = "X";               //default check-in is "X"

  var array = sheet.getRange(1, 1, aLength).getValues(); //1st is header row

  var searchResult = 0;             //search for 1st instance of route on checkin sheet, returns row number if greater than 1 else -1 or false if invalid search
  var notChecked = 1;               //flag if route was not checked in.

  --aLength;  //depreciate aLength so search does not go past end of array.

  if(route == "") searchResult = false;   //if not searchable
  for (var i=0; i<aLength; i++)           //parse array for search
    if (array[i] == route)                //if match is found
    {
       searchResult = i+1;                    //record row index

       if(range.getCell(searchResult,3).getValue() != 'NA')          //make sure route should be checked-in
       {
          response = ui.prompt(Utilities.formatString("Check-in route %s", route),   //check for special cases.
                   Utilities.formatString("If a spare driver is driving the route %s, please enter their name below.  Otherwise just click \"OK\" to check the driver in", route),
                   ui.ButtonSet.OK_CANCEL);
          if(response.getSelectedButton() == ui.Button.OK) {
            if(response.getResponseText() != "") checkText = response.getResponseText();      //change check-in text if neccesarry
          };

          range.getCell(searchResult,3).setValue(checkText);          //check route in
          notChecked = 0;                                             //flag route was checked in
        };
    };


  if(notChecked) ui.alert("Error: the route entered was not found exactly as typed!");  //if route was not checked in- display error

  response = ui.alert("Do you want to check-in another driver?", ui.ButtonSet.YES_NO)   //check if user wants to check more routes in for drivers

  if(response == ui.Button.YES) checkDriver();                                                                                          //drivers

  response = ui.alert("Do you want to check-in a Para?", ui.ButtonSet.YES_NO)                                     //and paras

  if(response == ui.Button.YES) checkPara();                                                                                            //paras

};

//This function is called by a trigger set up by the user.  It clears the board every weekday
function clearALL(){
  var ndate = new Date();      //get today

  switch(ndate.getDay()){      //if today is weekday
    case 1: ;
    case 2: ;
    case 3: ;
    case 4: ;
    case 5:

     clearBoardByName('AM');   //clear and email AM check-in
     clearBoardByName('MID');  //clear and email MID check-in
     clearBoardByName('PM');   //clear and email PM check-in
  }

};

function clearBoard(){   //resets columns c and h to the formula that looks if the route check in time is applicable for that day.
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();   //identify spread sheet for use in code
  var sheet = spreadsheet.getActiveSheet();
  var range = sheet.getDataRange();                          //range is now all the cells that have data in active sheet
  var rangeHeight = range.getHeight()+2;                     //identify the height of the range so isPastCheckIn does not hit empty cell
  var cc                                                     // used as active cell identifier
  var i=0;                                                   //incrimenter to travel down column while checking
  var ui = SpreadsheetApp.getUi();
  response = ui.alert("ARE YOU SURE YOU WANT TO CLEAR THE CHECK IN BOARD?", ui.ButtonSet.YES_NO)

  if(response == ui.Button.YES){
      if(emailsEnabled){
        emailPrint();
      };

      range = range.offset(2,0,rangeHeight); //resizes range to actual usfull data + 2 rows so a sentinal (blank) cell can be reached

      for(i=1;i<rangeHeight-3;i++)                //while not the expected end of data, do the following
      {
        cc = range.getCell(i,3);                  //Get cell Ci and set formula
        cc.setFormulaR1C1("=IF(RC[9]<=TODAY(),IF(IF(ISBLANK(RC[10]),1,ISNUMBER(SEARCH(IF(WEEKDAY(NOW())=2,\"M\",IF(WEEKDAY(NOW())=3,\"T\",IF(WEEKDAY(NOW())=4,\"W\",IF(WEEKDAY(NOW())=5,\"H\",IF(WEEKDAY(NOW())=6,\"F\",0))))),RC[10]))),\"\",\"NA\"),\"NA\")");

        cc = range.getCell(i,8);                   //Get cell Hi and set formula
        cc.setFormulaR1C1("=IF(RC[4]<=TODAY(),IF(IF(ISBLANK(RC[5]),1,ISNUMBER(SEARCH(IF(WEEKDAY(NOW())=2,\"M\",IF(WEEKDAY(NOW())=3,\"T\",IF(WEEKDAY(NOW())=4,\"W\",IF(WEEKDAY(NOW())=5,\"H\",IF(WEEKDAY(NOW())=6,\"F\",0))))),RC[5]))),\"\",\"NA\"),\"NA\")");

        cc = range.getCell(i,10);                   //Get cell Hi and set formula
        cc.setFormulaR1C1("=IF(RC[2]<=TODAY(),IF(IF(ISBLANK(RC[3]),1,ISNUMBER(SEARCH(IF(WEEKDAY(NOW())=2,\"M\",IF(WEEKDAY(NOW())=3,\"T\",IF(WEEKDAY(NOW())=4,\"W\",IF(WEEKDAY(NOW())=5,\"H\",IF(WEEKDAY(NOW())=6,\"F\",0))))),RC[3]))),\"\",\"NA\"),\"NA\")");


        cc = range.getCell(i,2);
        cc.setValue(' ');
      };
   };
};

function clearBoardByName(name){   //resets columns c and h to the formula that looks if the route check in time is applicable for that day.
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();   //identify spread sheet for use in code
  var sheet = spreadsheet.getSheetByName(name);
  var range = sheet.getDataRange();                          //range is now all the cells that have data in active sheet
  var rangeHeight = range.getHeight()+2;                     //identify the height of the range so isPastCheckIn does not hit empty cell
  var cc                                                     // used as active cell identifier
  var i=0;                                                   //incrimenter to travel down column while checking

  if(emailsEnabled){
    emailPrintByName(name);
  };

  range = range.offset(2,0,rangeHeight); //resizes range to actual usfull data + 2 rows so a sentinal (blank) cell can be reached

  for(i=1;i<rangeHeight-3;i++)                //while not the expected end of data, do the following
  {
    cc = range.getCell(i,3);                  //Get cell Ci and set formula
    cc.setFormulaR1C1("=IF(RC[9]<=TODAY(),IF(IF(ISBLANK(RC[10]),1,ISNUMBER(SEARCH(IF(WEEKDAY(NOW())=2,\"M\",IF(WEEKDAY(NOW())=3,\"T\",IF(WEEKDAY(NOW())=4,\"W\",IF(WEEKDAY(NOW())=5,\"H\",IF(WEEKDAY(NOW())=6,\"F\",0))))),RC[10]))),\"\",\"NA\"),\"NA\")");

    cc = range.getCell(i,8);                   //Get cell Hi and set formula
    cc.setFormulaR1C1("=IF(RC[4]<=TODAY(),IF(IF(ISBLANK(RC[5]),1,ISNUMBER(SEARCH(IF(WEEKDAY(NOW())=2,\"M\",IF(WEEKDAY(NOW())=3,\"T\",IF(WEEKDAY(NOW())=4,\"W\",IF(WEEKDAY(NOW())=5,\"H\",IF(WEEKDAY(NOW())=6,\"F\",0))))),RC[5]))),\"\",\"NA\"),\"NA\")");

    cc = range.getCell(i,10);                   //Get cell Hi and set formula
    cc.setFormulaR1C1("=IF(RC[2]<=TODAY(),IF(IF(ISBLANK(RC[3]),1,ISNUMBER(SEARCH(IF(WEEKDAY(NOW())=2,\"M\",IF(WEEKDAY(NOW())=3,\"T\",IF(WEEKDAY(NOW())=4,\"W\",IF(WEEKDAY(NOW())=5,\"H\",IF(WEEKDAY(NOW())=6,\"F\",0))))),RC[3]))),\"\",\"NA\"),\"NA\")");


    cc = range.getCell(i,2);
    cc.setValue(' ');        //
  };
};

function makePDFs() {      //This function returns a blob containing a pdf of the spread sheet.  It was found and re-writen from multiple websites
  SpreadsheetApp.flush();  //force all pending changes to complete before getting a copy of the spreadsheet

  var ss = SpreadsheetApp.getActiveSpreadsheet();   //define what spreadsheet we are useing
  var sheet = ss.getActiveSheet();                  //define what sheet we are manipulating and turning into a pdf

  var url = ss.getUrl();                            //get the url for the active spreadsheet

  //remove the trailing 'edit' from the url to make it useful
  url = url.replace(/edit$/,'');

  //format additional parameters for exporting the sheet as a pdf and make it look purdy
  var url_ext = 'export?exportFormat=pdf&format=pdf' + //export as pdf
  //below parameters are optional...
  '&size=letter' + //paper size
  '&portrait=true' + //orientation, false for landscape
  '&fitw=true' + //fit to width, false for actual size
  '&sheetnames=true&printtitle=false&pagenumbers=true' + //hide optional headers and footers
  '&gridlines=true' + //true to show gridlines
  '&fzr=true' + //true to repeat row headers (frozen rows) on each page
  '&gid=' + sheet.getSheetId(); //the sheet's Id

  var token = ScriptApp.getOAuthToken();

  var response = UrlFetchApp.fetch(url + url_ext, {
      headers: {
        'Authorization': 'Bearer ' +  token
      }
    });

  var blob = response.getBlob().setName(sheet.getName() + '.pdf');

  //from here you should be able to use and manipulate the blob to send and email or create a file per usual.
  //In this example, I DON'T save the pdf to drive, I return this function as a blob.
  return blob;
  //DocsList.createFile(blob);
  //DriveApp.createFile(blob);
}

function emailPrint(){
  //return value = 0;
  SpreadsheetApp.flush();

  var ndate = new Date();        //Get today's date
  var eSubject = "Print Checkin";
  var eBody1 = "Print Attached for ";
  //var eBody2 = (ndate.getMonth()+1) + '/' + (ndate.getDate()) + '/' + ndate.getYear() + ' ' + ' ' + ' ';
  var eBody3 = Utilities.formatDate(ndate, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "MM/dd/yyyy  hh:mm a");
  var body = Utilities.formatString("%s%s", eBody1, eBody3);
  var mail = GmailApp.sendEmail("sendto@email" + "," + "sendto@email" , eSubject, body, {attachments: [makePDFs()], name: 'Auto Response', replyTo: 'replyto@email'});
  Logger.log("EMAIL SENT" + mail);
  return mail;
};

function emailPrintByName(name){
  //return value = 0;
  SpreadsheetApp.flush();

  var ndate = new Date();        //Get today's date
  var eSubject = "Print Checkin";
  var eBody1 = "Print Attached for ";
  //var eBody2 = (ndate.getMonth()+1) + '/' + (ndate.getDate()) + '/' + ndate.getYear() + ' ' + ' ' + ' ';
  var eBody3 = Utilities.formatDate(ndate, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "MM/dd/yyyy  hh:mm a");
  var body = Utilities.formatString("%s%s", eBody1, eBody3);
  var mail = GmailApp.sendEmail("sendto@email" + "," + "sendto@email" , eSubject, body, {attachments: [makePDFsByName(name)], name: 'Auto Response', replyTo: 'replyto@email'});
  Logger.log("EMAIL SENT" + mail);
  return mail;
};

function makePDFsByName(name) {      //This function returns a blob containing a pdf of the spread sheet.  It was found and re-writen from multiple websites
  SpreadsheetApp.flush();  //force all pending changes to complete before getting a copy of the spreadsheet

  var ss = SpreadsheetApp.getActiveSpreadsheet();   //define what spreadsheet we are useing
  var sheet = ss.getSheetByName(name);

  var url = ss.getUrl();                            //get the url for the active spreadsheet

  //remove the trailing 'edit' from the url to make it useful
  url = url.replace(/edit$/,'');

  //format additional parameters for exporting the sheet as a pdf and make it look purdy
  var url_ext = 'export?exportFormat=pdf&format=pdf' + //export as pdf
  //below parameters are optional...
  '&size=letter' + //paper size
  '&portrait=true' + //orientation, false for landscape
  '&fitw=true' + //fit to width, false for actual size
  '&sheetnames=true&printtitle=false&pagenumbers=true' + //hide optional headers and footers
  '&gridlines=true' + //true to show gridlines
  '&fzr=true' + //true to repeat row headers (frozen rows) on each page
  '&gid=' + sheet.getSheetId(); //the sheet's Id

  var token = ScriptApp.getOAuthToken();

  var response = UrlFetchApp.fetch(url + url_ext, {
      headers: {
        'Authorization': 'Bearer ' +  token
      }
    });

  var blob = response.getBlob().setName(sheet.getName() + '.pdf');

  //from here you should be able to use and manipulate the blob to send and email or create a file per usual.
  //In this example, I DON'T save the pdf to drive, I return this function as a blob.
  return blob;
  //DocsList.createFile(blob);
  //DriveApp.createFile(blob);
};
