const express = require("express");
const app = express();
var expressLayouts = require("express-ejs-layouts");

const PORT = 4000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(expressLayouts);

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
});
