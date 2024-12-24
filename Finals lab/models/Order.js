
// const mongoose = require('mongoose');
// const orderSchema = new mongoose.Schema({
//   user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
//   items: [{ product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }],
//   total_amount: { type: Number, required: true },
//   payment_method: { type: String, default: 'cod' }, // Cash on Delivery
//   status: { type: String, default: 'Pending' }, // Order status: Pending, Shipped, Delivered
//   address: String,
//   created_at: { type: Date, default: Date.now }
// });

// const Order = mongoose.model('Order', orderSchema);
// module.exports = Order;



const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  items: [{ product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, 
    quantity: Number }],
  total_amount: { type: Number, required: true },
  payment_method: { type: String, default: 'cod' }, // Cash on Delivery
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered'],  // Enum to restrict status values
    default: 'Pending',  // Default status is 'Pending'
  },
  address: String,
  created_at: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;









