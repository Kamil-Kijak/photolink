
const fs = require("fs");
const http = require("http")
const mysql = require("mysql2");
const express = require("express");
const path = require("path")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const {Server} = require("socket.io");
const dateFormatter = require("date-fns");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
require("dotenv").config();

app.use(express.json());
app.use(cookieParser())

const PORT = process.env.PORT || 3000;

const avatarStorage = multer.diskStorage({
    destination:(req, file, cd) => {
        cd(null, path.join(`uploads`, `${req.body.user}`, `avatar`))
    },
    filename:(req, file, cd) => {
        const files = fs.readdirSync(path.join(`uploads`, `${req.body.user}`, `avatar`));
        if(files.length > 0) {
            const maxValue = files.reduce((max, current) => (current > max ? current : max), files[0]);
            cd(null,  `${maxValue}` + path.extname(file.originalname))
        } else {
            cd(null, `${0}` + path.extname(file.originalname))
        }
    }
});
const postStorage = multer.diskStorage({
    destination:(req, file, cd) => {
        cd(null, path.join(`uploads`, `${req.body.user}`, `posts`))
    },
    filename:(req, file, cd) => {
        const files = fs.readdirSync(path.join(`uploads`, `${req.body.user}`, `posts`));
        if(files.length > 0) {
            const maxValue = files.reduce((max, current) => (current > max ? current : max), files[0]);
            cd(null, `${maxValue}` + path.extname(file.originalname))
        } else {
            cd(null, `${0}` + path.extname(file.originalname))
        }
    }
})

const postUpload = multer({storage:postStorage});
const avatarUpload = multer({storage:avatarStorage});

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

const check_access = (req, res, next) => {
    const accessToken = req.cookies.access_jwt;
    const refreshToken = req.cookies.refresh_jwt;
    if(!refreshToken || !accessToken) {
        res.status(403).json({
            success:false,
            message:"Access denied! This resource is protected"
        });
        return;
    }
    try {
        const accessData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY)
        req.user = accessData.ID;
        next();
    } catch(err) {
        try {
            const data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
            res.cookie("access_jwt", jwt.sign(data, process.env.ACCESS_TOKEN_KEY, {
                expiresIn:"1h"
            }), {
                httpOnly:true,
                secure:true,
                maxAge: 3600000
            })
            req.user = data.ID;
            next();
        } catch (err) {
            res.status(403).json({
                success:false,
                message:"Access denied! This resource is protected"
            });
        }
    }
}

const connectedSockets = {};

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        for(const userID in connectedSockets) {
            if(connectedSockets[userID] === socket) {
                delete connectedSockets[userID];
                console.log(userID, " User disconnected");
            }
        }
    })
    socket.on("register", (userID) => {
        connectedSockets[userID] = socket;
        console.log(userID, " User connected");
    })
})


app.post("/api/register_user", (req, res) => {
    const {name, surname, username, birthdate, country, email, password} = req.body;
    if(!name || !surname || !username || !birthdate || !country || !email || !password) {
        res.status(400).json({
            success:false,
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
                        success:true,
                        message:"success"
                    })
                })
            } else {
                res.status(409).json({
                    success:false,
                    message:"this username exist"
                })
            }
        })
        
    }
});
app.post("/api/login_user", (req, res) => {
    const {username, password} = req.body;
    if(!username || !password) {
        res.status(400).json({
            success:false,
            message:"not enough data: username, password"
        })
    } else {
        connection.query("select count(ID) as 'count' from users where username = ? ", [username], (err, result) => {
            if(err) throw err;
            if(result[0].count == 0) {
                res.status(404).json({
                    success:false,
                    message:"user not found"
                })
            } else {
                connection.query("select ID from users where username = ? and password = ? ",
                     [username, crypto.createHash('md5').update(password).digest('hex')], (err, result) => {
                        if(err) throw err;
                        if(result.length == 0) {
                            res.status(403).json({
                                success:false,
                                message:"wrong password"
                            })
                        } else {
                            // login user
                            const accessToken = jwt.sign({
                                ID:result[0].ID,
                            }, process.env.ACCESS_TOKEN_KEY, {
                                expiresIn:"1h"
                            });
                            const refreshToken = jwt.sign({
                                ID:result[0].ID
                            }, process.env.REFRESH_TOKEN_KEY, {
                                expiresIn:"7d"
                            });
                            res.cookie("access_jwt", accessToken, {
                                httpOnly:true,
                                secure:false,
                                maxAge: 3600000
                            })
                            res.cookie("refresh_jwt", refreshToken, {
                                httpOnly:true,
                                secure:false,
                                maxAge: 3600000 * 24 * 7
                            })
                            res.status(200).json({
                                success:true,
                                message:"logged",
                                ID:result[0].ID
                            })
                        }
                    
                });
            }
        })
    }
})
app.post("/api/create_post", [postUpload.array("photo"), check_access], (req, res) => {
    if(req.files) {
        res.status(400).json({
            success:false,
            message:"photo not uploaded"
        });
    } else {
        const files = req.files.map((file) => file.filename)
        const {title, text} = req.body;
        if(!title || !text) {
            res.status(400).json({
                success:false,
                message:"not enough data: title, text"
            });
        } else {
            const send_date = dateFormatter.format(new Date().toLocaleString(), 'yyyy-MM-dd HH:mm:ss');
            connection.query("insert into posts() values(NULL, ?, ?, ?, ?, 0)",
                 [req.user, send_date, title, text]);
            connection.query("select ID from posts where send_date = ? and ID_user = ? limit 1", [send_date, req.user], (err, result) => {
                if(err) throw err;
                files.forEach(element => {
                    connection.query("insert into postimages() values(NULL, ?, ?)", [result[0]["ID"], element]);
                });
            })
            res.status(200).json({
                success:true,
                message:"post added"
            });
        }
    }
});
app.get("/api/get_post_img/:user/:photo", check_access, (req, res) => {
    const {user, photo} = req.params;
    const uploadPath = path.join("uploads", user, "posts", `${photo}`);
    if(fs.existsSync(uploadPath)) {
        res.status(200).sendFile(uploadPath);
    } else {
        res.status(404).json({
            message:"file not found"
        });
    }
});
app.get("/api/get_avatar_img/:user/:photo", check_access, (req, res) => {
    const {user, photo} = req.params;
    const uploadPath = path.join("uploads", user, "avatar", `${photo}`);
    if(fs.existsSync(uploadPath)) {
        res.status(200).sendFile(uploadPath);
    } else {
        res.status(404).json({
            message:"file not found"
        });
    }
});

server.listen(PORT, () => {
    console.log("Server is listening on ", PORT);
})