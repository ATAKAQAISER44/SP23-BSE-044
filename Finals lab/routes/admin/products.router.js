const express = require("express");
let router = express.Router();
let Product=require("../../models/product");
let Category=require("../../models/category");
const multer = require("multer");
const path = require('path');
const Order = require('../../models/Order');



router.get("/admin/categories",async (req,res)=>{
  const categories=await Category.find();
  res.render("admin/categories",{ layout: "admin/admin-layout" ,categories});
});



router.get("/admin/create-category",(req,res)=>{
  res.render("admin/create-category",{ layout: "admin/admin-layout"});
})

router.post("/admin/create-category",async (req,res)=>{
  const {title,description,numberOfItems} = req.body;
  const category=await Category.create({
    title,
    description,
    numberOfItems
  })
  res.redirect("/admin/categories");
})

router.get("/admin/categories/edit/:id",async (req,res)=>{
  const category=await Category.findById(req.params.id);
  if(!category){
    throw new Error("Category Not found");
  }
res.render("admin/categories-edit-form",{ 
  category, 
  layout: "admin/admin-layout" 
});
});

router.post("/admin/categories/edit/:id", async (req,res)=>{
    const { title, description, numberOfItems } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
      title,
      description,
      numberOfItems
    }, { new: true });

    if (!updatedCategory) {
      return res.status(404).send("Category not found");
    }
    res.redirect("/admin/categories");
})


router.get("/admin/categories/delete/:id",async (req,res)=>{
  const category=await Category.findByIdAndDelete(req.params.id);
  return res.redirect("back");
});






// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/");  // Specify the folder to store uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Generate a unique filename
  },
});





const upload = multer({ storage: storage });

// Route for creating a product with an image
router.post("/admin/create", upload.single("productImage"), async (req, res) => {
  try {
    const { title, description, price, isFeatured } = req.body;

    // Check if an image was uploaded, and generate the image URL
    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

    // Convert "isFeatured" checkbox to a boolean value
    const isFeaturedValue = isFeatured === "on";

    // Create the product entry in the database
    const product = await Product.create({
      title,
      description,
      price,
      isFeatured: isFeaturedValue,
      image: imageUrl,  // Save the image URL to the product
    });

    res.redirect("/admin/products");  // Redirect to the products list page
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).send("Error creating product");
  }
});

router.post("/admin/products/edit/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, description, price, isFeatured } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(productId, {
      title,
      description,
      price,
      isFeatured: isFeatured === 'on',  
    }, { new: true });

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }
    res.redirect("/admin/products");  
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).send("Server error");
  }
}); 

router.get("/admin/products/delete/:id",async (req,res)=>{
  const product=await Product.findByIdAndDelete(req.params.id);
  return res.redirect("back");
});







// Update order status
router.post("/admin/orders/update-status/:orderId", async (req, res) => {
  try {
      const { status } = req.body;
      const orderId = req.params.orderId;

      // Validate that the status is one of the allowed values
      if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
          return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      // Find and update the order status
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: status }, { new: true });
      if (!updatedOrder) {
          return res.status(404).send('Order not found');
      }

      res.json({ success: true });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




module.exports = router;