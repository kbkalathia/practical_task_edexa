import jwt from "jsonwebtoken";
import connection from "../db/config.js";
import util from "./Util.js";

class GenerateToken {
  constructor(req, res) {
    this.name = req.body.name;
    this.mobile = util.getEncryptedMobile(req.body.mobile);
    this.email = util.getEncryptedEmail(req.body.email);
    this.password = util.getEncryptedPassword(req.body.password);
    this.isEmployer = req.body.isEmployer;
    this.generateToken();
  }

  generateToken = async () => {
    try {
      //Check if mobile exist in DB
      var sql = "SELECT * FROM users WHERE mobile = ?";
      connection.query(sql, [this.mobile], (err, result) => {
        if (err) {
          console.log(err);
        }

        let uuid = util.generateUUID();
        let tokenKey = process.env.TOKEN_KEY;
        let token = jwt.sign(
          {
            login_token: uuid,
            app_name: process.env.APP_IDENTIFIER,
          },
          tokenKey
        );

        if (result.length == 0) {
          var query =
            "INSERT INTO users (name, mobile, email, password ,is_employer ,login_token) VALUES (?, ?, ?, ?, ?, ?)";
          var values = [this.name, mobile, email, password, isEmployer, token];

          connection.query(query, values, (err, results) => {
            if (err) {
              console.error("Error registering user:", err);
              res.status(500).json({ message: "Internal server error" });
              return;
            }

            res.status(201).json({ message: "User registered successfully" });
            return;
          });
        } else {
          let sql = "UPDATE users SET login_token = ? WHERE mobile = ?";
          connection.query(sql, [login_token, this.mobile], (err, result) => {
            if (err) {
              console.log(err);
            }
            res.status(200).json({ message: "Token generated successfully" });
            return;
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default (req, res) => {
  new GenerateToken(req, res);
};
