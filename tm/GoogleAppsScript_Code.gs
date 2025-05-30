function doGet(e) {
  if (e.parameter.type === "get") {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const data = rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("GET endpoint working");
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const body = JSON.parse(e.postData.contents);
  sheet.appendRow([body.date, body.signer, body.start, body.end, body.hours]);
  return ContentService.createTextOutput("Success");
}
