# WP-CLI + Google Sheets: Automating WordPress URL Cleanup

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-blue)

## Overview

This repository provides a structured and repeatable system for automating WordPress cleanup tasks — including post deletions, permalink updates, and search-replace operations — using WP-CLI commands generated directly from a Google Sheet.

Google Apps Scripts are included to:
- Generate categorized `.sh` shell scripts from the spreadsheet
- Sort and group commands by type (delete, update, replace)
- Log all output and failures
- Streamline cleanup for large WordPress datasets across multiple domains

---

## 🔧 Features

- **Grouped Command Execution**:
  - STEP 1: `wp post delete`
  - STEP 2: `wp post update` (permalink updates)
  - STEP 3: `wp search-replace` (internal links)

- **Command Resilience**:
  - All commands wrapped in `run_or_log_fail` for error tolerance
  - Failures are logged to `failed.log`

- **Sorting by Specificity**:
  - Commands can be sorted by URL length to prioritize deep paths first

---

## 📊 Google Sheet Structure

| Column | Step    | Header                                | Purpose                                                                 |
|--------|---------|----------------------------------------|-------------------------------------------------------------------------|
| Y      | STEP 1  | Remove Unwanted Posts (301/410)        | Deletes posts marked as 410 using `wp post delete`                      |
| Z      | STEP 2  | Change Post URL                        | Updates a post's custom permalink via `wp post update`                 |
| AA     | STEP 3  | Search/Replace URL                     | Updates internal links using `wp search-replace`                       |
| AB     | STEP 4  | URL Length                             | Used to sort search-replace commands by specificity (longest first)     |
| AC     | STEP 5  | Combined CLI Command                   | Combines Steps 1–3 for manual exports or review                        |
| U      | —       | Old Relative Path                      | Extracted from absolute URL in Column A                                |
| V      | —       | New Relative Path                      | Extracted from absolute URL in Column R (unless Q = 410)               |

---

## 🧮 Google Sheets Formulas

**STEP 1: Remove Unwanted Posts (Column Y)**  
```excel
=IF(Q2=410, IF(ISNUMBER(W2), "wp post delete " & W2 & " --force --allow-root", "MISSING"), "")
```

**STEP 2: Change Post URL (Column Z)**  
```excel
=IF(AND($W2<>"", $Q2<>410), "wp post update " & $W2 & " --meta_input='{"custom_permalink":"" & $V2 & ""}' --allow-root", "")
```

**STEP 3: Search/Replace URL (Column AA)**  
```excel
=IF(AND($U2<>"", $Q2<>410), "wp search-replace '" & $U2 & "' '" & $V2 & "' --all-tables --skip-tables=wp_redirection* --report-changed-only --precise --allow-root", "")
```

---

## 📂 File Layout

```bash
wp-cli-sheet-automation/
├── README.md
├── LICENSE
├── scripts/
│   └── downloadShellScript.gs         # Apps Script to generate the bash file
├── docs/
│   ├── sheet-structure.md             # Full column breakdown
│   └── formulas.md                    # Reusable formulas and logic
├── examples/
│   └── WP-CLI_Cleanup_Example_Public.xlsx
```

---

## 🚀 Getting Started

1. Clone or download the repository.
2. Open the `WP-CLI_Cleanup_Example_Public.xlsx` sheet in `/examples/`.
3. Adjust your own data and formulas as needed in the same format.

---

## ▶️ Usage

1. Open your working Google Sheet.
2. Add the script in `/scripts/downloadShellScript.gs` to **Apps Script Editor**.
3. Run `downloadShellScript()` to generate a `.sh` script in your Drive.
4. Download the file and run it in your WordPress CLI environment:

```bash
chmod +x wp_cli_batch_YYYYMMDD_HHMMSS.sh
./wp_cli_batch_YYYYMMDD_HHMMSS.sh
```

---

## 📥 Example Output

```bash
#!/bin/bash

timestamp=$(date +"%Y%m%d_%H%M%S")
logfile="wp_cli_log_$timestamp.log"
exec > >(tee -i "$logfile")
exec 2>&1

echo "=== Starting WP-CLI Batch Processing ==="

run_or_log_fail() {
  "$@" || echo "❌ Failed: $*" >> failed.log
}

echo "=== STEP 1: Deleting Unwanted Posts ==="
run_or_log_fail wp post delete 1001 --force --allow-root

echo "=== STEP 2: Updating Custom Permalinks ==="
run_or_log_fail wp post update 1002 --meta_input='{"custom_permalink":"pages/about"}' --allow-root

echo "=== STEP 3: Running Search & Replace ==="
run_or_log_fail wp search-replace '/about-us' '/pages/about' --all-tables ...
```

---

## 🧠 Credits

**Author:** Eric Rasch  
**GitHub:** [github.com/ericrasch](https://github.com/ericrasch)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
