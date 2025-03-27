# promo-codes

[![npm version](https://badge.fury.io/js/@dobuki/promo-codes.svg)](https://www.npmjs.com/package/@dobuki/promo-codes)

Create a page for distributing your promo codes

![icon](icon.png)

## Setup Google Sheets API

Under the hood, this uses Google sheet API. So you'll need to set it up.

Follow these instructions: [Google Sheet API setup](https://github.com/jacklehamster/google-sheet-db?tab=readme-ov-file#setup)

## Google Sheet format

Your sheet must be formatted like this sample sheet:
<https://docs.google.com/spreadsheets/d/1VwYU7nTSlwhi2iBSFvYBnuhxPUJdIYwE9qbKuVwDk04>

Include the following columns:

- **Code**: The actual code.
- **User**: The user redeeming the key. This is passed by query parameter, and is optional. It's just for reference in your sheet.
- **UID**: This is generated and will be used to ensure the same session gets one key.
- **Redeemed**: When this key got redeemed.
- **Source**: The source from which it was redeemed (X, facebook, email...)
- **App**: The app id (like net.dobuki.worldofturtle)
- **Icon**: A link to the icon you want to show. Should be a valid image link.
- **Name**: The name of the app.
- **Instructions**: Instructions to show after the key got redeemed.
- **Expiration**: When the key will expire.

Note: Don't share the spreadsheetID, keep in hidden and authorize your Google Cloud Api to access it.

## Setup in Node.js

Once you have your Google Sheet setup, just attach it to your express app:

```javascript
const app = express();

//...

// Attach the promo codes route
attachPromoCodes(app);
```

Warning: This service doesn't stop users from deleting their cookies and fetching keys repeatedly. If you need 

## Github Source

<https://github.com/jacklehamster/@dobuki/promo-codes/>
