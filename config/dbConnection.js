require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((self) => {
    console.log(
      `You have successfully connected to the DB ${self.connection.name}`
    );
  })
  .catch((error) => {
    console.log(error);
  });