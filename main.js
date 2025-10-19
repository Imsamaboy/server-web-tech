import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// Middleware для парсинга JSON тела запроса
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware для CORS на все маршруты
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'x-test,ngrok-skip-browser-warning,Content-Type,Accept,Access-Control-Allow-Headers'
    );
    next();
});

// Основной маршрут
app.all('/result4/', (req, res) => {
    const xTestHeader = req.header('x-test') || null;
    const xBody = req.body || null;

    res.setHeader('Content-Type', 'application/json');
    res.json({
        message: '99803203-b584-4d0c-a62e-0e9704ea6563',
        'x-result': xTestHeader,
        'x-body': xBody
    });
});

// Любой другой маршрут
app.all('*', (req, res) => {
    res.send('Not Found');
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT);
