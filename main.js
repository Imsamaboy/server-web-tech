const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const MY_LOGIN = '99803203-b584-4d0c-a62e-0e9704ea6563';

// Маршрут /login/ — возвращает ваш логин
app.get('/login/', (req, res) => {
  res.send(MY_LOGIN);
});

// Маршрут /insert/ — вставка документа в MongoDB
app.post('/insert/', async (req, res) => {
  const { login, password, URL } = req.body;

  if (!login || !password || !URL) {
    return res.status(400).send('Missing login, password, or URL');
  }

  try {
    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const userSchema = new mongoose.Schema({
      login: String,
      password: String,
    });

    const User = mongoose.model('User', userSchema);

    const user = new User({ login, password });
    await user.save();

    res.send('User inserted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting user');
  } finally {
    await mongoose.disconnect();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
