const express = require('express');
const app = express.Router();
app.get('/', function (req, res) {
    let SQL = "SELECT category_id, description FROM categories ";
    app.connection.query(SQL, function (err, data) {
    if(err) {
    console.log("Error fetching data: ", err);
    res.status(404).send(err.sqlMessage);
    }
    else {
    res.render('categories/index', {
    data:data,
    partials: {row: 'categories/row'}
    });
    }
    });   
});

app.post("/", function (req, res) {
    const description = req.body.description;

    // Validate that description is not undefined
    if (description === undefined) {
        return res.status(400).send("Description is required");
    }

    let SQL = "INSERT INTO categories (description) VALUES (?)";
    app.connection.execute(SQL, [description], function (err, data) {
        if (err) {
            console.log("Error adding data: ", err);
            return res.status(404).send(err.sqlMessage);
        } else {
            console.log("Data after insertion: ", data); // Log the data object
            res.render('categories/row', {
                category_id: data.insertId,
                description: description
            });
        }
    });
});
   app.delete("/:category_id", function (req, res) {
    let SQL = "DELETE FROM categories WHERE category_id = ?";
    app.connection.execute(SQL, [req.params.category_id], function (err, data) {
    if(err) {
    console.log("Error deleting data: ", err);
    res.status(404).send(err.sqlMessage);
    }
    else {
    res.send("");
    }
    });
   }); 

app.get("/:category_id", function (req, res) {
    let SQL = "SELECT description FROM categories WHERE category_id = ?";
    app.connection.execute(SQL, [req.params.category_id], function (err, data) {
    if(err) {
    console.log("Error fetching data: ", err);
    res.status(404).send(err.sqlMessage);
    }
    else {
    res.render('categories/edit', {
    category_id:req.params.category_id,
    description:data[0].description,
    });
    }
    });
   });

app.put("/:category_id", function (req, res) {
    let showRow = function() {
    let SQL = "SELECT category_id, description FROM categories WHERE category_id = ?";
    app.connection.execute(SQL, [req.params.category_id], function (err, data) {
    if(err) {
    console.log("Error fetching data: ", err);
    res.status(404).send(err.sqlMessage);
    }
    else {
    res.render('categories/row', {
    category_id: data[0].category_id,
    description: data[0].description
    });
    }
    });
    };
    if( req.body.action == "update" ) {
    let SQL = "UPDATE categories SET description = ? WHERE category_id = ?";
    const description = req.body.description;
    const category_id = req.params.category_id;
    app.connection.execute(SQL, [description, category_id], function (err, data) {
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
