const express = require("express");
const mysql = require("mysql");
const app = express();

var connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: "eu-cdbr-west-03.cleardb.net",
    user: "be23756c167112",
    password: "7945adca",
    database: "heroku_3908382df0ddf57",
  }); // Recreate the connection, since
  // the old one cannot be reused.

  connection.connect(function (err) {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  connection.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Connection to the MySQL server is usually
      handleDisconnect(); // lost due to either server restart, or a
    } else {
      // connnection idle timeout (the wait_timeout
      console.log("connection error");
      res.send(err);
      throw err; // server variable configures this)
    }
  });
  console.log("Connect successful!!");
}

const bodyParser = require("body-parser");
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var cors = require("cors");
app.use(cors());
handleDisconnect();

app.get("/", (req, res) => {
  res.send("Server is ready");
  console.log("start");
});

app.get("/room-list", function (req, res) {
  connection.query("SELECT * FROM room_type ", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

app.get("/new-get", function (req, res) {
  console.log(req.query);
  let sql = `INSERT INTO room_type(id, room_type_name) VALUES (?)`;
  let values = [req.query.id, req.query.room_type_name];
  connection.query(sql, [values], function (err, data, fields) {
    if (err) {
      console.log("newGetError");
      res.send(err);
      //   throw err;
    } else {
      res.json({
        status: 200,
        message: "New user added successfully",
      });
    }
  });
});

app.post("/list-post", function (req, res) {
  const sql =
    "SELECT room_record.*, room_type.room_type_name FROM room_record LEFT JOIN room_type on room_record.room_id = room_type.id  where room_id=" +
    req.body.room_type_id +
    " AND date='" +
    req.body.date +
    "'";
  console.log(sql);
  connection.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
  console.log(req.body);
  console.log("getPost");
});

app.listen(3000, () => {
  console.log("server run at ... :3000");
});
