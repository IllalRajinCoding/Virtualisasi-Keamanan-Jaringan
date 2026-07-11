const express = require("express");
require("dotenv").config();

const db = require("./db");

const app = express();

app.get("/", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT * FROM products"
        );

        res.json({
            application: "APP1",
            framework: "Node.js Express",
            status: "Running",
            database: "Connected",
            total_products: rows.length,
            data: rows
        });

    } catch (err) {

        res.status(500).json({
            application: "APP1",
            framework: "Node.js Express",
            status: "Running",
            database: "Disconnected",
            error: err.message
        });

    }

});

app.get("/health", (req, res) => {

    res.status(200).json({
        status: "OK"
    });

});

app.listen(process.env.PORT, () => {

    console.log(`APP1 running on port ${process.env.PORT}`);

});
