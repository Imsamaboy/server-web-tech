// server.js
const express = require('express');
const app = express();
const PORT = 3000;

// Мидлвэр для парсинга JSON тела запроса
app.use(express.json());

// Мидлвэр для CORS — разрешаем все методы и заголовки
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,DELETE,OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'x-test,ngrok-skip-browser-warning,Content-Type,Accept,Access-Control-Allow-Headers'
  );

  // Если это preflight-запрос (OPTIONS), сразу отвечаем 200
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Маршрут /result4/
app.all('/result4/', (req, res) => {
  const xTest = req.header('x-test');     // достаем заголовок x-test из запроса
  const body = req.body;                  // тело запроса
  const xBody = JSON.stringify(body);     // превращаем в строку, чтобы вернуть

  // Формируем JSON-ответ
  const response = {
    message: '99803203-b584-4d0c-a62e-0e9704ea6563',
    'x-result': xTest || null,
    'x-body': xBody || null
  };

  // Устанавливаем Content-Type
  res.setHeader('Content-Type', 'application/json');

  res.status(200).json(response);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
