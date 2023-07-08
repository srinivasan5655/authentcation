const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config()

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post")

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(authRoutes);
app.use(postRoutes)

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    process.env.DATABASE_URL
  )
  .then((res) => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(
        `Example app listening at http://localhost:${process.env.PORT || 8080}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
