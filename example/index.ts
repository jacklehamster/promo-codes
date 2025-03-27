import express from "express";
import path from "path";
import { attachPromoCodes } from "../dist";

const app = express();
const port = 3000;

app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, ".")));

// Attach the promo codes route
attachPromoCodes(app, "/promo", {
  useRedis: true,
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
