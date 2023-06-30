const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

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
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);


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

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    async function checkIfList(){
        return await List.findOne({name: customListName});
    };

    checkIfList().then(function(err,foundList){
        if (!err){
            if(!foundList){
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }else {
                //Show an existing list 
                res.render("list", {kindOfDay: foundList.name, newListItems:foundList.items});
            }
        }
    });  

});


app.post("/",function(req,res){
    const itemName = req.body.task;
    const listName = req.body.list;
    const item = new Item({
        name:itemName
    });
    if (listName==="Today"){
        item.save();
        res.redirect("/");
    }else {
        async function checking(){
            return await List.findOne({name: listName});
        };
       checking().then(function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
       });
    }
    
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName==="Today"){
        async function deleteItems(){

            return await Item.findByIdAndRemove(checkedItemId);
          };
          deleteItems().then(function(err){
            if (!err){
                console.log("Success delete");
            }
          });
          res.redirect("/");

    } else{
        async function deleteOneitem(){

            return await  List.findOneAndUpdate({name: listName},{$pull: {items: {_id : checkedItemId}}});
          };
          deleteOneitem().then(function(err,foundList){
            if (!err){
                res.redirect("/"+ listName);
            }
          }); 
    }
    
});

app.listen(3000, function(){
    console.log("Server is running on port 3000")
});