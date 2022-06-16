const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({entended: true}));
app.use(cookieParser());

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
    }
};



for (const url in urlDatabase) {
  console.log(urlDatabase[url]);
}

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
  const user = users[req.cookies.userID];
  // console.log(user);
   

  const templateVars = { urls: urlDatabase, user };

  console.log(templateVars);
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
  const user = users[req.cookies.userID];
  const templateVars = {user};

  if (!user) {
    res.redirect('/login');
  }

  res.render("urls_new", templateVars);  
})

app.get("/urls/:shortURL", (req, res) => {
  // The shortURL is whatever comes afet the "/urls/" in the address bar  --> you know itss get becuase we can access shortURL with params, with post its body  
  const shortURL = req.params.shortURL;
  const user = users[req.cookies.userID];
  // This shortURL is stored into the exported object (templateVars), along with another key longURL and its value (urlDatabase[shortURL]) that comes from the urlDatabase
  const templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
  res.render("urls_show", templateVars);
})

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  // req.params gives an object where the key is "shortURL" and the value is whatever is in the addressbar where :shortURL is
  // :shortURL can be named anything --> this is the name of the key in the object (after the :)
  // the value that comes from the address bar is only inside the two surrounding /'s (/:shortURL/)
  const shortURL = req.params.shortURL;  //if you  "/urls/:shortURLLL/delete" then you would need to do req.params.shortURLLL
  // delete the URL from the urlDatabase object
  delete urlDatabase[shortURL];
  // redirect back to urls page but now when it loads "url_index" (due to .get "/urls") it doesnt have the delete URL
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});



app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
})

app.get("/register", (req, res) => {  
  const user = users[req.cookies.userID];
  const templateVars = { urls: urlDatabase, user };
  res.render("register_page", templateVars);
})

app.get("/login", (req, res) => {  
  const user = users[req.cookies.userID];
  const templateVars = { urls: urlDatabase, user };  
  res.render("login_page", templateVars);
})


app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  const user = getUser(email);
  if (!user) {
    return res.status(403).send("User doesn't exist.");
  }
  if (user.password !== password) {
    return res.status(403).send("Invalid password.");
  }

  res.cookie('userID', user.id);
  
  // console.log(users);
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();
 
  if (email === '' || password === '') {
    res.status(400);
    res.send(`Error 400, please enter BOTH an email and password.`);
  }

  if (getUser(email)) {
    res.status(400).send('Email already registered, please enter a new email');
  }

  users[userID] = {
    id: userID,
    email,
    password
  }

  console.log(users);
  res.cookie('userID', userID);
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

// const checkEmail = (email) => {    
//   for (const user in users) {
//     if (email === users[user].email) {      
//       return true;
//     }
//   };
//   return false;
// };

const getUser = (email) => {    
  for (const user in users) {
    if (email === users[user].email) {      
      return users[user];
    }
  };
  return false;
};

