const mongoose=require("mongoose");
let categorySchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },numberOfItems:{
        type:Number,
        required:true
    }
})
module.exports=mongoose.model("category",categorySchema);