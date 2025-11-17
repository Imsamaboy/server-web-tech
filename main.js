const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { MongoClient } = require('mongodb');
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

app.post('/insert/', async (req, res) => {
  let client;

  try {
    const { login, password, URL } = req.body;

    client = new MongoClient(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await client.connect();

    // Get DB from URL -> "readusers"
    const dbName = URL.split('/').pop().split('?')[0];
    const db = client.db(dbName);

    const usersCollection = db.collection('users');

    const userDocument = {
      login: login,
      password: password,
      createdAt: new Date()
    };

    await usersCollection.insertOne(userDocument);

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  } finally {
    if (client) {
      await client.close();
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
