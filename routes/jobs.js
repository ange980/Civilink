const express = require('express');
const app = express.Router();

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
app.get(['/', '/index'], function (req, res) {
 let SQL = "SELECT category_id, description FROM categories";
 doSQL(SQL, [], res, function(data) {
 res.render('jobs/index', {
 types:data,
 });
 });
});

app.get(['/', '/typedlist'], function (req, res) {
    let SQL = "SELECT job_id, description, employer_id, salary FROM jobs WHERE category_id = ? and driver_id is NULL";
    doSQL(SQL, [req.query.category_id], res, function(data) {
    res.render('jobs/list', {
    jobs:data,
    });
    });
   }); 

app.get("/search", function (req, res) {
    res.render('jobs/search');
}); 
   
app.get("/searchResult", function (req, res) {
    const keyword = "%" + req.query.keyword + "%";
    let SQL = "SELECT product_id, title, item_condition, price, location FROM products WHERE title LIKE ?";
    doSQL(SQL, [keyword], res, function(data) {
    res.render('jobs/list', {
    products:data,
    });
    });
   });

app.get('/add', function (req, res) {
    let SQL = "SELECT category_id, description FROM categories";
    doSQL(SQL, [], res, function(data) {
    res.render('jobs/add', {
    types:data,
        });
    });
}); 
   
app.post('/', function (req, res) {
    let SQL = "INSERT INTO products (category_id, title, item_condition, price, location) VALUES (?, ?, ?, ?, ?)";
    doSQL(SQL, [req.body.category_id, req.body.title,req.body.condition, req.body.price, req.body.location], res, function(data) {
    res.send(`product ${req.body.title} added with id ${data.insertId}`);
    });
   }); 


  app.post('/apply/:job_id', function (req, res) {
    // Vérification si l'utilisateur est connecté
    console.log("Session in /apply:", req.session);
    if (!req.session || !req.session.user || !req.session.user.user_id) {
        return res.status(401).send("Unauthorized: User not logged in.");
    }
    console.log("Job id in /apply:",req.params.job_id);
    console.log("User id in /apply:",req.session.user.user_id);
    // Récupérer user_id de la session
    const userId = req.session.user.user_id;

    // Exécuter l'insertion SQL
    let SQL = "Update jobs set driver_id=? WHERE job_id=?";
    doSQL(SQL, [userId,req.params.job_id], res, function(data) {
        res.send(`Job application for ${req.body.description} submitted successfully.`);
    });
});

   

   app.delete('/:product_id', function (req, res) {
    let SQL = "DELETE FROM products WHERE product_id=?";
    doSQL(SQL, [req.params.product_id], res, function(data) {
    res.send("");
    });
   });   

module.exports = app;

