
const mysql = require("mysql2");
const express = require("express");
const path = require("path")
const crypto = require("crypto");

const app = express();

require("dotenv").config();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"photolink"
})

connection.connect((err) => {
    if(err) {
        console.error("database error", err.message);
        return;
    }
    console.log("database connected")
})

if(process.env.DEV == "false") {
    app.use(express.static(path.join(__dirname, "app", "dist")))
}

app.post("/api/register_user", (req, res) => {
    const {name, surname, username, birthdate, country, email, password} = req.body;
    if(!name || !surname || !username || !birthdate || !country || !email || !password) {
        res.status(400).json({
            message:"not enough data: name, surname, username, birthdate, country, email, password"
        })
    } else {
        connection.query("select count(ID) as 'count' from users where username = ?", [username], (error, result) => {
            if(error) throw error;
            if(result[0].count == 0) {
                // create new user
                connection.query("insert into users() values(NULL, ?, ?, ?, ?, ?, ?, ?, DEFAULT, NULL, NULL, DEFAULT)",
                     [name, surname, username, birthdate, country, email, crypto.createHash('md5').update(password).digest('hex')], (err, result) => {
                    if(err) throw err;
                    res.status(200).json({
                        message:"success"
                    })
                })
            } else {
                res.status(409).json({
                    message:"this username exist"
                })
            }
        })
        
    }
})

app.listen(PORT, () => {
    console.log("Server is listening on ", PORT);
})