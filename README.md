# BTIS Survey App — Version 0.5 Prototype

This is a simple browser-based prototype for the Botswana Tourism Improvement System (BTIS).

## What v0.5 includes

- New survey flow
- QR / lodge code input
- Guest profile
- 12 improvement review ratings
- Guest improvement comments
- Voice input support where the browser allows it
- Photo attachment preview
- Guide's private note
- Accommodation response field
- Optional follow-up contact
- Local save in the browser
- Simple dashboard
- JSON export

## Important limitation

This version does not upload to a real server. Data is stored only in the browser's local storage.

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

`Implement BTIS v0.5 prototype survey flow`
