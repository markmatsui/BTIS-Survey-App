# BTIS Survey App — Version 0.6 Prototype

This is a browser-based prototype for the Botswana Tourism Improvement System (BTIS).

## What v0.6 includes

- Full survey input flow
- QR / lodge code input
- Guest profile
- 12 improvement review ratings
- Guest comments
- Voice input support where the browser allows it
- Photo attachment preview
- Guide's private note
- Accommodation response field
- Optional follow-up contact
- Local browser storage
- Survey list
- Dashboard with total count and average score
- Item-by-item average scores
- Priority improvement item detection
- Search and filters
- CSV export
- JSON export
- Admin Mode with delete controls
- Sample data loader

## Important limitation

This version does not upload data to a real server. Data is stored only in the browser's local storage.

If you open the app on another phone or computer, the data will not automatically appear there.

## Test lodge codes

- `RASESA`
- `BTIS-RASESA`

You can also paste JSON like:

```json
{"accommodation":"Rasesa Lodge","location":"Rasesa","guide":"George"}
```

## Files to upload to GitHub

Upload these four files to the repository root:

1. `index.html`
2. `style.css`
3. `app.js`
4. `README.md`

## Suggested commit message

`Implement BTIS Version 0.6 dashboard and export tools`

## Notes for field testing

Use this version to test whether the questions, ratings, comments, and dashboard are useful for real accommodation improvement work.

Do not treat the scores as public hotel ratings. They are internal improvement signals.
