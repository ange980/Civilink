const express = require('express'); 
const db = require('mysql2');  
const app = express();  
app.set('view engine', 'hjs'); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public"));  
const configs = require('./config'); 
const connection = db.createConnection(configs.db); 
connection.connect( (err) => { 
if(err) { 
console.log("Error connecting to database: ", err); 
process.exit(); 
} 
else { 
console.log("Connected to database"); 
} 
}); 
const session = require('express-session');

// Use express-session middleware to handle user sessions
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

function checkAuthentication(req, res, next) {
  // For this example, we're assuming that a session or a cookie tracks user authentication.
  // If you're using sessions, you'd check something like req.session.user or a cookie.
  if (!req.session || !req.session.user) {
      // If no user is logged in, redirect to the login page
      return res.redirect('/login');
  }
  next();
}
app.get('/', checkAuthentication, (req, res) => { 
    /*if( req.get("HX-Request") ) { 
        res.send( 
          '<div  class="text-center">' + 
          '<i class="bi bi-cup-hot" style="font-size: 50vh;"></i>' + 
          '</div>' 
        );
    }*/
res.render('layout', { 
title: 'Welcome to  e-management',
partials: { 
    navbar: 'navbar', 
    }    
}); 
}); 

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Route to handle login authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  connection.query(
      'SELECT * FROM users WHERE email = ?',
      [username],
      (err, results) => {
          if (err) {
            console.error("Error querying database: ", err);
            return res.status(500).send('Error authenticating user.');
          }

          if (results.length > 0) {
            if (results[0].admin == 1) {
              // Store user data in session after successful login
              req.session.user = results[0]; // Store user details in the session
              return res.redirect('/');
            }
            else {
              return res.send('the user interface is not available for non-admin users');
            }
          } else {
              return res.send('<div class="alert alert-danger">Invalid username or password.</div>');
          }
      }
  );
});


app.get('/*', function (req, res, next) { 
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

const categories = require('./routes/categories'); 
categories.connection = connection;
app.use('/categories', categories);

const users = require('./routes/users'); 
users.connection = connection;
app.use('/users', users);

const products = require('./routes/products'); 
products.connection = connection; 
app.use('/products', products);




app.listen(80, function () { 
console.log('Web server listening on port 80!'); 
});