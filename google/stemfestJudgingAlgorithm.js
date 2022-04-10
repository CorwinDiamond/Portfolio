// https://github.com/CorwinDiamond/Portfolio/blob/master/google/stemfestJudgingAlgorithm.js
var userProperties = PropertiesService.getUserProperties();

// Create menu visible in Google Sheets
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Calc')
       .addItem('Process Judging','scoreJudging')
       .addSeparator()
       .addItem('sort places','sortJudging')
       .addItem('sort ms places','sortMSJudging')
       .addItem('sort hs places','sortHSJudging')
       .addSeparator()
       .addItem('clear places','clearSortedRankings')
       .addItem('clear judging','clearJudging')
       .addToUi();

};

// Clear the rankings sheet, This can be used for testing and clearing errors.
function clearJudging() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var rankingSheet = spreadsheet.getSheetByName('Rankings');
  rankingSheet.getRange(5,6,56,6).clearContent();
  rankingSheet.getRange(5,13,56,7).clearContent();
  rankingSheet.getRange(5,21,56,7).clearContent();
  rankingSheet.getRange(5,29,56,7).clearContent();
  rankingSheet.getRange(5,37,56,7).clearContent();
  rankingSheet.getRange(5,45,56,7).clearContent();
  rankingSheet.getRange(5,53,56,1).clearContent();
  clearSortedRankings();
}

// Clear the sheets showing the final ranking. Used for testing.
function clearSortedRankings() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var middleSheet = spreadsheet.getSheetByName('MiddleRanking');
  var hsSheet = spreadsheet.getSheetByName('HSRanking');

  middleSheet.deleteRows(2, 100);
  hsSheet.deleteRows(2, 100);
}

// Sort the rankings for MS and HS
function sortJudging() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var rankingSheet = spreadsheet.getSheetByName('Rankings');
  var middleSheet = spreadsheet.getSheetByName('MiddleRanking');
  var hsSheet = spreadsheet.getSheetByName('HSRanking');

  rankTeams(rankingSheet, middleSheet, 5, 19)
  rankTeams(rankingSheet, hsSheet, 20, 56)
}

// Sort the rankings for MS
function sortMSJudging() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var rankingSheet = spreadsheet.getSheetByName('Rankings');
  var middleSheet = spreadsheet.getSheetByName('MiddleRanking');

  rankTeams(rankingSheet, middleSheet, 5, 19);
}

// Sort the rankings for HS
function sortHSJudging() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var rankingSheet = spreadsheet.getSheetByName('Rankings');
  var hsSheet = spreadsheet.getSheetByName('HSRanking');

  rankTeams(rankingSheet, hsSheet, 20, 56);
}

// Insertion sort of teams into a given sheet, for a given range. Used for ranking MS and or HS teams.
function rankTeams(rankingSheet, sheet, startRow, endRow) {
  // insertion sort on overall, tiebreak on general percent
  for (var row = startRow; row <= endRow; row ++) {
    var team = rankingSheet.getRange(row, 2).getValue()
    var overall = rankingSheet.getRange(row, 3).getValue()
    var general = rankingSheet.getRange(row, 4).getValue()
    var specific = rankingSheet.getRange(row, 5).getValue()
    var grades
    var inserted = false
    for (var r = 2; r <= 100 && !inserted; r ++) {
      if (sheet.getRange(r, 3).isBlank()) {
        insertTeam(sheet, r, team, overall, general, specific)
        inserted = true;
      } else if (sheet.getRange(r, 3).getValue() < overall 
                 || (sheet.getRange(r, 3).getValue() == overall && sheet.getRange(r, 4).getValue() < general)) {
        sheet.insertRowBefore(r)
        insertTeam(sheet, r, team, overall, general, specific)
        inserted=true;
      }
    }
  }
}

// Insert team as part of insertion sort for rankTeams(...)
function insertTeam(sheet, row, team, overall, general, specific) {
  sheet.getRange(row, 2).setValue(team);
  sheet.getRange(row, 3).setValue(overall).setNumberFormat("##.#%");
  sheet.getRange(row, 4).setValue(general).setNumberFormat("##.#%");
  sheet.getRange(row, 5).setValue(specific).setNumberFormat("##.#%");
}

// Function processes unprocessed judging form responses and sorts rankings upon completion.
function scoreJudging() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var responseSheet = spreadsheet.getSheetByName('Form Responses 1');
  var rankingSheet = spreadsheet.getSheetByName('Rankings');
  var lastResponseRow = responseSheet.getLastRow();
  
  for (var r = 2; r <= lastResponseRow; r++) {
    if (responseSheet.getRange(r,1).getBackground() != '#99ff99' && responseSheet.getRange(r,1).getBackground() != '#ff0000') { 
      //if not yellow (not processed yet), if red, error
      scoreData = getScoresRow(responseSheet, r);

      if ( recordScore(rankingSheet, scoreData)) {
        responseSheet.getRange(r,1).setBackground('#99ff99'); 
      } else {
        responseSheet.getRange(r,1).setBackground('#ff0000');
      }
    }
  }
  clearSortedRankings();
  sortJudging();
}

// Get the data necessary from the form response to populate the teams scores from judges. This function handles a single row
function getScoresRow(responseSheet, r) {
  var returnObject = {
    teamName:false, 
    judge:false, 
    generalPoints:false, 
    specificPoints:false, 
    possibleGeneralPoints:false, 
    possibleSpecificPoints:false, 
    grade:false, 
    comment:"", 
    row:r
  };

  returnObject.judge = responseSheet.getRange(r,2).getValue()
  returnObject.teamName = responseSheet.getRange(r,4).getValue() + responseSheet.getRange(r,5).getValue() 
    + responseSheet.getRange(r,6).getValue() + responseSheet.getRange(r,7).getValue();
  returnObject = getProjectTypeAndScore(responseSheet, r, returnObject);
  Logger.log(returnObject)
  // example returnObject = { // used for testing
  //    teamName:"John Doe", 
  //    judge:"Dredd", 
  //    generalPoints:2, 
  //    specificPoints:1, 
  //    possibleGeneralPoints:2, 
  //    possibleSpecificPoints:3, 
  //    grade:"A", 
  //    comment:"Test"
  // };
  return returnObject;
}

// Based on where the data is in the row, The project type can be assumed.
// This data has to be remaped if the form is changed.
// switch statement would be cleaner, but this worked first and well enough.
function getProjectTypeAndScore(responseSheet, r, returnObject) {
  if ( !responseSheet.getRange(r,8).isBlank()) {
      // Infernal Contraptions 8-18 General, 19-25 specific, grade 26, comment 27
      returnObject = getScores(returnObject, responseSheet, r, 8, 18, 19, 25, 26, 27);
  } else if ( !responseSheet.getRange(r,28).isBlank()) {
      // Intelligence & Behavior  28-38 General, 39-44 specific, grade 45, comment 46
      returnObject = getScores(returnObject, responseSheet, r, 28, 38, 39, 44, 45, 46);
  } else if ( !responseSheet.getRange(r,47).isBlank()) {
      // Living World  47-57 General, 58-63 specific, grade 64, comment 65
      returnObject = getScores(returnObject, responseSheet, r, 47, 57, 58, 63, 64, 65);
  } else if ( !responseSheet.getRange(r,66).isBlank()) {
      // Reverse Engineering 66-76 General, 77-83 specific, grade 84, comment 85
      returnObject = getScores(returnObject, responseSheet, r, 66, 76, 77, 83, 84, 85);
  } else if ( !responseSheet.getRange(r,86).isBlank()) {
      // Physical Universe  86-96 General, 97-102 specific, grade 103, comment 104
      returnObject = getScores(returnObject, responseSheet, r, 86, 96, 97, 102, 103, 104);
  } else if ( !responseSheet.getRange(r,105).isBlank()) {
      // Robotics and Computation  105-115 General, 116-122 specific, grade 123, comment 124
      returnObject = getScores(returnObject, responseSheet, r, 105, 115, 116, 122, 123, 124);
  } else if ( !responseSheet.getRange(r,125).isBlank()) {
      // Things  125-135 General, 136-142 specific, grade 143, comment 144
      returnObject = getScores(returnObject, responseSheet, r, 125, 135, 136, 142, 143, 144);
  } else {
      Logger.log("Error finding project type for row " + r);
  }
  return returnObject;
}

// Converts the mapping of score location produced in getProjectTypeAndScore(...) into score data in the return object
function getScores(returnObject, sheet, r, generalStart, generalEnd, specificStart, specificEnd, grade, comment) {
  
  // general points
  returnObject.generalPoints = 0;
  returnObject.possibleGeneralPoints = 0;
  for (var col = generalStart; col <= generalEnd; col++) {
    returnObject.generalPoints += isNumber(sheet.getRange(r,col).getValue()) ? sheet.getRange(r,col).getValue() : 0;
    returnObject.possibleGeneralPoints += 5;
    // sheet.getRange(r,col).setBackground("#9999ff"); // testing
  }

  // specific points
  returnObject.specificPoints = 0;
  returnObject.possibleSpecificPoints = 0;
  for (var col = specificStart; col <= specificEnd; col++) {
    returnObject.specificPoints += isNumber(sheet.getRange(r,col).getValue()) ? sheet.getRange(r,col).getValue() : 0;
    returnObject.possibleSpecificPoints += 5;
    // sheet.getRange(r,col).setBackground("#99ff99"); // testing
  }

  // grade
  returnObject.grade = sheet.getRange(r,grade).getValue();
  // sheet.getRange(r,grade).setBackground("#ff9999"); // testing

  // comment
  returnObject.comment = sheet.getRange(r,comment).getValue();
  // sheet.getRange(r,comment).setBackground("#ff33ff"); // testing

  return returnObject;
}

// Surprizing this is not a built in function for determining a cells data type.
function isNumber(value) {
  return typeof value == 'number';
}
 
// After data read from form responses, this function writes the scores in the correct location on the rankingSheet
function recordScore(rankingSheet, scoreData) {
  var error = false;
  var lastRow = rankingSheet.getLastRow();
  var lastCol = rankingSheet.getLastColumn();
  var judgeOffset = 0;
  var judgeFound = false;
  var studentOffset = 0;
  var teamFound = false;

  // return a value but record error 
  function recError(value, errorString = "there was an error!") {
    error = true;
    Logger.log(value + ": " + errorString);
    return value;
  }

  // calc score stats
  var possibleGeneralPoints = scoreData.possibleGeneralPoints ? scoreData.possibleGeneralPoints : recError(0,"default value");
  var possibleSpecificPoints = scoreData.possibleSpecificPoints ? scoreData.possibleSpecificPoints : recError(0,"default value");
  var generalPoints = scoreData.generalPoints ? scoreData.generalPoints : recError(0,"default value");
  var specificPoints = scoreData.specificPoints ? scoreData.specificPoints : recError(0,"default value");
  var generalPercent = possibleGeneralPoints == 0 ? recError("!div") : generalPoints / possibleGeneralPoints;
  var specificPercent = possibleSpecificPoints == 0 ? recError("!div") : specificPoints / possibleSpecificPoints;
  var possiblePoints = possibleGeneralPoints + possibleSpecificPoints;
  var score = possiblePoints == 0 ? recError("!div") : (generalPoints + specificPoints)/possiblePoints;

  // find judge column offset
  for (var col = 6; col <= lastCol && !judgeFound; col++) {
    if (rankingSheet.getRange(1,col).getValue() == scoreData.judge) {
      judgeOffset = col;
      judgeFound = true;
    }
  }

  // find student row offset
  for (var row = 5; row <= lastRow && !teamFound; row++) {
    if (rankingSheet.getRange(row,2).getValue() == scoreData.teamName) {

      studentOffset = row;
      teamFound = true;
    }
  }

  // print to rankings sheet and highlight students and scores that have errors
  if (teamFound && judgeFound) {
    rankingSheet.getRange(studentOffset, judgeOffset).setValue(generalPoints);
    rankingSheet.getRange(studentOffset, judgeOffset + 1).setValue(generalPercent).setNumberFormat("##.#%");
    rankingSheet.getRange(studentOffset, judgeOffset + 2).setValue(specificPoints);
    rankingSheet.getRange(studentOffset, judgeOffset + 3).setValue(specificPercent).setNumberFormat("##.#%");
    rankingSheet.getRange(studentOffset, judgeOffset + 4).setValue(score);
    rankingSheet.getRange(studentOffset, judgeOffset + 5).setValue(scoreData.grade);
    rankingSheet.getRange(studentOffset, judgeOffset + 7).setValue(scoreData.comment);
    if (error) {
      rankingSheet.getRange(studentOffset, judgeOffset + 4).setBackground('#ff9999');
      rankingSheet.getRange(studentOffset, 2).setBackground('#ff9999');
    }
  }

  if (!teamFound) {
    Logger.log("team not found: " + scoreData)
  }
  if (!judgeFound) {
    Logger.log("Judge not found: " + scoreData)
  }
  return teamFound && judgeFound && !error;
}
