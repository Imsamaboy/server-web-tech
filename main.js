const express = require('express');
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

app.get('/login/', (_, res) => {
    res.send('99803203-b584-4d0c-a62e-0e9704ea6563');
});

app.get('/test/', async (req, res) => {
    const targetURL = req.query.URL;

    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/usr/bin/chromium-browser', // Путь до chromium в системе
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Эта строка добавлена для моего VPS на Ubuntu 24.04
    })

    const page = await browser.newPage();
    await page.goto(targetURL, { waitUntil: 'networkidle2' });

    await page.click('#bt');

    await page.waitForFunction(() => {
        const input = document.querySelector('#inp');
        return input.value;
    }, { timeout: 1000 });

    const result = await page.evaluate(() => {
        return document.querySelector('#inp').value;
    });

    await browser.close();

    res.send(result);
});

app.listen(process.env.PORT || 3000);