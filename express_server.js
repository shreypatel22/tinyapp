const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({entended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// When you type in only '/' after website (defualt/home page)
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Send json object of urlDatabase to client when they enter '/urls.json'
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

// Send html code to client/browser when they enter /hello
app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

// Set data to urls_index.ejs (sending object [templateVars] --> in the .ejs file it is refered to as "urls" and its keys [url])
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
})

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("OK");
})


app.get('/urls/new', (req, res) => {
    res.render("urls_new");  
})


app.get("/urls/:shortURL", (req, res) => {
  // The shortURL is whatever comes afet the "/urls/" in the address bar
  const shortURL = req.params.shortURL;
  // This shortURL is stored into the exported object (templateVars), along with another key longURL and its value (urlDatabase[shortURL]) that comes from the urlDatabase
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});