// server.js
const express = require('express');
const { JSDOM } = require('jsdom');

const app = express();

const LOGIN = '99803203-b584-4d0c-a62e-0e9704ea6563';

// fetch: используем встроенный (Node 18+), иначе подгружаем node-fetch
const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.get('/login/', (req, res) => {
    res.type('text/plain').send(LOGIN);
});

function waitWindowLoad(dom) {
    return new Promise((resolve) => {
        // если вдруг уже успело загрузиться
        if (dom.window.document.readyState === 'complete') return resolve();
        dom.window.addEventListener('load', () => resolve(), { once: true });
    });
}

async function waitForInputChange(inp, prevValue, timeoutMs = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const cur = inp.value;
        if (cur !== prevValue && cur !== '') return cur;
        await new Promise(r => setTimeout(r, 50));
    }
    // если значение не изменилось, всё равно вернём текущее (может быть уже нужным)
    return inp.value;
}

app.get('/test/', async (req, res) => {
    try {
        const targetUrl = req.query.URL;
        if (!targetUrl) {
            return res.status(400).type('text/plain').send('Missing query param URL');
        }

        // 1) скачиваем HTML
        const r = await fetchFn(targetUrl);
        if (!r.ok) {
            return res.status(502).type('text/plain').send(`Failed to fetch URL: ${r.status}`);
        }
        const html = await r.text();

        // 2) создаём jsdom, разрешаем выполнение скриптов страницы
        const dom = new JSDOM(html, {
            url: targetUrl,
            runScripts: 'dangerously',
            resources: 'usable',
            pretendToBeVisual: true,
        });

        // 3) ждём загрузки ресурсов/скриптов
        await waitWindowLoad(dom);

        const { document } = dom.window;
        const bt = document.getElementById('bt');
        const inp = document.getElementById('inp');

        if (!bt || !inp) {
            dom.window.close();
            return res.status(500).type('text/plain').send('Elements #bt or #inp not found');
        }

        const before = inp.value;

        // 4) кликаем по кнопке
        bt.click();

        // 5) ждём пока в input появится/изменится значение (на случай setTimeout внутри страницы)
        const value = await waitForInputChange(inp, before, 5000);

        dom.window.close();

        // 6) отдаём результат
        res.type('text/plain').send(String(value));
    } catch (e) {
        res.status(500).type('text/plain').send(String(e && e.stack ? e.stack : e));
    }
});

// обычно на платформе порт берут из env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Listening on', PORT));
