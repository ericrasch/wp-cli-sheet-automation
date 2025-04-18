# WP-CLI Google Sheet Setup & Formulas

This guide outlines the structure and formulas used to prepare bulk WordPress cleanup commands (delete, update, search-replace) using WP-CLI via Google Sheets.

By combining structured columns with dynamic formulas, this setup allows you to quickly generate categorized shell scripts for safe and efficient WordPress updates using the `downloadShellScript.gs` script.

---

## 📋 Column Mapping

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
