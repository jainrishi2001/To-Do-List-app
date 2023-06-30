const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});

const itemsSchema = {
    name : String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome to Todo List!"
});
const item2 = new Item({
    name: "Learning mongoose"
});
const item3 = new Item({
    name: "JPMC CFG"
});

const defaultItems = [item1,item2,item3];


async function getItems(){

    const Items = await Item.find({});
    return Items;
  
  }
app.get("/",function(req,res){
    getItems().then(function(FoundItems){
        if (FoundItems.length ==0){
            Item.insertMany(defaultItems);
            res,redirect("/");
        } else {
            res.render("list", {kindOfDay: "Today", newListItems:FoundItems});
        }
        
      });
});

app.post("/",function(req,res){
    const itemName = req.body.task;
    const item = new Item({
        name:itemName
    });
    item.save();
    res.redirect("/");
});

app.listen(3000, function(){
    console.log("Server is running on port 3000")
});