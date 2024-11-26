const express = require('express');
const app = express();

app.get('/', function (req, res) {
    const page = parseInt(req.query.page) || 1; // Page actuelle (par défaut : 1)
    const limit = 20; // Nombre d'éléments par page
    const offset = (page - 1) * limit; // Déplacement des résultats
    let SQL = "SELECT user_id, email FROM users LIMIT 0, 20";
    app.connection.query(SQL, function (err, data) {
    if(err) {
    console.log("Error fetching data: ", err);
    res.status(404).send(err.sqlMessage);
    } 
    let SQL = "SELECT user_id, email FROM users LIMIT 0, 20";
    app.connection.query(SQL, function (err, result) {
        if (err) {
            console.error("Error counting categories:", err);
            return res.status(500).send(err.sqlMessage);
        }
    const total = result[0].total;
    const totalPages = Math.ceil(total / limit);
    res.render('users/index', {
    data:data,
    partials: {row: 'users/row'},
    page,
    totalPages
    });
    });
    });
     
});

app.post("/", function (req, res) {
    const email = req.body.email;

    // Validate that description is not undefined
    let SQL = "INSERT INTO users (email) VALUES (?)";
    app.connection.execute(SQL, [email], function (err, data) {
        if (err) {
            console.log("Error adding data: ", err);
            return res.status(404).send(err.sqlMessage);
        } else {
            console.log("Data after insertion: ", data); // Log the data object
            res.render('users/row', {
                user_id: data.insertId,
                email: email
            });
        }
    });
});
   app.delete("/:user_id", function (req, res) {
    let SQL = "DELETE FROM users WHERE user_id = ?";
    app.connection.execute(SQL, [req.params.user_id], function (err, data) {
    if(err) {
    console.log("Error deleting data: ", err);
    res.status(404).send(err.sqlMessage);
    }
    else {
    res.send("");
    }
    });
   }); 

app.get("/:user_id", function (req, res) {
    let SQL = "SELECT email FROM users WHERE user_id = ?";
    app.connection.execute(SQL, [req.params.user_id], function (err, data) {
    if(err) {
    console.log("Error fetching data: ", err);
    res.status(404).send(err.sqlMessage);
    }
    else {
    res.render('users/edit', {
    user_id:req.params.user_id,
    email:data[0].email,
    });
    }
    });
   });

app.put("/:user_id", function (req, res) {
    let showRow = function() {
    let SQL = "SELECT user_id, email FROM users WHERE user_id = ?";
    app.connection.execute(SQL, [req.params.user_id], function (err, data) {
    if(err) {
    console.log("Error fetching data: ", err);
    res.status(404).send(err.sqlMessage);
    }
    else {
    res.render('users/row', {
    user_id: data[0].user_id,
    email: data[0].email
    });
    }
    });
    };
    if( req.body.action == "update" ) {
    let SQL = "UPDATE users SET email = ? WHERE user_id = ?";
    const email = req.body.email;
    const user_id = req.params.user_id;
    app.connection.execute(SQL, [email, user_id], function (err, data) {
    if(err) {
    console.log("Error updating data: ", err);
    res.status(404).send(err.sqlMessage);
    }
    else {
    showRow();
    }
    });
    }
    else {
    showRow();
    }
   }); 

module.exports = app; 
