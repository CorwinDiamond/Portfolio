/**
  * This script takes form input in a response sheet, and a list of names
  * for a district on the mail merge sheet, to notify everyone on the list
  * via email of an accident.
  */
function emailBoldNow(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Form Responses 1");
  var emailAddressRefferenceSheet = ss.getSheetByName("Mail Merge");
  var lastRow = sheet.getLastRow();
  var ndate = new Date();        //Get today's date
  var eSubject = "Company Name Accident Report";
  var body = "";
  var lastColumn = sheet.getLastColumn();

  var lastDistrict = emailAddressRefferenceSheet.getLastColumn();
  var lastAddress = emailAddressRefferenceSheet.getLastRow();

  for(var r = 2; r <= lastRow; r++)  {
    if(sheet.getRange(r,1).getBackground() != '#ffff00'){ //if not yellow (not processed yet)
      for (var column=1 ;column<=lastColumn; column++){
        body += "<b>" + sheet.getRange(1,column).getValue() + ":</b><br>" + sheet.getRange(r,column).getDisplayValue() + "<br><br>";
      }

      sheet.getRange(r,1).setBackground('#ffff00');

      body = Utilities.formatString("%s<br>If you have any questions please contact Dispatch at Company Name.<br><br>Thanks, <br>Company Name Dispatch", body)

      var recipientsTO = "ComanyAdminEmail@list, CompanyDispatch@list, ";

      if(sheet.getRange(r,24).getValue() == "Yes.") {
        for(var i = 2; i <= lastAddress; i++) {
          recipientsTO += emailAddressRefferenceSheet.getRange(i,1).getValue() + ", "
        }
      }

      for(var j = 1; j <= lastDistrict; j++) {
        if(emailAddressRefferenceSheet.getRange(1,j).getValue() == sheet.getRange(r,7).getValue()) {
          for(var i = 2; i <= lastAddress; i++) {
            recipientsTO += emailAddressRefferenceSheet.getRange(i,j).getValue() + ", "
          }
        }
      }

      if(emailAddressRefferenceSheet.getRange(1,i).getValue() == "Yes.") {
        for(var i = 2; i <= lastAddress; i++) {
          recipientsTO += emailAddressRefferenceSheet.getRange(i,1).getValue() + ", "
        }
      }

      //recipientsTO += "testing@email"; //uncomment for testing purposes
      var mail = MailApp.sendEmail({
        to: recipientsTO,
        subject: eSubject,
        htmlBody: body,
        name: 'Auto Message from Company Initials Accident Log',
        replyTo: 'dispatch@company'
      });
      Logger.log("EMAIL SENT" + mail);
    };
  };
};
