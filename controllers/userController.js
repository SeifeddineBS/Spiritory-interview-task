const fs = require("fs");
const idAutoIncrement = require("id-auto-increment");
const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.create = async (req, res) => {
  const fileName = "users.json";
  const file = fs.readFileSync(fileName);

  if (!req.body) {
    res.status(404).send({ message: "Content can not be empty!" });
    return;
  }

  //check if file exist
  if (!fs.existsSync(fileName)) {
    //create new file if not exist
    fs.closeSync(fs.openSync(fileName, "w"));
  }

  // read file
  var user = new User();

  user = req.body;
  // auto increment id

  user.id = await idAutoIncrement(); // await syntax

  // hashed password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // Created at
  user.created_at = new Date();

  //check if file is empty
  if (file.length === 0) {
    //add data to json file
    fs.writeFileSync(fileName, JSON.stringify([user]));
    res
      .status(201)
      .send({ message: "File created and User added successfully" });
  } else {
    //append data to jso file
    const json = JSON.parse(file.toString());
    for (let element of json) {
      var exist = element.email === user.email ? true : false;

      if (exist) {
        break;
      }
    }

    //add json element to json object
    if (exist) res.status(400).send({ res: "email exisit already" });
    else {
      json.push(user);
      fs.writeFileSync(fileName, JSON.stringify(json));
      res.status(201).send({ message: "User added successfully " });
    }
  }
};