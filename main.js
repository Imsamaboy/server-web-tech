const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const https = require('https');
const fs = require('fs');

const app = express();
const upload = multer(); // сохраняем в оперативной памяти
const SYSTEM_LOGIN = "";
const TEXT_PLAIN_HEADER = { "Content-Type": "text/plain; charset=utf-8" };

const LOGIN = "99803203-b584-4d0c-a62e-0e9704ea6563"; // заменить login

app.get('/login/', (req, res) => {
    res.type('text/plain').send(LOGIN);
});

// === Маршрут /size2json ===
// Получает PNG изображение в поле image (multipart/form-data)
app.post("/insert/", async (req, res) => {
    const { login, password, URL: mongoUrl } = req.body;
    if (!login || !password || !mongoUrl) return res.status(400).set(TEXT_PLAIN_HEADER).send("Error: 'login', 'password', and 'URL' are required in the body.");
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection("users");
        const doc = { login, password };
        await collection.insertOne(doc);
        res.set(TEXT_PLAIN_HEADER).status(201).send("User created successfully.");
    } catch (err) {
        res.status(500).set(TEXT_PLAIN_HEADER).send(err.toString());
    } finally {
        if (client) await client.close();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
