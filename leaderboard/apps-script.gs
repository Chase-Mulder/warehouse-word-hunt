/**
 * Warehouse Word Hunt leaderboard backend.
 * Paste this whole file into Extensions > Apps Script of a Google Sheet,
 * then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * Copy the /exec URL into LB_URL in index.html.
 */
const SHEET_NAME = 'Scores';
const MIN_SECS = 120;      // reject anything faster than 2 minutes
const MAX_SECS = 6 * 3600; // reject anything longer than 6 hours

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) {
    s = ss.insertSheet(SHEET_NAME);
    s.appendRow(['Submitted', 'Team', 'Seconds', 'Time']);
    s.setFrozenRows(1);
  }
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function fmt_(secs) {
  const h = Math.floor(secs / 3600), m = Math.floor(secs / 60) % 60, s = secs % 60;
  return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// GET: return every row; the page keeps each team's best time.
function doGet() {
  const s = sheet_();
  const n = s.getLastRow();
  const rows = n > 1 ? s.getRange(2, 1, n - 1, 3).getValues() : [];
  return json_({
    rows: rows
      .filter(r => r[1] !== '' && Number(r[2]) > 0)
      .map(r => ({
        team: String(r[1]),
        secs: Number(r[2]),
        at: r[0] instanceof Date ? r[0].toISOString() : String(r[0])
      }))
  });
}

// POST {team, secs}: add one finish time.
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad request' }); }

  let team = String(d.team || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 28);
  const secs = Math.round(Number(d.secs));
  if (!team) return json_({ ok: false, error: 'team name required' });
  if (!(secs >= MIN_SECS && secs <= MAX_SECS)) return json_({ ok: false, error: 'time out of range' });
  if (/^[=+\-@]/.test(team)) team = "'" + team; // stop names being read as formulas

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([new Date(), team, secs, fmt_(secs)]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}
