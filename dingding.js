var path = require("path");
var exec = require("child_process").exec;
var https = require("https");
var express = require("express");
var schedule = require("node-schedule");
var bodyParser = require('body-parser');
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: 'localhost',
    user: '***',
    password: '***',
    database: 'xxx'
});

connection.connect();

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/getAll", function(req, res) {
    connection.query("select * from dingding", function(error, results, fields) {
        if (error) throw error;
        res.send(results);
    });
});

app.get("/getOne", function(req, res) {
    var id = req.query.id;
    connection.query("select * from dingding where id = ?", [id], function(error, results, fields) {
        if (error) throw error;
        res.send(results);
    });
});

app.get("/del", function(req, res) {
    var id = req.query.id;
    connection.query("delete from dingding where id = ?", [id], function(error, results, fields) {
        if (error) throw error;
        if (results.affectedRows > 0) {
            res.send("删除成功");
            // restart();
        } else {
            res.send("删除失败");
        }
    });
});

app.post("/add", function(req, res) {
    var webhook = req.body.webhook;
    var content = req.body.content;
    var time = req.body.time;
    connection.query("insert into dingding(webhook, content, time) values (?, ?, ?)", [webhook, content, time], function(error, results, fields) {
        if (error) throw error;
        if (results.affectedRows > 0) {
            // restart();
        }
    });
    res.send("ok");
});

app.post("/edit", function(req, res) {
    var id = req.body.id;
    var webhook = req.body.webhook;
    var content = req.body.content;
    var time = req.body.time;
    connection.query("update dingding set webhook=?, content=?, time=? where id=?", [webhook, content, time, id], function(error, results, fields) {
        if (error) throw error;
        if (results.affectedRows > 0) {
            // restart();
        }
    });
    res.send("ok");
});

app.get("/restart", function(req, res) {
    restart(function() {
        res.send("重启服务成功");
    });
})

app.listen(5000);

function restart(cb) {
    exec("pm2 restart dingding", function(error, stdout, stderr) {
        if (error) throw error;
        if (cb) {
            cb();
        }
    });
}

function dingding(webhook, str) {
    var path = webhook.split("oapi.dingtalk.com")[1];
    var req = https.request({
        hostname: 'oapi.dingtalk.com',
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }, function(res) {
        var msg = "";
        res.on("data", function(chunk) {
            msg += chunk;
        }).on("end", function() {
            // console.log(msg);
        });
    });
    req.write(JSON.stringify({
        "msgtype": "text",
        "text": {
            "content": str + "\n"
        },
        "at": {
            "isAtAll": true
        }
    }));
    req.end();
}

function getDing(cb) {
    connection.query("select * from dingding", function(error, results, fields) {
        if (cb) {
            cb(results);
        }
    });
}

getDing(function(results) {
    results.forEach(function(result) {
        schedule.scheduleJob(result.time, function() {
            dingding(result.webhook, result.content);
        });
    });
});