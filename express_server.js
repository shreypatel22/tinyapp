const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['userID']
}))

const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const {getUser} = require('./helpers');

app.use(bodyParser.urlencoded({entended: true}));

// app.use(cookieParser());
app.set('view engine', 'ejs');

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
  const user = users[req.session.userID];
  // console.log(user);

  if(!user) {
    // return res.status(400).send("Please login.");
    return res.redirect('/login');
  };

  const userURLs = getUserUrls(user);

  const templateVars = { urls: userURLs, user };

  // console.log(templateVars);
  res.render('urls_index', templateVars);
})

// You get post on /urls from urls_new.ejs (when you sumbit new url to be shorten)
app.post("/urls", (req, res) => {
  // console.log(req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.session.userID].id
  }


  // since there is a redirect you never really stay on /urls but go to /urls/${shortURL} automatically when you click the sumbit new url button
  res.redirect(`/urls/${shortURL}`);
})

app.get('/urls/new', (req, res) => {
  const user = users[req.session.userID];
  const templateVars = {user};

  if (!user) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);  
})

app.get("/urls/:shortURL", (req, res) => {
  // The shortURL is whatever comes afet the "/urls/" in the address bar  --> you know itss get becuase we can access shortURL with params, with post its body  
  const shortURL = req.params.shortURL;
  const user = users[req.session.userID];
  // This shortURL is stored into the exported object (templateVars), along with another key longURL and its value (urlDatabase[shortURL]) that comes from the urlDatabase
  const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
  res.render("urls_show", templateVars);
})

app.post("/urls/:shortURL", (req, res) => {
  
  // user to check using curl command
    // let user = {id: '1223', email: '1@gmail.com', password: '123' } 

  const user = users[req.session.userID];
  const userURLs = getUserUrls(user);
  const shortURL = req.params.shortURL;
  
  if(userURLs[shortURL]) {
    const longURL = req.body.longURL; 
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls`);
  }

  return res.status(403).send("This user cant edit this URL");

})

app.post("/urls/:shortURL/delete", (req, res) => {

  // user to check using curl command
  // let user = {id: '123', email: '1@gmail.com', password: '123' } 

  const user = users[req.session.userID];
  const userURLs = getUserUrls(user);
  const shortURL = req.params.shortURL;

  if(userURLs[shortURL]) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }

  return res.status(403).send("This user cant delete this URL");

})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post("/logout", (req, res) => {
  // res.clearCookie('userID');
  req.session = null;
  res.redirect('/urls');
})

app.get("/register", (req, res) => {  
  const user = users[req.session.userID];
  const templateVars = { urls: urlDatabase, user };
  res.render("register_page", templateVars);
})

app.get("/login", (req, res) => {  
  const user = users[req.session.userID];
  const templateVars = { urls: urlDatabase, user };  
  res.render("login_page", templateVars);
})


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

  // console.log(user);
  // res.cookie('userID', user.id);
  req.session.userID = user.id;
  
  // console.log(users);
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
  }

  // console.log(users);
  // res.cookie('userID', userID);
  req.session.userID = userID;
  res.redirect('/urls');
})

// --------------------------------------------------

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

// const getUser = (email, database) => {    
//   for (const user in database) {
//     if (email === database[user].email) {      
//       return database[user];
//     }
//   };
//   return false;
// };

const getUserUrls = (user) => {
  let userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user.id) {
      userUrls[url] = {
        longURL: urlDatabase[url].longURL,
        userID: user.id
      }      
    }    
  }
  return userUrls; 
}

