const express = require("express");
let app = express();

app.use(express.static("public"));


app.set("view engine", "ejs");

app.get("/cv", (req, res) => {
  res.render('cv'); 
});

app.get("/j", (req, res) => { 
  res.render('website');
});

app.listen(2000, () => {
  console.log("Server started at localhost:2000"); 
});
