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
 res.render('products/index', {
 types:data,
 });
 });
});

app.get(['/', '/typedlist'], function (req, res) {
    let SQL = "SELECT product_id, title FROM products WHERE category_id = ?";
    doSQL(SQL, [req.query.category_id], res, function(data) {
    res.render('products/list', {
    products:data,
    });
    });
   }); 

app.get("/search", function (req, res) {
    res.render('products/search');
}); 
   
app.get("/searchResult", function (req, res) {
    const keyword = "%" + req.query.keyword + "%";
    let SQL = "SELECT product_id, title FROM products WHERE title LIKE ?";
    doSQL(SQL, [keyword], res, function(data) {
    res.render('products/list', {
    products:data,
    });
    });
   });

app.get('/add', function (req, res) {
    let SQL = "SELECT category_id, description FROM categories";
    doSQL(SQL, [], res, function(data) {
    res.render('products/add', {
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
   
   app.delete('/:product_id', function (req, res) {
    let SQL = "DELETE FROM products WHERE product_id=?";
    doSQL(SQL, [req.params.product_id], res, function(data) {
    res.send("");
    });
   });   

module.exports = app;

