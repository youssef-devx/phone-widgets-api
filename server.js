const express = require("express");
const path = require("path")
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  credentials: {
    ...require(CREDENTIALS_PATH),
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

app.get("/budget-spreadsheet", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "jan!F4:F7",
    });
    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      res.status(404).json({
        savings: 5,
        emergency: 5,
        debtPayoff: 5,
        otherGoals: 5,
      });
      return;
    }

    const values = {
      savings: rows[0][0].replace("%", ""),
      emergency: rows[1][0].replace("%", ""),
      debtPayoff: rows[2][0].replace("%", ""),
      otherGoals: rows[3][0].replace("%", ""),
    }

    res.json(values);
  } catch (err) {
    res.status(500).json({
      savings: 8,
      emergency: 8,
      debtPayoff: 8,
      otherGoals: 8,
    });
  }
});

app.listen(3000, () => console.log("Running on port 3000"));