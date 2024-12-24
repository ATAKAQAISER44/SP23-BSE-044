const express = require("express");
const Wishlist = require('../../models/wishlist');
const Product = require('../../models/product');
const { authenticateAccessToken } = require('../../middleware/auth');

const router = express.Router();

// Add to wishlist
router.post("/add-to-wishlist/:productId", authenticateAccessToken, async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("/products");
    }

    // Check if the product is already in the wishlist for this user
    const existingWishlistItem = await Wishlist.findOne({ userId, productId });
    if (existingWishlistItem) {
      req.flash("info", `${product.title} is already in your wishlist.`);
      return res.redirect("/wishlistview");
    }

    // Add the product to the wishlist
    const newWishlistItem = new Wishlist({ userId, productId });
    await newWishlistItem.save();

    req.flash("success", `${product.title} added to wishlist.`);
    res.redirect("/wishlistview");
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    req.flash("error", "There was an error adding the product to the wishlist.");
    res.redirect("/products");
  }
});

// View wishlist
router.get("/wishlistview", authenticateAccessToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const wishlistItems = await Wishlist.find({ userId }).populate('productId');
    const formattedWishlist = wishlistItems.map(item => ({
      productId: item.productId._id,
      title: item.productId.title,
      price: item.productId.price,
      image: item.productId.image,
    }));

    res.render("wish/wish", { wishlist: formattedWishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    req.flash("error", "Could not fetch wishlist.");
    res.redirect("/products");
  }
});

// Remove item from wishlist
router.get("/wishlist/remove/:productId", authenticateAccessToken, async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  try {
    const result = await Wishlist.findOneAndDelete({ userId, productId });
    if (result) {
      req.flash("success", "Item removed from wishlist.");
    } else {
      req.flash("error", "Item not found in your wishlist.");
    }
    res.redirect("/wishlistview");
  } catch (error) {
    console.error("Error removing item from wishlist:", error);
    req.flash("error", "Could not remove item from wishlist.");
    res.redirect("/wishlistview");
  }
});

module.exports = router;
