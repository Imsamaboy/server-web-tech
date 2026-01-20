// main.js
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

const LOGIN = "sfelshtyn";
const TARGET = "https://kodaktor.ru/g/d7290da";

const PORT = process.env.PORT || 3000;

let browserPromise = null;

async function getBrowser() {
    if (!browserPromise) {
        browserPromise = puppeteer
            .launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            })
            .catch((e) => {
                browserPromise = null;
                throw e;
            });
    }
    return browserPromise;
}

function extractNumber(req) {
    // поддерживаем:
    // /zombie/1234
    // /zombie?n=1234
    // /zombie?num=1234
    // /zombie?1234   (без имени параметра)
    let raw =
        (req.params && req.params.n) ||
        (req.query && (req.query.n || req.query.num || req.query.number || req.query.value));

    if (raw == null) {
        const keys = Object.keys(req.query || {});
        // если запрос вида /zombie?1234, то express обычно парсит это как {"1234":""}
        if (keys.length === 1) raw = keys[0];
    }

    const n = Number(String(raw ?? "").trim());
    return Number.isFinite(n) ? n : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tryTypeNumber(page, n) {
    const selectors = ["input[type=\"number\"]", "input[type=\"text\"]", "input:not([type])"];
    for (const sel of selectors) {
        const el = await page.$(sel);
        if (el) {
            await el.click({ clickCount: 3 });
            await page.keyboard.type(String(n));
            return true;
        }
    }
    return false;
}

async function tryClickButton(page) {
    const selectors = [
        "button",
        "input[type=\"button\"]",
        "input[type=\"submit\"]",
        "[role=\"button\"]",
        "#btn",
        "#button",
        "#go",
        "#run",
    ];

    for (const sel of selectors) {
        const el = await page.$(sel);
        if (el) {
            await Promise.race([
                page.waitForNavigation({ waitUntil: "networkidle2", timeout: 4000 }).catch(() => null),
                el.click().catch(() => null),
            ]);
            return true;
        }
    }

    await page.keyboard.press("Enter").catch(() => null);
    return false;
}

async function readResultFromPage(page) {
    await sleep(350);

    const h1 = await page.$("h1");
    if (h1) {
        const t = await page
            .$eval("h1", (el) => (el.textContent || "").trim())
            .catch(() => "");
        if (t) return t;
    }

    for (const sel of ["#out", "#result", "output", "pre", "h2", "h3"]) {
        const el = await page.$(sel);
        if (el) {
            const t = await page
                .$eval(sel, (e) => (e.textContent || "").trim())
                .catch(() => "");
            if (t) return t;
        }
    }

    return (await page.title()).trim();
}

async function solveZombie(n) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        page.setDefaultTimeout(20000);

        const url = `${TARGET}?${encodeURIComponent(String(n))}`;
        await page.goto(url, { waitUntil: "networkidle2" });

        await tryTypeNumber(page, n);
        await tryClickButton(page);

        return await readResultFromPage(page);
    } finally {
        await page.close().catch(() => null);
    }
}

app.get("/", (req, res) => res.type("text/plain").send("OK"));

app.get("/login", (req, res) => {
    res.type("text/plain").send(LOGIN);
});

app.get("/zombie/:n?", async (req, res) => {
    const n = extractNumber(req);
    if (n === null) {
        res.status(400).type("text/plain").send("Bad number");
        return;
    }

    try {
        const result = await solveZombie(n);
        res.type("text/plain").send(String(result));
    } catch (e) {
        console.error(e);
        res.status(500).type("text/plain").send("Zombie error");
    }
});

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, async () => {
        try {
            const b = await browserPromise;
            if (b && b.close) await b.close();
        } finally {
            process.exit(0);
        }
    });
}
