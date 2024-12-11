const express = require('express'); 
const db = require('mysql2');  
const app = express();  
const sanitizer = require('express-sanitizer');
const session = require('express-session')
app.use( sanitizer() );
app.set('view engine', 'hjs'); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public"));  
const configs = require('./config'); 
const connection = db.createConnection(configs.db);

app.disable('x-powered-by');


connection.connect( (err) => { 
if(err) { 
console.log("Error connecting to database: ", err); 
process.exit(); 
} 
else { 
console.log("Connected to database"); 
} 
}); 
;

// Use express-session middleware to handle user sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false, // Ne sauvegarde pas si la session n'est pas modifiée
  saveUninitialized: false, // N'enregistre pas de session vide
  cookie: {
      secure: true, // Mettez `true` pour HTTPS
      httpOnly: true,
      maxAge: 9000000, // Durée de vie de 1 heure
      sameSite: 'strict'
  }
}));
app.connection = connection;

function doSQL(SQL, parms, res, callback) {
  app.connection.execute(SQL, parms, function (err, data) {
  if(err) {
  console.log(err);
  res.status(404).send(err.sqlMessage);
  }
  else {
  callback(data);
  }
  });
 }
function checkAuthentication(req, res, next) {
  // For this example, we're assuming that a session or a cookie tracks user authentication.
  // If you're using sessions, you'd check something like req.session.user or a cookie.
  if (!req.session || !req.session.user) {
      // If no user is logged in, redirect to the login page
      return res.redirect('/login');
  }
  next();
}
app.get('/', (req, res) => { 
    /*if( req.get("HX-Request") ) { 
        res.send( 
          '<div  class="text-center">' + 
          '<i class="bi bi-cup-hot" style="font-size: 50vh;"></i>' + 
          '</div>' 
        );
    }*/
res.render('login', { 
title: 'Welcome to  e-management',
 
}); 
}); 

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Route to handle login authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body;

      let SQL ='SELECT * FROM users WHERE email = ? and password = ?';
      doSQL(SQL, [username,password], res, function(results)
      {
          if (results.length > 0) {
            console.log("User logged in:", results[0]);
           req.session.user = results[0];
            if (results[0].admin == 1) {
              // Store user data in session after successful login
               // Store user details in the session
              return res.redirect('/layout');
            }
            else if (results[0].job == 'driver') {
              // Store user data in session after successful login
              // Store user details in the session
              return res.redirect('/layout_driver');
            }
            else {
              return res.redirect('/layout_employer');
            }
          
          } else {
              return res.send('<div class="alert alert-danger">Invalid username or password.</div>');
          }
      
    });
});

app.post('/sign', (req, res) => {

      let SQL ='INSERT INTO users (email, password, job) Values(?,?, ?)';
      const job= req.body.job;
        doSQL(SQL, [req.body.email,req.body.password,req.body.job], res, function(results)
      {
            if (job == 'employer') {
              // Store user data in session after successful login
              // Store user details in the session
              return res.redirect('/layout_employer');
            }
            else {
              return res.redirect('/layout_driver');
            }

      });
      
    
});

app.get('/layout', function (req, res, next) { 
    if( req.get("HX-Request") ) { 
      next();  
    } 
    else { 
      res.render('layout', { 
        title: 'Welcome to Civilink e-management',     
        partials: { 
          navbar: 'navbar', 
        }, 
        where: req.url 
      });  
    } 
  });
  app.get('/layout_employer', function (req, res, next) { 
    if( req.get("HX-Request") ) { 
      next();  
    } 
    else { 
      res.render('layout_employer', { 
        title: 'Welcome to Civilink e-management',     
        partials: { 
          navbar: 'navbar_employer', 
        }, 
        where: req.url 
      });  
    } 
  });
  app.get('/layout_driver', function (req, res, next) { 
    if( req.get("HX-Request") ) { 
      next();  
    } 
    else { 
      res.render('layout_driver', { 
        title: 'Welcome to Civilink e-management',     
        partials: { 
          navbar: 'navbar_driver', 
        }, 
        where: req.url 
      });  
    } 
  });
  app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session: ", err);
            return res.status(500).send("Error logging out.");
        }

        // Redirect to login page after successful logout
        res.redirect('/login');
    });
});
app.get('/sign_up', function(req, res) {
  res.render('sign_up'); // Ensure 'sign_up.hjs' exists in your views directory
});


const categories = require('./routes/categories'); 
categories.connection = connection;
app.use('/categories', categories);

const users = require('./routes/users'); 
users.connection = connection;
app.use('/users', users);

const products = require('./routes/products'); 
products.connection = connection; 
app.use('/products', products);

const transactions = require('./routes/transactions'); 
transactions.connection = connection; 
app.use('/transactions', transactions);

const jobs = require('./routes/jobs'); 
jobs.connection = connection; 
app.use('/jobs', jobs);

const profils = require('./routes/profils'); 
profils.connection = connection; 
app.use('/profils', profils);
/*
app.listen(80, function () { 
console.log('Web server listening on port 80!'); 
*/
const fs = require('fs');
const privateKey = fs.readFileSync('key.pem');
const certificate = fs.readFileSync('cert.pem');
const https = require('https');
const httpsServer = https.createServer({key: privateKey, cert: certificate}, app);
httpsServer.listen(80, function () {
console.log('Web server listening on port 80!');
});