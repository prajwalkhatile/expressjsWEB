const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Here i have created a schema for our document

const userScema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },

  gender: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  tokens: [
    {
      token: {
        type: String,
        require: true,
      },
    },
  ],
});

// the following part is for hashing the user password using the npm package bcrypt
userScema.pre("save", async function (next) {
  if (this.isModified("password")) {
    console.log(`Password before hasing is ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(`password after hashing is ${this.password}`);
  }

  next();
});

userScema.methods.generateAuthToken = async function () {
  try {
    console.log(this._id);
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    // console.log(token);
    return token;
  } catch (error) {
    res.send("the error part" + error);
    console.log("the error part" + error);
  }
};

// Here we are going to create the collection of our registeration form

const Register = new mongoose.model("Register", userScema);
module.exports = Register;
