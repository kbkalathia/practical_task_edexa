import mysql from "mysql";

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "edexa",
});

connection.connect(function (err) {
  if (err) {
    // console.error(err);
  }

  // console.log("Connected");
});

export default connection;
