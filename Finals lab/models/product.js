
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  isFeatured: { type: Boolean, default: false },
  image: { type: String, required: false },  // Store the image URL here
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;


