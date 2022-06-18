const express = require('express');
const app = express();
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['userID']
}));

const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const {getUser} = require('./helpers');
app.use(bodyParser.urlencoded({entended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
  i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    },

  shortURLTest: {
    longURL: "https://www.google.ca",
    userID: "123"
  }
};

const users = {
  123: {id: '123', email: '1@gmail.com', password: '123' }
};

app.get("/", (req, res) => {
  const user = users[req.session.userID];

  if (!user) {
    return res.redirect('/login');
  }

  return res.redirect('/urls');

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.session.userID];

  if (!user) {
    return res.status(400).send("Please login.");
  }

  const userURLs = getUserUrls(user);
  const templateVars = { urls: userURLs, user };

  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.session.userID].id
  };
  
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.session.userID];
  const templateVars = {user};

  if (!user) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.session.userID];
  const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  
  const user = users[req.session.userID];
  const userURLs = getUserUrls(user);
  const shortURL = req.params.shortURL;
  
  if (userURLs[shortURL]) {
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls`);
  }

  return res.status(403).send("This user cant edit this URL");
});

app.post("/urls/:shortURL/delete", (req, res) => {

  const user = users[req.session.userID];
  const userURLs = getUserUrls(user);
  const shortURL = req.params.shortURL;

  if (userURLs[shortURL]) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }

  return res.status(403).send("This user cant delete this URL");

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const user = users[req.session.userID];
  const templateVars = { urls: urlDatabase, user };
  res.render("register_page", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.session.userID];
  const templateVars = { urls: urlDatabase, user };
  res.render("login_page", templateVars);
});


app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  const user = getUser(email, users);
  if (!user) {
    return res.status(403).send("User doesn't exist.");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid password.");
  }

  req.session.userID = user.id;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();
 
  if (email === '' || password === '') {
    return res.status(400).send(`Error 400, please enter BOTH an email and password.`);
    
  }

  if (getUser(email, users)) {
    return res.status(400).send('Email already registered, please enter a new email');
  }

  users[userID] = {
    id: userID,
    email,
    password: hashedPassword
  };

  req.session.userID = userID;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const generateRandomString = () => {
  let text = "";
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
};

const getUserUrls = (user) => {
  let userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user.id) {
      userUrls[url] = {
        longURL: urlDatabase[url].longURL,
        userID: user.id
      };
    }
  }
  return userUrls;
};

