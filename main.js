const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { MongoClient } = require('mongodb');
const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use(express.urlencoded({ extended: true }));

app.get('/login/', (_, res) => {
  res.send('99803203-b584-4d0c-a62e-0e9704ea6563');
});

app.get('/test/', async (req, res) => {
  const url = req.query.URL;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    // Кликаем по кнопке с id="bt"
    await page.click('#bt');

    // Ждем появления числа в поле ввода с id="inp"
    await page.waitForSelector('#inp');

    const value = await page.$eval('#inp', el => el.value);

    await browser.close();

    res.type('text/plain').send(value);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing the page');
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
