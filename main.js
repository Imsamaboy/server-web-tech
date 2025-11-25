const express = require('express');
const sharp = require('sharp');

const app = express();

app.get('/makeimage', (req, res) => {
  const width = parseInt(req.query.width, 10) || 100;
  const height = parseInt(req.query.height, 10) || 100;

  sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
      .png()
      .toBuffer((err, data) => {
        if (err) {
          return res.status(500).send('Error generating image');
        }
        res.set('Content-Type', 'image/png');
        res.send(data);
      });
});

app.get('/login', (req, res) => {
  const login = 'sfelshtyn';
  res.send(login);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
