// const express = require('express');
// const multer = require('multer');
// const sharp = require('sharp');
// const https = require('https');
// const fs = require('fs');

// Импортируем необходимые пакеты
const SYSTEM_LOGIN = "99803203-b584-4d0c-a62e-0e9704ea6563";
const TEXT_PLAIN_HEADER = { "Content-Type": "text/plain; charset=utf-8" };

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Инициализация приложения
const app = express();

// Мидлвар для разбора тела POST-запроса
app.use(bodyParser.urlencoded({ extended: true }));

// === 1. Маршрут /login/ ===
// Возвращает логин как простой текст
app.get('/login/', (req, res) => {
    res.send('99803203-b584-4d0c-a62e-0e9704ea6563');
});

// === 2. Маршрут /insert/ ===
// Принимает login, password, URL из тела POST-запроса
app.post('/insert/', async (req, res) => {
    const { login, password, URL } = req.body;

    if (!login || !password || !URL) {
        return res.status(400).send('Не хватает параметров: login, password или URL');
    }

    try {
        // Подключаемся к MongoDB
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Описываем схему
        const userSchema = new mongoose.Schema({
            login: String,
            password: String
        });

        // Создаём модель
        const User = mongoose.model('User', userSchema);

        // Записываем новый документ
        const newUser = new User({ login, password });
        await newUser.save();

        // Закрываем соединение после записи
        await mongoose.connection.close();

        res.send(`Пользователь ${login} успешно добавлен!`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при работе с базой данных');
    }
});

app.all(/.*/, (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
