# WP-CLI Google Sheet Setup & Formulas

This guide outlines the structure and formulas used to prepare bulk WordPress cleanup commands (delete, update, search-replace) using WP-CLI via Google Sheets.

By combining structured columns with dynamic formulas, this setup allows you to quickly generate categorized shell scripts for safe and efficient WordPress updates using the `downloadShellScript.gs` script.

---

## 📋 Column Mapping

| Column | Header                                      | Purpose                                                                 |
|--------|---------------------------------------------|-------------------------------------------------------------------------|
| A      | URL                                         | Original full URL                                                      |
| B      | Action                                      | Type of action: `301`, `410`, or `Keep`                                |
| C      | New URL                                     | Destination URL for 301 redirects; `N/A` if 410                        |
| D      | url: ORIG                                   | Original relative path                                                 |
| E      | url: NEW                                    | New relative path                                                      |
| F      | post ID                                     | WordPress post ID if applicable                                        |
| G      | STEP 1: Remove unwanted posts (301/410)     | Generates `wp post delete` command for HTTP 410 posts                 |
| H      | STEP 2: Change Post URL                     | (Optional) Updates post permalink (usually unused in redirect cleanup) |
| I      | STEP 3: Search/Replace URL                  | Runs `wp search-replace` across database                               |
| J      | STEP 4: URL Length Sort                     | =LEN(D2) — used for sorting specificity                                |
| K      | STEP 5: Combined CLI Command                | =TEXTJOIN("
", TRUE, G2, I2) — final batch command per row           |

## 🔢 Sorting Logic

- Commands are sorted by URL length (Column AB) in descending order.
- This ensures that specific paths are processed before broader matches to avoid accidental overwrites.

---

## 🧮 Google Sheets Formulas

These formulas dynamically generate WP-CLI commands for each row of data. Each step corresponds to a separate CLI operation.

---

### 🗑 STEP 1: Remove Unwanted Posts (Column Y)
Deletes posts marked as HTTP 410 in Column Q.

```excel
=IF(Q2=410, IF(ISNUMBER(W2), "wp post delete " & W2 & " --force --allow-root", "MISSING"), "")
```

---

### 🔄 STEP 2: Change Post URL (Column Z)
Updates custom permalinks for posts not marked for deletion.

```excel
=IF(AND($W2<>"", $Q2<>410), "wp post update " & $W2 & " --meta_input='{"custom_permalink":"" & $V2 & ""}' --allow-root", "")
```

---

### 🔍 STEP 3: Search/Replace URL (Column AA)
Updates internal links across the database (excluding redirection tables).

```excel
=IF(AND($U2<>"", $Q2<>410), "wp search-replace '" & $U2 & "' '" & $V2 & "' --all-tables --skip-tables=wp_redirection* --report-changed-only --precise --allow-root", "")
```

---

### 📏 STEP 4: URL Length (Column AB)
Used to sort rows by specificity before batch execution.

```excel
=LEN(U2)
```

---

### 🧩 STEP 5: Combined CLI Command (Column AC)
Joins Steps 1–3 with newline characters for optional manual execution or review.

```excel
=TEXTJOIN(CHAR(10), TRUE, Y2, Z2, AA2)
```
