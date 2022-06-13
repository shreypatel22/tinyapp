const express = require('express');
const app = express();
const PORT = 8080;

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});