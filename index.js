require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const URL = require('./models/url');
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.connect('mongodb://localhost:27017/urlShortner', { useNewUrlParser: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post("/api/shorturl", async (req, res) => {

  let original_url = req.body.url;
  // url validation
  if (!original_url) {
    return res.json({ error: "No URL provided" });
  }

  original_url = original_url.toString();

  if (original_url.startsWith("https://")) {
    try {
      //checking url in data base
      let existingUrl = await URL.findOne({ original_url: original_url });
      if (existingUrl) {
        return res.json({
          original_url: existingUrl.original_url,
          short_url: existingUrl.short_url
        })
      }
      //create new url
      let count = await URL.countDocuments({});
      const newUrl = new URL({
        original_url: original_url,
        short_url: count + 1
      })
      // saving new Url
      let savedUrl = await newUrl.save();
      return res.json({
        original_url: savedUrl.original_url,
        short_url: savedUrl.short_url
      })
    } catch (err) {
      return res.json({ error: "Database Error", error_desc: err });
    }
  }
});


app.get('/api/shorturl/:short_url', async (req, res) => {
  const short_url = req.params.short_url;
  try {
    let data = await URL.findOne({ short_url });
    if (!data) {
      return res.json({
        error: "Invalid URL"
      })
    }
    res.redirect(data.original_url);
  } catch (err) {
    return res.json({ error: "Database Error", error_desc: err });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

