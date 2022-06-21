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

// Storing all urls
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

// Storing users created
const users = {
  123: {id: '123', email: '1@gmail.com', password: '123' }
};

// Home page
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

// Urls Page
app.get("/urls", (req, res) => {
  let user = users[req.session.userID];

  if (user) {
    const userURLs = getUserUrls(user);
    const templateVars = { urls: userURLs, user };
    return res.render('urls_index', templateVars);

  }

  user = undefined;
  const templateVars = { user };
  res.render('urls_index', templateVars);
});

// Redirect to urls:shortURL page when adding new urls
app.post("/urls", (req, res) => {
  let shortURL = generateUniqueShortURL();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.session.userID].id
  };
  
  res.redirect(`/urls/${shortURL}`);
});

// Page to add new urls
app.get('/urls/new', (req, res) => {
  const user = users[req.session.userID];
  const templateVars = {user};

  // Redirect to login page if user is not logged in
  if (!user) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

// Page for shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userID];

  if (!user) {
    return res.status(400).send("Please login.");
  }

  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
  res.render("urls_show", templateVars);
});

// Edit longURL and then redirect to urls page
app.post("/urls/:shortURL", (req, res) => {
  
  const user = users[req.session.userID];
  const userURLs = getUserUrls(user);
  const shortURL = req.params.shortURL;
  
  if (userURLs[shortURL]) {
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls`);
  }

  // Return Error if user has not created that url
  return res.status(403).send("This user cant edit this URL");
});

// Delete shortURLs created by user
app.post("/urls/:shortURL/delete", (req, res) => {

  const user = users[req.session.userID];
  const userURLs = getUserUrls(user);
  const shortURL = req.params.shortURL;

  if (userURLs[shortURL]) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }

  // Return Error if user has not created that url
  return res.status(403).send("This user cant delete this URL");

});

// Redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Load register page
app.get("/register", (req, res) => {
  const user = users[req.session.userID];
  const templateVars = { urls: urlDatabase, user };
  res.render("register_page", templateVars);
});

// Load Login Page
app.get("/login", (req, res) => {
  const user = users[req.session.userID];
  const templateVars = { urls: urlDatabase, user };
  res.render("login_page", templateVars);
});

// Log user in
app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  const user = getUser(email, users);

  // Send error if user is not registerd
  if (!user) {
    return res.status(403).send("User doesn't exist.");
  }
  // Send error if incorrect password is entered
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid password.");
  }

  req.session.userID = user.id;
  res.redirect('/urls');
});

// Register User
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateUniqueShortURL();
 
  // Send error if email or password are not entered
  if (!email  || !password) {
    return res.status(400).send(`Error 400, please enter BOTH an email and password.`);
    
  }

  // Send error if email is already registered
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

// Create unique shortURL
const generateUniqueShortURL = () => {
  let text = "";
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
};

// Return the urls created by user
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

