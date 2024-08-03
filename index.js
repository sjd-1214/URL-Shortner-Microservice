const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Url = require('./models/url');
const validUrl = require('valid-url');

dotenv.config();

const app = express();
const port =3000;

mongoose.connect("mongodb://localhost:27017/urlShortner", {
  useNewUrlParser: true
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;

  // Check if the URL is valid
  if (!validUrl.isWebUri(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    let existingUrl = await Url.findOne({ original_url: url });

    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }

    let count = await Url.countDocuments({});

    const newUrl = new Url({ original_url: url, short_url: count+1 });

    await newUrl.save();

    res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

app.get('/api/shorturl/:shortUrl', async (req, res) => {
  const shortUrl = req.params.shortUrl;

  try {
    const url = await Url.findOne({ short_url: shortUrl });

    if (url) {
      return res.redirect(url.original_url);
    } else {
      return res.json({ error: 'No short URL found for the given input' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
