const e = require('express');
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
app.get('/', function (req, res) {
    let SQL = "SELECT job_id, description, employer_id, salary FROM jobs WHERE driver_id = ?";
    let SQL2 = "SELECT job_id, description, driver_id, salary FROM jobs WHERE employer_id = ?";
    const userId = req.session.user.user_id;
    if (req.session.user.job == 'driver') {
    doSQL(SQL, [userId], res, function(data) {
    res.render('profils/index', {
    data:data,
    partials: {row: 'profils/row'},
    });
    });
}
    else {  
    doSQL(SQL2, [userId], res, function(data) {
    res.render('profils/index', {
    data:data,
    partials: {row: 'profils/row'},
    });
    });
    }
});
app.get('/sold', function (req, res) {
    console.log("sold");
    let SQL3 = "SELECT transaction_id, buyer_id, product_id, price, status FROM trans WHERE seller_id = ?";
    const userId = req.session.user.user_id;
    doSQL(SQL3,[userId], res, function(data3) {
        res.render('profils/rowsold',{
            data3:data3,
         
        });
});
});
app.get('/bought', function (req, res) {
    console.log("bought");
    let SQL2 = "SELECT transaction_id, seller_id, product_id, price, status FROM trans WHERE buyer_id = ?";
    const userId = req.session.user.user_id;
    doSQL(SQL2,[userId], res, function(data2) {
        res.render('profils/rowbuy',{
            data2:data2,
        });
});
});
module.exports = app;