const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/userDb1", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Your connection to database is successfull......");
  })
  .catch((e) => {
    console.log("Error to connecting the server");
  });
