/**
 * Makes a copy of the first sheet and renames the copy with the current date.
 * The cells that are intended to have date and day are updated.
 * This function is called by a Trigger at 1am.
 * This script works with a specific Standby Log sheet layout
 */
function copysheet() {

  // Make the first sheet active in the active workbook
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setActiveSheet(ss.getSheets()[0]);

  var ndate = new Date();        //Get today's date
  var weekdaytxt = 'Null'        //Contains String for current day of the week
  var isweekday = 0;             //Flag = 1 if today is a weekday, Flag used to

  switch(ndate.getDay()){    //Generates Nice Txt for weekdays and sets weekday flag
    case 1:
      weekdaytxt = 'Monday'
      isweekday = 1;
      break;
    case 2:
      weekdaytxt = 'Tuesday'
      isweekday = 1;
      break;
    case 3:
      weekdaytxt = 'Wednesday'
      isweekday = 1;
      break;
    case 4:
      weekdaytxt = 'Thursday'
      isweekday = 1;
      break;
    case 5:
      weekdaytxt = 'Friday'
      isweekday =1;
      break;
  }

  if(isweekday){//if Today is a weekday

      // Make the first sheet active in the active workbook
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      ss.setActiveSheet(ss.getSheets()[0]);

      //make copy of the first sheet
      var newSheet = SpreadsheetApp.getActiveSpreadsheet().duplicateActiveSheet();

      // place the duplicate in the first positions
      ss.moveActiveSheet(1);

      // rename the duplicate to current date
      newSheet.setName((ndate.getMonth()+1) + '/' + (ndate.getDate()) + '/' + ndate.getYear());

      var range = newSheet.getDataRange();
      range.getCell(1,4).setValue((ndate.getMonth()+1) + '/' + (ndate.getDate()) + '/' + ndate.getFullYear()); //update date on new sheet
      range.getCell(1,3).setValue(weekdaytxt);                                                                 //update day of week on new sheet
  }
  //Logger.log(ndate + 'COPY SHEET:isweekday:' + isweekday);          //was used for diognostics while designing spreadsheet
}


function extraprompt() {
  var ui = SpreadsheetApp.getUi(); // Same variations.
  var result = ui.prompt(
    'Enter a unique name for the new sheet:',
      ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  var button = result.getSelectedButton();
  var text = result.getResponseText();
  if (button == ui.Button.OK)
    extracopy(text);
}
/**
 * Makes a copy of the first sheet and renames the copy with the current date.
 * The cells that are intended to have date and day are updated.
 * This function is called by a Trigger at 1am.
 */
function extracopy(sheetname) {

  // Make the first sheet active in the active workbook
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setActiveSheet(ss.getSheets()[0]);

  var ndate = new Date();        //Get today's date
  var weekdaytxt = 'Null'        //Contains String for current day of the week

  switch(ndate.getDay()){    //Generates Nice Txt for weekdays and sets weekday flag
    case 0:
      weekdaytxt = 'Sunday';
      break;
    case 1:
      weekdaytxt = 'Monday'
      break;
    case 2:
      weekdaytxt = 'Tuesday'
      break;
    case 3:
      weekdaytxt = 'Wednesday'
      break;
    case 4:
      weekdaytxt = 'Thursday'
      break;
    case 5:
      weekdaytxt = 'Friday'
      break;
    case 6:
      weekdaytxt = 'Saturday'
      break;
  }

  // Make the first sheet active in the active workbook
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setActiveSheet(ss.getSheets()[0]);

  //make copy of the first sheet
  var newSheet = SpreadsheetApp.getActiveSpreadsheet().duplicateActiveSheet();

  // place the duplicate in the first positions
  ss.moveActiveSheet(1);

  // rename the duplicate to current date
  newSheet.setName(sheetname);

  var range = newSheet.getDataRange();
  range.getCell(1,4).setValue((ndate.getMonth()+1) + '/' + (ndate.getDate()) + '/' + ndate.getFullYear()); //update date on new sheet
  range.getCell(1,3).setValue(weekdaytxt);                                                                 //update day of week on new sheet

  //Logger.log(ndate + 'COPY SHEET:isweekday:' + isweekday);          //was used for diognostics while designing spreadsheet
}

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Copy Sheet')
       .addItem('Copy As...', 'extraprompt')
       .addToUi();
};
