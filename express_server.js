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


// You get post on /urls from urls_new.ejs (when you sumbit new url to be shorten)
app.post("/urls", (req, res) => {
  // console.log(req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  // since there is a redirect you never really stay on /urls but go to /urls/${shortURL} automatically when you click the sumbit new url button
  res.redirect(`/urls/${shortURL}`);
})


app.get('/urls/new', (req, res) => {
  res.render("urls_new");  
})


app.get("/urls/:shortURL", (req, res) => {
  // The shortURL is whatever comes afet the "/urls/" in the address bar  --> you know itss get becuase we can access shortURL with params, with post its body  
  const shortURL = req.params.shortURL;
  // This shortURL is stored into the exported object (templateVars), along with another key longURL and its value (urlDatabase[shortURL]) that comes from the urlDatabase
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
})

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  // gets the shortURL key from req.params.shortURL ---> why doesnt the delete come here
  const shortURL = req.params.shortURL;
  // delete the URL from the urlDatabase object
  delete urlDatabase[req.params.shortURL];
  // redirect back to urls page but now when it loads "url_index" (due to .get "/urls") it doesnt have the delete URL
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  var text = "";
  
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  
  for (var i = 0; i < 6; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  
  return text;
}

