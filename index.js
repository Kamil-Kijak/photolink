
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
            forbidden:true,
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
                forbidden:true,
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
    socket.on("send-post", (userID, text_body) => {
        connection.query("select ID_user from followers where ID_user_follow = ?", [userID], (err, result) => {
            if(err) connectedSockets[userID].emit("send-post-return", {
                success:false,
                message:"error 500"
            })
            const send_date = dateFormatter.format(new Date().toLocaleString(), 'yyyy-MM-dd HH:mm:ss');
            result.forEach((element) => {
                connection.query("insert into notyfications() values(NULL, ?, ?, ?, ?, DEFAULT)", [element.ID_user, text_body, userID, send_date], (err, result) => {
                    if(err) connectedSockets[userID].emit("send-post-return", {
                        success:false,
                        message:"error 500"
                    })
                    connectedSockets[element.ID_user].emit("notification", {
                        text_body:text_body,
                        redirect:userID,
                        send_date:send_date
                    });
                })
            })
        })
    })
    socket.on("register", (userID) => {
        connectedSockets[userID] = socket;
        console.log(userID, " User connected");
    })
});

// users -------------------------------------------------------

app.get("/api/check_user_exist/:username", (req, res) => {
    const {username} = req.params;
    if(!username) {
        res.status(400).json({
            success:false,
            message:"not enough data: username"
        })
    } else {
        connection.query("select count(ID) as 'count' from users where username = ?", [username], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            if(result[0].count == 0) {
                res.status(200).json({
                    success:true,
                    message:"not exist"
                })
            } else {
                res.status(200).json({
                    success:false,
                    message:"exist",
                })
            }
        })
    }
})

app.post("/api/auto_login", check_access, (req, res) => {
    res.status(200).json({
        success:true,
        message:"access granted",
        ID:req.user
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
            if(error) res.status(500).json({ success:false, message:"database error"}); 
            if(result[0].count == 0) {
                // create new user
                connection.query("insert into users() values(NULL, ?, ?, ?, ?, ?, ?, ?, DEFAULT, NULL, NULL, DEFAULT, DEFAULT)",
                     [name, surname, username, birthdate, country, email, crypto.createHash('md5').update(password).digest('hex')], (err, result) => {
                    if(err) res.status(500).json({ success:false, message:"database error"}); 
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
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            if(result[0].count == 0) {
                res.status(404).json({
                    success:false,
                    message:"user not found"
                })
            } else {
                connection.query("select ID from users where username = ? and password = ? ",
                     [username, crypto.createHash('md5').update(password).digest('hex')], (err, result) => {
                        if(err) res.status(500).json({ success:false, message:"database error"}); 
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
app.post("/api/logout", check_access, (req, res) => {
    res.clearCookie("access_jwt");
    res.clearCookie("refresh_jwt");
    res.status(200).json({
        success:true,
        message:"logout"
    })
});

app.delete("/api/delete_user", check_access, (req, res) => {
    const {ID} = req.user;
    connection.query("delete from users where ID=?", [ID], (err, result) => {
        if (err) throw err;
        res.status(200).json({
            success:true,
            message:"deleted"
        })
    })
})

app.get("/api/get_user/:ID", check_access, (req, res) => {
    const {ID} = req.params;
    if(!ID) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID"
        })
    } else {
        connection.query("select ID, name, surname, username, birthdate, country, gender, profile_desc, profile_image, status, protected from users where ID = ?", [ID], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
        })
    }
});

app.post("/api/upload_avatar", [avatarUpload.single("photo"), check_access], (req, res) => {
    if(req.file) {
        res.status(400).json({
            success:false,
            message:"photo not uploaded"
        });
    } else {
        const file = req.file.filename;
        connection.query("update users set profile_image = ? where ID = ?", [file, req.user], (err, result) =>{
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"updated",
            })
        })
    }
})

app.post("/api/update_protected", check_access, (req, res) => {
    const {protected} = req.body;
    if(!protected) {
        res.status(400).send({
             success:false,
            message:"not enough data: protected"
        })
    } else {
        connection.query("update users set protected = ? where ID = ?", [protected, req.user], (req, res) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"updated",
            })
        })
    }
})
app.post("/api/update_desc", check_access, (req, res) => {
    const {desc} = req.body;
    if(!desc) {
        res.status(400).send({
             success:false,
            message:"not enough data: desc"
        })
    } else {
        connection.query("update users set protected = ? where ID = ?", [desc, req.user], (req, res) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"updated",
            })
        })
    }
})
app.post("/api/update_personal_data", check_access, (req, res) => {
    const {name, surname, birthdate, country, gender} = req.body;
    if(!name || !surname || !birthdate || !country || !gender) {
        res.status(400).send({
             success:false,
            message:"not enough data: name, surname, birthdate, country, gender"
        })
    } else {
        connection.query("update users set name = ?, surname = ?, birthdate = ?, country = ?, gender = ? where ID = ?", [name, surname, birthdate, country, gender, req.user], (req, res) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"updated",
            })
        })
    }
})

app.get("/api/get_searched_users/:search/:limit", check_access, (req, res) => {
    const {search, limit} = req.params;
    if(!search || !limit) {
        res.status(400).json({
            success:false,
            message:"not enough data: search, limit"
        });
    } else {
        connection.query("select u.ID u.username, u.name, u.surname, u.profile_image, u.status, u.gender from users u where u.username like ? or u.name like ? or u.surname like ? limit ?", [
            '%' + search + '%', '%' + search + '%', '%' + search + '%', limit
        ], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
        })
    }
})

// followers ------------------------------------------------------

app.get("/api/get_followers_count/:ID", check_access, (req, res) => {
    const {ID} = req.params;
    if(!ID) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID"
        })
    } else {
        connection.query("select count(ID) from followers where ID_user_follow = ?", [ID], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
        });
    }
});
app.get("/api/get_following_count/:ID", check_access, (req, res) => {c
    const {ID} = req.params;
    if(!ID) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID"
        })
    } else {
        connection.query("select count(ID) from followers where ID_user = ?", [ID], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
        })
    }
});

app.get("/api/get_following/:ID/:limit", check_access, (req, res) => {
    const {limit, ID} = req.params;
    if(!limit || !ID) {
        res.status(400).json({
            success:false,
            message:"not enough data: limit, ID"
        })
    } else {
        connection.query("select u.ID, u.username, u.status, u.profile_image from followers f inner join users u on u.ID=f.ID_user where f.ID_user = ? limit ?", [ID, limit], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
        })
    }
});

app.get("/api/get_followers/:ID/:limit", check_access, (req, res) => {
    const {limit, ID} = req.params;
    if(!ID || !limit) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID, limit"
        })
    } else {
        connection.query("select u.ID, u.username, u.status, u.profile_image from followers f inner join users u on u.ID=f.ID_user where f.ID_user_follow = ? limit ?", [ID, limit], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
        })
    }
});

app.get("/api/get_follow/:IDfollowed", check_access, (req, res) => {
    const {IDfollowed} = req.params;
    if(!IDfollowed) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID"
        })
    } else {
        connection.query("select count(ID) from followers where ID_user = ? and ID_user_follow = ?", [req.user, IDfollowed], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
        })
    }
});

app.post("/api/set_follow", check_access, (req, res) => {
    const {IDfollowed} = req.body;
    if(!IDfollowed) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID"
        })
    } else {
        connection.query("select count(ID) as 'count' from followers where where ID_user = ? and ID_user_follow = ?", [req.user, IDfollowed], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            if(result[0].count == 0) {
                connection.query("insert into followers() values(NULL, ?, ?)", [req.user, IDfollowed], (err, result) => {
                    if(err) res.status(500).json({ success:false, message:"database error"}); 
                    res.status(200).json({
                        success:true,
                        message:"set follow success",
                        data:result
                    })
                });
            } else {
                res.status(409).json({
                    success:false,
                    message:"inserted already"
                })
            }
        });
    }
})

app.delete("/api/delete_follow", check_access, (req, res) => {
    const {IDfollowed} = req.body;
    if(!IDfollowed) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID"
        })
    } else {
        connection.query("delete from followers where ID_user = ? and ID_user_follow = ?", [req.user, IDfollowed], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"deleted",
                data:result
            })
        });
    }
});

app.get("/api/get_active_followers", check_access, (req, res) => {
    connection.query("select u.username, u.status, u.ID, u.profile_image from followers f inner join users u on u.ID=f.ID_user where u.ID_user_follow = ? order by RAND() limit 15", [req.user], (err, result) => {
        if(err) res.status(500).json({ success:false, message:"database error"}); 
        res.status(200).json({
            success:true,
            message:"get success",
            data:result
        })
    })
})

// notifications

app.get("/api/get_new_notifications_count", check_access, (req, res) => {
    connection.query("select count(ID) as 'count' from notifications where ID_user = ?", [req.user], (err, result) => {
        if(err) res.status(500).json({ success:false, message:"database error"}); 
        res.status(200).json({
            success:true,
            message:"get success",
            data:result
        })
    })
})

app.get("/api/get_notifications/:limit", check_access, (req, res) => {
    const {limit} = req.params;
    if(!limit) {
        res.status(400).json({
            success:false,
            message:"not enough data: limit"
        })
    } else {
        connection.query("select text_body, redirect, send_date, saw from notifications where ID_user = ? limit ?", [req.user, limit], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 

            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
        })
    }
});

app.delete("/api/delete_all_notifications", check_access, (req, res) =>{
    connection.query("delete from notyfications where ID_user = ?", [req.user], (err, result) => {
        if(err) res.status(500).json({ success:false, message:"database error"}); 
        res.status(200).json({
            success:true,
            message:"deleted",
        })
    })
})

app.delete("/api/delete_notification", check_access, (req, res) =>{
    const {IDNotification} = req.body;
    if(!IDNotification) {
        res.status(400).json({
            success:false,
            message:"not enough data: IDNotification"
        })
    } else {
        connection.query("delete from notyfications where ID = ?", [IDNotification], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"deleted",
            })
        })
    }
})


// posts ------------------------------------------------------

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
                if(err) res.status(500).json({ success:false, message:"database error"}); 
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

app.delete("/api/delete_post", check_access, (req, res) => {
    const {ID} = req.body;
    if(!ID) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID"
        });
    } else {
        connection.query("delete from posts where ID=?", [ID], (err, result) => {
            if (err) throw err;
            res.status(200).json({
                success:true,
                message:"deleted"
            })
        })
    }
});

app.get("/api/get_user_posts/:ID/:limit", check_access, (req, res) => {
    const {ID, limit} = req.params;
    if(!ID || !limit) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID, limit"
        });
    } else {
        connection.query("select from user u inner join posts p on p.ID_user=u.ID inner join postimages i on i.ID_post=p.ID where u.protected = 0 and u.ID = ? order by p.send_date desc limit ?", [ID, limit], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
                res.status(200).json({
                    success:true,
                    message:"get success",
                    data:result
                })
        })
    }
})

app.get("/api/get_my_posts", check_access, (req, res) => {
    connection.query("select p.send_date, p.title, p.text_body, p.edited, p.ID as 'postID', u.ID as 'userID', u.username, u.profile_image, u.status from user u inner join posts p on p.ID_user=u.ID where u.ID = ? order by p.send_date desc limit ?", [req.user, limit], (err, result) => {
        if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
    })
});

app.get("/api/get_for_you_posts/:limit", check_access, (req, res) => {
    const {limit} = req.params;
    if(!limit) {
        res.status(400).json({
            success:false,
            message:"not enough data: limit"
        });
    } else {
        connection.query("SELECT p.send_date, p.title, p.text_body, p.edited, p.ID as 'postID', u.ID as 'userID', u.username, u.profile_image, u.status FROM posts p INNER JOIN users u on u.ID=p.ID_user INNER JOIN followers f on f.ID_user_follow=p.ID_user WHERE p.ID_user = ? ORDER BY p.send_date DESC LIMIT ?",
             [req.user, limit], (err, result) => {
                if(err) res.status(500).json({ success:false, message:"database error"}); 
                res.status(200).json({
                    success:true,
                    message:"get success",
                    data:result
                })
             })

    }
});

app.get("/api/get_searched_posts/:search/:limit", check_access, (req, res) => {
    const {search, limit} = req.params;
    if(!search || !limit) {
        res.status(400).json({
            success:false,
            message:"not enough data: search, limit"
        });
    } else {
        connection.query("SELECT p.send_date, p.title, p.text_body, p.edited, p.ID as 'postID', u.ID as 'userID', u.username, u.profile_image, u.status FROM posts p INNER JOIN users u on u.ID=p.ID_user INNER JOIN followers f on f.ID_user_follow=p.ID_user WHERE u.protected = 0 and p.title LIKE ? LIMIT ?",
             ["%" + search + "%", limit], (err, result) => {
                if(err) res.status(500).json({ success:false, message:"database error"}); 
                res.status(200).json({
                    success:true,
                    message:"get success",
                    data:result
                })
             })
    }
})

// postimages ----------------------------------------------------

app.get("/api/get_post_images/:IDPost", check_access, (req, res) => {
    const {IDPost} = req.params;
    if(!IDPost) {
        res.status(400).json({
            success:false,
            message:"not enough data: IDPost"
        });
    } else {
        connection.query("select img from postimages where ID_post = ?", [IDPost], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            })
        })
    }
})


// comments ------------------------------------------------------

app.post("/api/create_comment", check_access, (req, res) => {
    const {postID, text_body} = req.body;
    if(!postID || !text_body) {
        res.status(400).json({
            success:false,
            message:"not enough data: postID, text_body"
        });
    } else {
        const send_date = dateFormatter.format(new Date().toLocaleString(), 'yyyy-MM-dd HH:mm:ss');
        connection.query("insert into comments() values(NULL, ?, ?, ?, ?, DEFAULT)", [req.user, postID, send_date, text_body], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"created new comment"
            });
        })
    }
});
app.delete("/api/delete_comment", check_access, (req, res) => {
    const {ID} = req.body;
    if(!ID) {
        res.status(400).json({
            success:false,
            message:"not enough data: ID"
        });
    } else {
        connection.query("delete from comments where ID=?", [ID], (err, result) => {
            if (err) throw err;
            res.status(200).json({
                success:true,
                message:"deleted"
            })
        })
    }
});
app.post("/api/edit_comment", check_access, (req, res) => {
    const {commentID, text_body} = req.body;
    if(!commentID || !text_body) {
        res.status(400).json({
            success:false,
            message:"not enough data: commentID, text_body"
        });
    } else {
        const send_date = dateFormatter.format(new Date().toLocaleString(), 'yyyy-MM-dd HH:mm:ss');
        connection.query("update comments set send_date = ?, text_body = ?, edited=1 where ID = ?", [send_date, text_body, commentID], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"edited comment"
            });
        })
    }
})

app.get("/api/get_comment/:commentID", check_access, (req, res) => {
    const {commentID} = req.params;
    if(!commentID) {
        res.status(400).json({
            success:false,
            message:"not enough data: commentID"
        });
    } else {
        connection.query("select text_body from comments where ID=?", [commentID], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            });
        })
    }
});

app.get("/api/get_comments/:postID/:limit", check_access, (req, res) => {
    const {postID, limit} = req.params
    if(!postID || !limit) {
        res.status(400).json({
            success:false,
            message:"not enough data: postID, limit"
        });
    } else {
        connection.query("select c.ID, c.send_date, c.text_body, c.edited, u.username, u.status, u.profile_image, u.ID as 'user_ID' from comments c inner join users u on u.ID=c.ID_user where c.ID_post order by c.send_date desc limit ?", [postID, limit], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            });
        })
    }
});

// like --------------------------------------------------------------

app.post("/api/set_like", check_access, (req, res) => {
    const {postID} = req.body;
    if(!postID) {
        res.status(400).json({
            success:false,
            message:"not enough data: postID"
        });
    } else {
        connection.query("select count(ID) as 'count' from likes where where ID_user = ? and ID_post = ?", [req.user, postID], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            if(result[0].count == 0) {
                connection.query("insert into likes() values(NULL, ?, ?)", [req.user, postID], (err, result) => {
                    if(err) res.status(500).json({ success:false, message:"database error"}); 
                    res.status(200).json({
                        success:true,
                        message:"created like",
                    });
                })
            } else {
                res.status(409).json({
                    success:false,
                    message:"inserted already"
                })
            }
        })
    }
});

app.delete("/api/delete_like", check_access, (req, res) => {
    const {postID} = req.body;
    if(!postID) {
        res.status(400).json({
            success:false,
            message:"not enough data: postID"
        });
    } else {
        connection.query("delete from likes where ID_post = ? and ID_user = ?", [postID, req.user], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"deleted like",
            });
        })
    }
});

app.post("/api/get_like", check_access, (req, res) => {
    const {IDpost} = req.body;
    if(!IDpost) {
        res.status(400).json({
            success:false,
            message:"not enough data: IDpost"
        });
    } else {
        connection.query("select ID from likes where ID_post = ? and ID_user = ?", [IDpost, req.user], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:true,
                message:"get success",
                data:result
            });
        })
    }
});

app.get("/api/get_likes_count/:IDPost", check_access, (req, res) => {
    const {IDPost} = req.params;
    if(!IDPost) {
        res.status(400).json({
            success:false,
            message:"not enough data: IDpost"
        });
    } else {
        connection.query("select count(ID) as 'count' from likes where ID_post = ?", [IDPost], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:false,
                message:"get success",
                data:result
            });
        })
    }

})

app.get("/api/get_likes/:IDPost/:limit", check_access, (req, res) => {
    const {IDPost, limit} = req.params;
    if(!IDPost || !limit) {
        res.status(400).json({
            success:false,
            message:"not enough data: IDpost, limit"
        });
    } else {
        connection.query("select u.ID, u.username, u.profile_image, u.status from likes l inner join users u on u.ID=l.ID_user where ID_post = ? order by u.username limit ?", [IDPost, limit], (err, result) => {
            if(err) res.status(500).json({ success:false, message:"database error"}); 
            res.status(200).json({
                success:false,
                message:"get success",
                data:result
            });
        })
    }

})

// get a photo -------------------------------------------------------

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