/**
 * downloadShellScript.gs
 *
 * Builds a categorized and timestamped WP-CLI batch shell script from Google Sheets data.
 *
 * Groups WP-CLI commands into:
 *   - STEP 1: Post Deletions (`wp post delete`)
 *   - STEP 2: Permalink Updates (`wp post update`)
 *   - STEP 3: Search & Replace (`wp search-replace`)
 *
 * Each command is wrapped in `run_or_log_fail` to log failed executions to `failed.log`.
 * A log file is created for each run and output is directed to both console and log.
 * Final shell script is created in the user's Google Drive.
 *
 *
 * Author: Eric Rasch
 *   GitHub: https://github.com/ericrasch/wp-cli-sheet-automation
 * Date Created: 2025-04-18
 * Last Modified: 2025-04-18
 * Version: 1.0
 *
 */

function downloadShellScript() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('YourSheetName'); // Replace with your sheet name
  const urlLengthColumn = 28; // Column AB
  const lastRow = sheet.getLastRow();

  // Sort by URL length descending
  sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn())
       .sort({ column: urlLengthColumn, ascending: false });

  const data = sheet.getRange("Y2:AA" + lastRow).getValues();
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
  const filename = `wp_cli_batch_${timestamp}.sh`;

  const output = [
    "#!/bin/bash",
    "",
    "timestamp=$(date +"%Y%m%d_%H%M%S")",
    "logfile="wp_cli_log_$timestamp.log"",
    "exec > >(tee -i "$logfile")",
    "exec 2>&1",
    "",
    "echo "=== Starting WP-CLI Batch Processing ==="",
    "",
    "run_or_log_fail() {",
    "  "$@" || echo "❌ Failed: $*" >> failed.log",
    "}",
    ""
  ];

  const deletes = [];
  const updates = [];
  const replaces = [];

  data.forEach(row => {
    const [deleteCmd, updateCmd, replaceCmd] = row;
    if (deleteCmd && deleteCmd !== "MISSING" && deleteCmd !== "#VALUE!") {
      deletes.push("run_or_log_fail " + deleteCmd);
    }
    if (updateCmd && updateCmd !== "MISSING" && updateCmd !== "#VALUE!") {
      updates.push("run_or_log_fail " + updateCmd);
    }
    if (replaceCmd && replaceCmd !== "MISSING" && replaceCmd !== "#VALUE!") {
      replaces.push("run_or_log_fail " + replaceCmd);
    }
  });

  if (deletes.length) {
    output.push('echo "=== STEP 1: Deleting Unwanted Posts ==="', ...deletes, "");
  }

  if (updates.length) {
    output.push('echo "=== STEP 2: Updating Custom Permalinks ==="', ...updates, "");
  }

  if (replaces.length) {
    output.push('echo "=== STEP 3: Running Search & Replace ==="', ...replaces, "");
  }

  const blob = Utilities.newBlob(output.join("\n"), 'text/x-shellscript', filename);
  const file = DriveApp.createFile(blob);
  Logger.log("✅ Download your script here: " + file.getUrl());
}
