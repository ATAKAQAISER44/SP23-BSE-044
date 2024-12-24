const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const layout=require("express-ejs-layouts");
let Product=require("./models/product");
const session = require("express-session");
const flash = require('connect-flash');
const Order = require('./models/Order');
let Category=require("./models/category");

const { checkAdminAccess, authenticateAccessToken } = require('./middleware/auth');


const app = express();



app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true if using HTTPS
}));

// Flash middleware
app.use(flash());

// Make flash messages available in templates (if using a templating engine like EJS)
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});


const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(layout);
app.use("/uploads/products", express.static(path.join(__dirname, "uploads/products")));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));




// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup session
app.use(session({
    secret: 'your_secret_key', // Secret key for signing the session ID
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Save session even if uninitialized
    cookie: { secure: false } // Set to true if using HTTPS
}));


// Routes

const adminRouter = require('./routes/admin/adminroutes');
app.use('/admin', authenticateAccessToken, adminRouter);

const productsRouter = require('./routes/admin/products.router');
app.use(productsRouter);


const cartsRouter = require('./routes/cartroutes/cartroutes');
app.use(cartsRouter);



app.get("/homePage",authenticateAccessToken,(req,res)=>{
  res.render("home")
})

app.get('/registerNow', (req, res) => {
  res.render('register/register', { layout: "registerlayout", title: "Register" });
});

app.get('/loginNow', (req, res) => {
  res.render('login/login', { layout: "registerlayout", title: "Login" });
});

app.get('/', (req, res) => {
  res.render('index', { layout: "registerlayout", title: "Welcome to the Site" });
});




app.get("/admin/dashboard", authenticateAccessToken,checkAdminAccess, (req, res) => {
  res.render("admin/dashboard", { layout: "admin/admin-layout" });
});

app.get("/admin/products", authenticateAccessToken,checkAdminAccess, async (req, res) => {
  let products = await Product.find();
  res.render("admin/products", { layout: "admin/admin-layout", products });
});

app.get("/admin/create", authenticateAccessToken,checkAdminAccess, (req, res) => {
  res.render("admin/create", { layout: "admin/admin-layout" });
});




app.get("/admin/products/edit/:id", async (req, res) => {
  
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).send("Product not found");
  }
  res.render("admin/product-edit-form", { 
    product, 
    layout: "admin/admin-layout" 
  });

});




app.get("/cart/cartview", authenticateAccessToken, (req, res) => {
  const userId = req.user.id; // Get the authenticated user's ID

  if (!req.session.cart || req.session.cart.length === 0) {
    req.flash('info', 'Your cart is empty. Add some products!');
    return res.render("cart/cartview", { layout: "layout", cart: null });
  }

  // Filter the cart to only show items belonging to the authenticated user
  const userCart = req.session.cart.filter(item => item.userId.toString() === userId);

  if (userCart.length === 0) {
    req.flash('info', 'Your cart is empty. Add some products!');
    return res.render("cart/cartview", { layout: "layout", cart: null });
  }

  // Calculate total cost for the current user's cart
  const total = userCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Log cart data for debugging
  console.log("Cart Contents:", userCart);

  // Render the cart view for the authenticated user
  res.render("cart/cartview", { layout: "layout", cart: userCart, total });
});




app.get('/add-to-cart/:productId', authenticateAccessToken, async (req, res) => {
  const productId = req.params.productId;
  
  try {
      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).send("Product not found");
      }

      res.render('cart/addProduct', { product });
  } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching product");
  }
});


// Pagination  

// app.get('/products', async (req, res) => {
//   try {
//     // Get the current page from query parameters, default to page 1
//     const page = parseInt(req.query.page) || 1;
    
//     // Set the number of products to display per page
//     const perPage = 12;

//     // Fetch paginated products from the database
//     const products = await Product.find()
//                                   .skip((page - 1) * perPage)  // Skip products for previous pages
//                                   .limit(perPage);  // Limit products per page

//     // Count the total number of products in the database for pagination
//     const totalProducts = await Product.countDocuments();

//     // Calculate the total number of pages
//     const totalPages = Math.ceil(totalProducts / perPage);

//     // Log products to check the _id values
//     console.log(products);

//     if (!products || products.length === 0) {
//       return res.status(404).send("No products found");
//     }

//     // Render the 'AllProducts' view and pass products and pagination data
//     res.render('cart/AllProducts', {
//       products,
//       currentPage: page,
//       totalPages,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching products");
//   }
// });


app.get('/products', async (req, res) => {
  try {
    // Query parameters
    const page = parseInt(req.query.page) || 1; // Current page
    const perPage = 8; // Items per page
    const search = req.query.search || ''; // Search term
    const sort = req.query.sort || 'createdAt'; // Sorting field (default to 'createdAt')
    const order = req.query.order === 'desc' ? -1 : 1; // Sorting order (default to ascending)

    // Build the query object
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' }; // Case-insensitive search on title
    }

    // Count total products matching the query
    const totalProducts = await Product.countDocuments(query);

    // Fetch products based on query with sorting, pagination, and filtering
    const products = await Product.find(query)
      .sort({ [sort]: order }) // Dynamic sort field and order
      .skip((page - 1) * perPage) // Skip items for previous pages
      .limit(perPage); // Limit items per page

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / perPage);

    // Render the 'AllProducts' view
    res.render('cart/AllProducts', {
      products,
      currentPage: page,
      totalPages,
      search, // Pass search term back to the view
      sort, // Pass sort field back to the view
      order, // Pass sort order back to the view
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching products");
  }
});




// Admin route to view orders
app.get("/admin/orders", authenticateAccessToken, checkAdminAccess, async (req, res) => {
  try {
      const orders = await Order.find().populate('user_id', 'name email'); // Fetch all orders
      res.render("admin/orders", { layout: "admin/admin-layout", orders });
  } catch (err) {
      console.error('Error fetching orders:', err);
      req.flash('error', 'Could not fetch orders.');
      res.redirect("/admin/dashboard");
  }
});


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


  




