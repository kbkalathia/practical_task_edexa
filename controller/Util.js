import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

class Util {
  constructor() {
    this.token = "";
  }

  getPaginatedResult = (results, pageNumber, itemsPerPage) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = results.slice(startIndex, endIndex);
    return paginatedResults;
  };

  requiresValidToken = async (req, res) => {
    if (
      !req.headers.authorization ||
      req.headers.authorization.indexOf("Bearer ") === -1
    ) {
      this.token = "";
      return;
    }
    this.token = req.headers.authorization.split(" ")[1];
    var response = await this.parseToken(this.token);
    if (this.token !== "" && response.success) {
      return true;
    } else {
      throw new Error();
    }
  };

  async parseToken(token) {
    if (token != "") {
      try {
        var decoded = jwt.verify(token, process.env.MYSQL_SECRET_KEY);
        var login_token = decoded.login_token;

        let sql = "select * from user where token = ?";
        connection.query(sql, [login_token], (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
            return;
          }

          if (result.length === 0) {
            res.status(401).json({ message: "Invalid token" });
            return;
          }

          if (result.length > 0) {
            return result[0];
          }
        });

        var usserDeviceRecords = await JetbroDB.select(
          "user_device",
          ["*"],
          "`token`= " + (await JetbroDB.escapedValue(login_token)),
          "",
          [],
          "",
          ""
        );
        if (
          usserDeviceRecords === undefined ||
          usserDeviceRecords.length === 0
        ) {
          return { success: false, error: { message: "Invalid token" } };
        }
        this.userDevice = usserDeviceRecords[0];
        if (this.userDevice.user_id > 0) {
          var records = await JetbroDB.select(
            "user",
            this.userColumns,
            "id =  " +
              (await JetbroDB.escapedValue(this.userDevice.user_id)) +
              " and active = 1",
            "create_date desc",
            this.userEncryptedColumns
          );
          if (records.length > 0) {
            this.isLoggedIn = true;
            this.user = records[0];
          } else {
            return { success: false, error: { message: "user blocked" } };
          }
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err };
        // err
      }
    }
    return { success: true };
  }

  generateUUID() {
    return uuidv4();
  }

  getEncryptedMobile = (mobile) => {
    bcrypt.hash(mobile, 10, (err, hashedMobileNumber) => {
      if (err) {
        console.log(err);
        return;
      }
      return hashedMobileNumber;
    });
  };

  getEncryptedEmail = (email) => {
    bcrypt.hash(email, 10, (err, hashedEmail) => {
      if (err) {
        console.log(err);
        return;
      }
      return hashedEmail;
    });
  };

  getEncryptedPassword = (password) => {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.log(err);
        return;
      }
      return hashedPassword;
    });
  };
}

const util = new Util();
export default util;
