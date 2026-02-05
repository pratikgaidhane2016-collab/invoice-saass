const express = require("express");
const { Pool } = require("pg");
const PDFDocument = require("pdfkit");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
  res.send("Invoice App is Running");
});

app.post("/clients", async (req, res) => {
  const { name, email, country, currency } = req.body;
  const result = await pool.query(
    "INSERT INTO clients(name,email,country,currency) VALUES($1,$2,$3,$4) RETURNING *",
    [name, email, country, currency]
  );
  res.json(result.rows[0]);
});

app.post("/invoice", async (req, res) => {
  const { client, amount, currency } = req.body;

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  doc.fontSize(18).text("INVOICE", { align: "center" });
  doc.moveDown();
  doc.text(`Client: ${client}`);
  doc.text(`Amount: ${amount} ${currency}`);
  doc.text(`Status: UNPAID`);

  doc.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
