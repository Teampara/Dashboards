# Business Insight Graph Builder

A lightweight webpage that reads uploaded business data files and generates meaningful KPI cards and charts.

## Supported file types
- Excel: `.xlsx`, `.xls`
- Delimited text: `.csv`, `.txt`, `.tsv`
- JSON: `.json`

## What it generates
- KPI cards (rows loaded, total/average value, unique customers, unique orders)
- Trend chart over time
- Top category chart
- Numeric distribution chart
- Feedback sentiment chart
- Table preview of uploaded data

## Run locally
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

## Notes
- Column detection is automatic based on common business naming patterns (e.g., `Amount`, `Date`, `Category`, `Feedback`).
- For text files, delimiter detection supports comma, tab, semicolon, and pipe.
