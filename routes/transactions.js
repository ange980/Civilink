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
 let SQL = "SELECT transaction_id, status FROM trans";
 doSQL(SQL, [], res, function(data) {
 res.render('transactions/index', {
 types:data,
 });
 });
});

app.get(['/', '/typedlist'], function (req, res) {
    console.log("Request received for /transactions/typedList");
    let SQL = "SELECT transaction_id, status FROM trans WHERE status= ?";
    doSQL(SQL, [req.query.status], res, function(data) {
    res.render('transactions/list', {
    transactions:data,
    });
    });
});

app.get("/search", function (req, res) {
    res.render('transactions/search');
}); 
   
app.get("/searchResult", function (req, res) {
    const keyword = "%" + req.query.keyword + "%";
    let SQL = "SELECT transaction_id, status FROM trans WHERE transaction_id LIKE ?";
    doSQL(SQL, [keyword], res, function(data) {
    res.render('transactions/list', {
    transactions:data,
    });
    });
   });

app.get('/add', function (req, res) {
    let SQL = "SELECT transaction_id, status FROM trans";
    doSQL(SQL, [], res, function(data) {
    res.render('transactions/add', {
    types:data,
        });
    });
}); 
   
app.post('/', function (req, res) {
    let SQL = "INSERT INTO trans (transaction_id, status, item_condition, price, location) VALUES (?, ?, ?, ?, ?)";
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

