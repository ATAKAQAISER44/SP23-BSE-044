const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateTokens } = require('../../middleware/auth'); // Adjust path as needed

const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin'); // Ensure this path is correct
const authenticateToken = require('../../middleware/auth'); // Ensure this path is correct
const upload = require('../../middleware/upload'); // Adjust path as needed


// Registration route
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if the email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.render('register/register', { errorMessage: 'Email already exists' });
        }

        // Password validation regex (at least 6 characters, 1 lowercase, 1 uppercase)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.render('register/register', { errorMessage: 'Invalid password. Must be at least 8 characters long with a mix of letters, numbers, and special characters.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new admin user
        const newAdmin = new Admin({ name, email, password: hashedPassword, role });
        await newAdmin.save();

        // Redirect to login page
        res.redirect('/loginNow');
    } catch (error) {
        console.error(error);
        res.render('register/register', { errorMessage: 'Server error' });
    }
});





router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check user credentials
      const user = await Admin.findOne({ email });
  
      // If the user doesn't exist or the password is invalid
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Store user information in the session
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
  
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);
  
      // Set tokens in cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true, // Protect the cookie from JavaScript access
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "lax", // Allows cookies to be sent with cross-origin requests
      });
  
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
  
      // Redirect based on user role
      if (user.role === "admin") {
        return res.redirect("/admin/dashboard"); // Redirect admin to the admin portal
      } else {
        return res.redirect("/homePage"); // Redirect other users to the home page
      }
    } catch (error) {
      console.error("Error during login:", error); // Debugging log
      res.status(500).json({ message: "Internal Server Error", error });
    }
  });
  

  router.get('/logout', (req, res) => {
    res.clearCookie('accessToken'); // Clear the accessToken cookie
    res.clearCookie('refreshToken'); // Clear the refreshToken cookie
    res.redirect('/loginNow'); // Corrected path for redirecting to login page
});

module.exports = router;
