
const Product = require('../../models/product');
const mongoose = require('mongoose');
const express = require("express");
const Order = require('../../models/Order');

const { authenticateAccessToken } = require('../../middleware/auth');
let router = express.Router();

// Add to whislist
router.post("/add-to-wishlist/:productId", authenticateAccessToken, async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user.id; // Assuming `authenticateAccessToken` sets `req.user`
  
    try {
      const product = await Product.findById(productId);
      if (!product) {
        req.flash("error", "Product not found.");
        return res.redirect("/products");
      }
  
      // Initialize the wishlist if it doesn't exist
      if (!req.session.wishlist) {
        req.session.wishlist = [];
      }
  
      // Check if the product is already in the wishlist for this user
      const productInWishlistIndex = req.session.wishlist.findIndex(
        item => item.productId.toString() === product._id.toString() && item.userId === userId
      );
  
      if (productInWishlistIndex >= 0) {
        req.flash("info", `${product.title} is already in your wishlist.`);
      } else {
        // Add the product to the wishlist
        req.session.wishlist.push({
          userId: userId, // Store the user ID with the wishlist item
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.image,
        });
  
        req.flash("success", `${product.title} added to wishlist.`);
      }
  
      // Save the updated session
      req.session.save(err => {
        if (err) {
          console.error("Error saving session:", err);
          req.flash("error", "Could not update wishlist.");
          return res.redirect("/products");
        }
  
        res.redirect("/wishlistview");
      });
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
      req.flash("error", "There was an error adding the product to the wishlist.");
      res.redirect("/products");
    }
  });
  


  // Remove item from wishlist
router.get("/wishlist/remove/:productId", authenticateAccessToken, (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id; // Get the authenticated user's ID

  // Find the index of the item in the wishlist for this user
  const index = req.session.wishlist.findIndex(
    item => item.productId.toString() === productId && item.userId === userId
  );

  if (index !== -1) {
    // Remove the item from the wishlist
    req.session.wishlist.splice(index, 1);

    req.session.save(err => {
      if (err) {
        console.error("Error saving session:", err);
        req.flash("error", "Could not update wishlist.");
        return res.redirect("/wishlistview");
      }

      req.flash("success", "Item removed from wishlist.");
      res.redirect("/wishlistview"); // Redirect back to the wishlist page after removing the item
    });
  } else {
    req.flash("error", "Item not found in your wishlist.");
    res.redirect("/wishlistview");
  }
});


module.exports = router;