const express = require("express");
const bodyParser = require("body-parser");
const mongoose =  require("mongoose");
const _ = require("lodash");

const app= express();


app.set('view engine', "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
var today= new Date();
/*  var day="";
switch (today.getDay()){
  case 0:
     day="Sunday";
     break;
  case 1:
     day="Monday";
     break;
  case 2:
     day="Tuesday";
     break;
  case 3:
     day="Wednesday";
     break;
  case 4:
     day="Thursday";
     break;
  case 5:
     day="Friday";
     break;
  case 6:
      day="Saturday";
      break;
  default:
  console.log("Error: current day is equal to today.getDay()");

}
/*if(today.getDay()==6||today.getDay()==0){
  day= "weekend";
}
else{
  day= "weekday";
}*/
var options ={
  weekday: "long",
  day: "numeric",
  month: "long"
};
var day = today.toLocaleDateString("en-US",options);

mongoose.connect("mongodb+srv://manvii:manvi123@cluster0.yayvyes.mongodb.net/todolistDB", {useNewUrlParser:true});

const itemsSchema = {
  name : String,
};

const Item= mongoose.model("Item", itemsSchema);

const item1= new Item({
  name: "Welcome to your to-do list",
});

const item2= new Item({
  name: "Hit the + button to add a new item",
});

const item3= new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2,item3];

const listSchema = {
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);









app.get("/", function(req,res){
    Item.find({}, function(err , foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved our default items to DB");
        }
      });
      res.redirect("/");
    }else{
      res.render("lists",{listTitle:day, newListItems:foundItems});
    }
  });
});

app.post("/",function(request,response){
  const itemName = request.body.newItem;
  const listName = request.body.list;
  const item= new Item({
    name: itemName,
  });

  if(listName === day){
    item.save();
    response.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItemId}}},function(){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }


});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        // Create a new list
        const list = new List({
          name:  customListName,
          items: defaultItems
        });
        list.save();
      }else{
        // Show an existing list
        res.render("lists", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }

  })




});
let port = process.env.PORT;
if(port==null || port==""){
  port=3000;
}


app.listen(port, function(){
  console.log("Server has started successfully.");
});
