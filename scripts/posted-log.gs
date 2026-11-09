// Shared "Posted" ticks for the Ready to post page.
// Lives in the content calendar Google Sheet (Extensions > Apps Script), deployed as a web app.
// The page sends {id, posted} when the tick changes, and reads the latest state for every post.
// Each change is a row on the "Posted" tab: time, post date (id), Yes/No.

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("Posted");
  if (!sh) {
    sh = ss.insertSheet("Posted");
    sh.appendRow(["Ticked at", "Post", "Posted"]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents || "{}");
  const id = String(body.id || "");
  if (!/^\d{4}-\d{2}-\d{2}/.test(id)) return ContentService.createTextOutput("bad id");
  sheet_().appendRow([new Date(), "'" + id, body.posted ? "Yes" : "No"]); // the apostrophe keeps the id as text, not a date
  return ContentService.createTextOutput("ok");
}

function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const state = {};
  for (const r of rows) state[String(r[1])] = r[2] === "Yes";
  return ContentService.createTextOutput(JSON.stringify(state)).setMimeType(ContentService.MimeType.JSON);
}
