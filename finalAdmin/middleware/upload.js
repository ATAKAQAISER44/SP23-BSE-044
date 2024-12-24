// const multer = require('multer');

// // Multer storage configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public/images'); // Destination folder for uploaded files
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname); // Use original file name for storage
//     }
// });

// // File upload middleware
// const upload = multer({ storage: storage });

// module.exports = upload;







// router.get('/profile', authenticateToken, async (req, res) => {
//     try {
//         const admin = await Admin.findById(req.admin.id).select('-password');
//         if (!admin) {
//             return res.status(404).send('Admin not found');
//         }
//         res.render('profile/profile', { admin }); // Corrected path
//     } catch (error) {
//         console.error('Error fetching admin:', error);
//         res.status(500).send('Server error');
//     }
// });

// // POST route to handle profile updates
// router.post('/profile', authenticateToken, upload.single('picture'), async (req, res) => {
//     try {
//         const { name, bio } = req.body;
//         const picture = req.file ? '/images/' + req.file.filename : null; // Construct path to store in database

//         // Find the admin by ID and update the fields
//         const updatedFields = { name, bio };
//         if (picture) {
//             updatedFields.picture = picture;
//         }

//         const admin = await Admin.findByIdAndUpdate(req.admin.id, updatedFields, { new: true });

//         if (!admin) {
//             return res.status(404).send('Admin not found');
//         }

//         res.render('profile/profile', { admin, successMessage: 'Profile updated successfully' }); // Corrected path
//     } catch (error) {
//         console.error('Error updating admin profile:', error);
//         res.status(500).send('Server error');
//     }
// });

// router.get('/dashboard', authenticateToken, async (req, res) => {
//     try {
//         const admin = await Admin.findById(req.admin.id).select('-password');
//         if (!admin) {
//             return res.status(404).send('Admin not found');
//         }
//         res.render('admin/dashboard', { admin }); // Corrected path
//     } catch (error) {
//         console.error('Error fetching admin:', error);
//         res.status(500).send('Server error');
//     }
// });
// // Funtion to handle add to carts 
// router.post("/add-to-cart/:productId", async (req, res) => {
//   const productId = req.params.productId;

//   try {
//       // Fetch the product from the database by its ID
//       let product = await Product.findById(productId);

//       if (!product) {
//           return res.status(404).send("Product not found");
//       }

//       // Initialize cart if it doesn't exist
//       if (!req.session.cart) {
//           req.session.cart = [];
//       }

//       // Check if the product is already in the cart
//       let productInCart = req.session.cart.find(item => item.productId.toString() === productId);

//       if (productInCart) {
//           // If the product is already in the cart, increase the quantity
//           productInCart.quantity += 1;
//       } else {
//           // If not, add the product with quantity = 1
//           req.session.cart.push({
//               productId: product._id,
//               title: product.title,
//               price: product.price,
//               quantity: 1,
//               image: product.image // or any other fields from your product model
//           });
//       }

//       // Redirect or send response
//       res.redirect("/cart/cartview"); // Redirect to cart page after adding the product
//   } catch (err) {
//       console.error(err);
//       res.status(500).send("Error adding product to cart");
//   }
// });

// //remove item from cart

// router.get("/cart/remove/:productId", (req, res) => {
//   const productId = req.params.productId;

//   // Find the index of the item in the cart
//   const index = req.session.cart.findIndex(item => item.productId.toString() === productId);

//   if (index !== -1) {
//       // Remove the item from the cart
//       req.session.cart.splice(index, 1);
//   }

//   res.redirect("/cart/cartview"); // Redirect back to cart page after removing the item
// });

// // update cart quantity

// router.post("/cart/update/:productId", (req, res) => {
//   const productId = req.params.productId;
//   const { quantity } = req.body;

//   // Ensure the quantity is a positive number
//   if (quantity <= 0) {
//       return res.redirect("/cart/cartview"); // Invalid quantity, redirect back to cart
//   }

//   // Find the product in the cart
//   const productInCart = req.session.cart.find(item => item.productId.toString() === productId);

//   if (productInCart) {
//       // Update the quantity
//       productInCart.quantity = quantity;
//   }

//   res.redirect("/cart/cartview"); // Redirect to cart page after updating
// });
