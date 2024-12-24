
const Product = require('../../models/product');
const mongoose = require('mongoose');
const express = require("express");
const Order = require('../../models/Order');

const { checkAdminAccess, authenticateAccessToken } = require('../../middleware/auth');
let router = express.Router();

// Add to Cart Route
// router.post("/add-to-cart/:productId", authenticateAccessToken, async (req, res) => {
//   const productId = req.params.productId;
//   const userId = req.user.id; // Get the authenticated user's ID

//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       req.flash("error", "Product not found.");
//       return res.redirect("/products");
//     }

//     // Initialize the cart if it doesn't exist
//     if (!req.session.cart) {
//       req.session.cart = [];
//     }

//     // Check if the product is already in the cart for this user
//     const productInCart = req.session.cart.find(item => item.productId.toString() === product._id.toString() && item.userId === userId);

//     if (productInCart) {
//       productInCart.quantity += 1; // Increment quantity if already in the cart
//     } else {
//       req.session.cart.push({
//         userId: userId, // Store the user ID with the cart item
//         productId: product._id,
//         title: product.title,
//         price: product.price,
//         quantity: 1,
//         image: product.image,
//       });
//     }

//     // Redirect to cart view with a success message
//     req.flash("success", `${product.title} added to cart.`);
//     res.redirect("/cart/cartview");
//   } catch (error) {
//     console.error("Error adding product to cart:", error);
//     req.flash("error", "There was an error adding the product to the cart.");
//     res.redirect("/products");
//   }
// });

router.post("/add-to-cart/:productId", authenticateAccessToken, async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id; // Get the authenticated user's ID

  try {
    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("/products");
    }

    // Initialize the cart if it doesn't exist
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Check if the product is already in the cart for this user
    const productInCartIndex = req.session.cart.findIndex(
      item => item.productId.toString() === product._id.toString() && item.userId === userId
    );

    if (productInCartIndex >= 0) {
      // Increment quantity if already in the cart
      req.session.cart[productInCartIndex].quantity += 1;
    } else {
      // Add the product to the cart
      req.session.cart.push({
        userId: userId, // Store the user ID with the cart item
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    }

    // Save the updated session
    req.session.save(err => {
      if (err) {
        console.error("Error saving session:", err);
        req.flash("error", "Could not update cart.");
        return res.redirect("/products");
      }

      req.flash("success", `${product.title} added to cart.`);
      res.redirect("/cart/cartview");
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    req.flash("error", "There was an error adding the product to the cart.");
    res.redirect("/products");
  }
});



//remove item from cart

router.get("/cart/remove/:productId", authenticateAccessToken, (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id; // Get the authenticated user's ID

  // Find the index of the item in the cart for this user
  const index = req.session.cart.findIndex(item => item.productId.toString() === productId && item.userId === userId);

  if (index !== -1) {
    // Remove the item from the cart
    req.session.cart.splice(index, 1);
  }

  res.redirect("/cart/cartview"); // Redirect back to cart page after removing the item
});

// update cart quantity
router.post("/cart/update/:productId", authenticateAccessToken, (req, res) => {
  const productId = req.params.productId;
  const { quantity } = req.body;
  const userId = req.user.id; // Get the authenticated user's ID

  if (quantity <= 0) {
    return res.redirect("/cart/cartview"); // Invalid quantity, redirect back to cart
  }

  // Find the product in the cart for this user
  const productInCart = req.session.cart.find(item => item.productId.toString() === productId && item.userId === userId);

  if (productInCart) {
    // Update the quantity
    productInCart.quantity = quantity;
  }

  res.redirect("/cart/cartview"); // Redirect to cart page after updating
});


// Checkout route
router.get("/checkout", (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect("/cart/cartview"); // Redirect to cart if no items in the cart
    }
  
    // Calculate total cost
    const total = req.session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
    // Render checkout page
    res.render("cart/checkout", { 
      layout: "layout", 
      cart: req.session.cart, 
      total 
    });
  });

  // Checkout Success Route
router.get("/checkout/success", (req, res) => {
  // Optionally, you can pass some success data to the view
  res.render("cart/success", { layout: "layout" });
});


  
//   // Handle checkout submission
// router.post("/checkout/submit", async (req, res) => {
//     if (!req.session.cart || req.session.cart.length === 0) {
//         return res.redirect("/cart/cartview"); // Redirect to cart if no items
//     }
  
//     const { name, address, email, phone } = req.body;
  
//     // You can create an order object here (e.g., saving the order in a database)
//     // For simplicity, we're just logging it for now
//     const order = {
//         customer: { name, address, email, phone },
//         items: req.session.cart,
//         total: req.session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
//         status: 'Pending', // You can update the order status as needed
//     };
  
//     console.log("Order Received:", order);
  
//     // Clear the cart after checkout
//     req.session.cart = [];
  
//     // You can now process payment (e.g., integrating with a payment gateway)
//     // For now, we'll just redirect to an order confirmation page
  
//     req.flash('success', 'Your order has been placed successfully!');
//     res.redirect("/checkout/success");
//   });
  
//   // Order success page
//   router.get("/checkout/success", (req, res) => {
//     res.render("cart/success", { layout: "layout" });
//   });
  
router.post("/checkout/submit", authenticateAccessToken, async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
      return res.redirect("/cart/cartview"); // Redirect to cart if no items
  }

  const { name, address, email, phone } = req.body;
  
  // Get the userId from the session or other means (e.g., decoded JWT token)
  const userId = req.user.id; // Assuming the user is logged in and their ID is stored in session or decoded JWT

  // Calculate the total amount based on the cart items
  const totalAmount = req.session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Create an order object
  const newOrder = new Order({
      user_id: userId,  // Pass the user_id from session or JWT
      items: req.session.cart.map(item => ({
          product_id: item.productId,  // Use productId from cart
          quantity: item.quantity
      })),
      total_amount: totalAmount,  // Correct field name for total
      payment_method: 'cash_on_delivery', // Default payment method
      status: 'Pending', // Default status
      address: address,  // Address passed from the form
      created_at: new Date()
  });

  try {
      // Save the order to the database
      await newOrder.save();

      // Clear the cart after successful order placement
      req.session.cart = [];

      // Flash a success message and redirect to the order confirmation page
      req.flash('success', 'Your order has been placed successfully!');
      res.redirect("/checkout/success");
  } catch (err) {
      console.error('Error placing order:', err);
      req.flash('error', 'There was an issue placing your order. Please try again!');
      res.redirect("/cart/cartview");
  }
});



module.exports = router;