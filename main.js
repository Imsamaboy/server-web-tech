const express = require('express');
const { JSDOM } = require('jsdom');

const https = require('https');
const fs = require('fs');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

const LOGIN = '99803203-b584-4d0c-a62e-0e9704ea6563';

// fetch: используем встроенный (Node 18+), иначе — node-fetch
const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.get('/login/', (_, res) => {
    res.type('text/plain').send(LOGIN);
});

function waitWindowLoad(dom) {
    return new Promise((resolve) => {
        if (dom.window.document.readyState === 'complete') return resolve();
        dom.window.addEventListener('load', () => resolve(), { once: true });
    });
}

async function waitForInputValue(inp, timeoutMs = 1000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (inp.value && String(inp.value).trim() !== '') return inp.value;
        await new Promise(r => setTimeout(r, 25));
    }
    return inp.value; // что есть — то есть
}

app.get('/test/', async (req, res) => {
    try {
        const targetURL = req.query.URL;
        if (!targetURL) return res.status(400).type('text/plain').send('Missing query param URL');

        // 1) Скачиваем HTML по URL
        const r = await fetchFn(targetURL);
        if (!r.ok) return res.status(502).type('text/plain').send(`Failed to fetch URL: ${r.status}`);
        const html = await r.text();

        // 2) Поднимаем jsdom и разрешаем выполнение скриптов страницы
        const dom = new JSDOM(html, {
            url: targetURL,
            runScripts: 'dangerously',
            resources: 'usable',
            pretendToBeVisual: true
        });

        // 3) Дожидаемся, пока страница "загрузится"
        await waitWindowLoad(dom);

        const { document } = dom.window;
        const bt = document.querySelector('#bt');
        const inp = document.querySelector('#inp');

        if (!bt || !inp) {
            dom.window.close();
            return res.status(500).type('text/plain').send('Elements #bt or #inp not found');
        }

        // 4) Кликаем по кнопке
        bt.click();

        // 5) Ждём появления значения в input (как в puppeteer waitForFunction)
        const result = await waitForInputValue(inp, 1000);

        dom.window.close();

        res.type('text/plain').send(String(result));
    } catch (e) {
        res.status(500).type('text/plain').send(String(e && e.stack ? e.stack : e));
    }
});

// обычно на платформе порт берут из env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Listening on', PORT));
