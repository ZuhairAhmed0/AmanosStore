const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(process.env.ATLAS_URI).catch((err) => {
    console.log("connection error: " + err.message);
    mongoose;
    process.exit(1);
  });

  const db = mongoose.connection;

  // CONNECTION EVENTS
  // When successfully connected
  db.on("connected", function () {
    console.log("Mongoose connection open to " + db.host);
  });

  // If the connection throws an error
  db.on("error", function (err) {
    console.log("Mongoose connection error: " + err.message);
  });

  // When the connection is disconnected
  db.on("disconnected", function () {
    console.log("Mongoose connection disconnected");
  });

  // When the connection is reconnected
  db.on("reconnected", function () {
    console.log("Mongoose connection reconnected");
  });
  // If the Node process ends, close the Mongoose connection
  process.on("SIGINT", function () {
    db.close();
    console.log("Mongoose connection disconnected through app termination");
    process.exit(0);
  });
};

module.exports = connectDB;
