const express = require('express');
const axios = require('axios');
const pug = require('pug');
const https = require('https');
const fs = require('fs');

const login = '99803203-b584-4d0c-a62e-0e9704ea6563';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/login/', (_, res) => {
  res.send(login);
});

app.get('/wordpress/wp-json/wp/v2/posts/1', (_, res) => {
  res.json({
    id: 1,
    slug: login,
    title: {
      rendered: login
    },
    content: {
      rendered: "",
      protected: false
    }
  });
});

app.use(express.json());

app.post('/render/', async (req, res) => {
  const { random2, random3 } = req.body;
  const { addr } = req.query;

  const templateResponse = await axios.get(addr);
  const pugTemplate = templateResponse.data;

  const compiled = pug.compile(pugTemplate);
  const html = compiled({ random2, random3 });

  res.set('Content-Type', 'text/html');
  res.send(html);
});

const PORT = process.env.PORT || 3000;
const server = https.createServer(app);

server.listen(PORT);
