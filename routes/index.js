import express from "express";
import util from "../controller/Util.js";
import connection from "../db/config.js";
import generateToken from "../controller/GenerateToken.js";
var indexRouter = express.Router();

/* GET home page. */
indexRouter.get("/", function (req, res, next) {
  res.send("Welcome");
});

indexRouter.post("/generate-token", generateToken);

indexRouter.use(async (req, res, next) => {
  if (await util.requiresValidToken(req,res)) {
    next();
  }
});

indexRouter.post("/signup", (req, res) => {
  let name = req.body.name;
  let mobile = util.getEncryptedMobile(req.body.mobile);
  let email = util.getEncryptedEmail(req.body.email);
  let password = util.getEncryptedPassword(req.body.password);
  let isEmployer = req.body.isEmployer;

  var query =
    "INSERT INTO users (name, mobile, email, password ,is_employer) VALUES (?, ?, ?, ?, ?)";
  var values = [name, mobile, email, password, isEmployer];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    res.status(201).json({ message: "User registered successfully" });
    return;
  });
});

indexRouter.post("/login", (req, res) => {
  let mobile = util.getEncryptedMobile(req.body.mobile);
  let password = util.getEncryptedPassword(req.body.password);

  // Check if user exist in the database
  var sql = "SELECT * FROM users WHERE mobile = ?";
  connection.query(sql, [mobile], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    if (result.length === 0) {
      res.status(401).json({ message: "Mobile not exist in DB" });
      return;
    }
  });

  // Now Mobile Exist in DB
  // Check if Password is correct or not
  sql = "SELECT * FROM users WHERE mobile = ? AND password = ?";

  connection.query(sql, [mobile, password], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    if (result.length === 0) {
      res.status(401).json({ message: "Mobile not exist in DB" });
      return;
    }
  });

  res.send("User Logged In");
  return;
});

indexRouter.post("/search", (req, res) => {
  let keyword = req.body.keyword;
  let pageNumber = req.body.pageNumber;

  var sql =
    "SELECT * FROM jobs WHERE title like ? or location like ? or criteria like ?";
  connection.query(sql, [keyword, keyword, keyword], (err, result) => {
    if (err) {
      console.error("Error Searching Job:", err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    if (result.length === 0) {
      res.status(401).json({ message: "Such Job not exist" });
      return;
    }

    return util.getPaginatedResult(result, pageNumber);
  });
});

indexRouter.post("/post-job", (req, res) => {
  let title = req.body.title;
  let location = req.body.location;
  let criteria = req.body.criteria;
  let token = "";

  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Bearer ") === -1
  ) {
    token = "";
    return;
  }
  token = this.req.headers.authorization.split(" ")[1];

  // Get user Data and user id based on the token which is set in the order
  let user = util.parseToken();
  let isUserEmployer = 0;

  if (user.length > 0) {
    isUserEmployer = user[0].is_employer;
  }

  if (isUserEmployer > 0) {
    var query =
      "INSERT INTO users (user_id, title, location, criteria ) VALUES (?, ?, ?, ?)";
    var values = [1, title, location, criteria];

    connection.query(query, [values], (err, result) => {
      if (err) {
        console.error("Error Posting Job:", err);
        res.status(500).json({ message: "Internal server error" });
        return;
      }

      res.status(201).json({ message: "Job Posted successfully" });
      return;
    });

    res
      .status(201)
      .json({ message: "User is not Employer , So they can't post the Job" });
    return;
  }
});

indexRouter.post("view-jobs", (req, res) => {
  // Get User id based on the token recieved in the request Header
});

export default indexRouter;
