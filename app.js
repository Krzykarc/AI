var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var multer = require('multer');
var nodemailer = require('nodemailer');

var app = express();
var urlencodedParser = bodyParser.urlencoded({extended:false});

mongoose.connect('mongodb+srv://test:test@cluster0-fyxym.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true , useUnifiedTopology: true});
mongoose.set('useFindAndModify', true);


var picture = "";
var storage = multer.diskStorage({
  destination: './assets/imgs/',
  filename: function(req,file,cb){
    picture = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null,picture);
  }
});

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

var upload = multer({
  storage: storage,
  limits:{fileSize:10000000},
  filefilter: function(req,res,cb){
    checkFileType(file,cb);
  }
}).single('myImage');

/*
var userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String
});*/

var productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  prize: String,
  quantity: String,
  img: String
});

var accountSchema = new mongoose.Schema({
  email: String,
  password: String,
  type: String,
  orders: String
});

var orderSchema = new mongoose.Schema({
  client: String,
  items: String,
  quantities: String,
  totalPrize: String
});

var categorySchema = new mongoose.Schema({
  category: String
})

var Product = mongoose.model('Product',productSchema);
var Account = mongoose.model('Account',accountSchema);
var Category = mongoose.model('Category',categorySchema);
var Order = mongoose.model('Order',orderSchema);

var categories = ['fdfd','fdfd'];
var cats = ['sprzedaż','motywacja','jedzenie','marketing','podróżowanie','biografie'];
/*
var Myszka = Product({
  name: "zrob cos fajnego na necie",
  description: "na np. urodizny",
  prize: 13.21,
  category: "marketing",
  quantity: "4",
  img: "pol_pl_-R-Myszka-Logitech-G-Pro-Gaming-Mouse-Wired-Przewodowa-1896_1.png"
}).save(function(err){
  if(err) throw err;
  console.log("marketing");
});*/

//var User = mongoose.model('User',userSchema);

/*var UserOne = User({
  email: "jan",
  password: "jan",
  role: "max"
}).save(function(err){
  if(err) throw err;
  console.log("saved");
});*/ //zapisanie użytkowanika

var data;
var page = "index";
var header = ["partials/header","partials/userHeader","partials/adminHeader"];

var ready = 0;

Account.find({},function(err,data){
  if(err) throw err;
});

Category.find({},function(err,categories){
  if(err) throw err;
  cats = categories;
  ready = 1;
});

async function waitForCats(){
  while(ready===0){
    await waiting(100);
  }
  ready = 1;
}

function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function test(){
 console.log("start");
 await waiting(3600);
 console.log("3600ms later");
}

app.set('view engine','ejs');
app.use('/assets',express.static('assets'));

app.get('/',function(req,res){
  console.log(req.body);
  page='partials/items';
  res.render('index',{qs: req.query, page: page, categories: cats, header: header});
});

app.get('/register',function(req,res){
  page='partials/register';
  res.render('index',{qs: req.query, page: page, categories: cats, header: header});
});

app.post('/register',urlencodedParser,function(req,res){
  var czas = Date.now();
  var activate = '127.0.0.1:3000'+'/activate/'+req.body.email+'/'+czas
  var typ = ''+czas;
  var orders = '0';
  var ready = 0;
  var account = [];

  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

  async function test(){
      await Account.find({email: req.body.email},function(err,datas){
          if(err) throw err;
          account = datas;
          console.log("Sprawdzamy");
          console.log(account);
          console.log(req.body.email);
        });
        console.log(account);
        if(account.length==0) {
          var User = Account({
            email: req.body.email,
            password: req.body.haslo,
            type: typ,
            orders: '0'
          }).save(function(err){
            if(err) throw err;
            console.log("Dodano użytkownika "+req.body.email+". :)");
          });

          page='partials/register-success';

          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ciekawenewslettery@gmail.com',
              pass: 'ciekaweniusy21'
            }
          });

          var mailOptions = {
            from: 'ciekawenewslettery@gmail.com',
            to: req.body.email,
            subject: 'Potwierdzenie założenia konta.',
            html: `<p>Aby aktywować konto, przejdź na poniższą stronę.</p><p>${activate}</p>`
          };
          console.log(activate);

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }
        else {
          page = "partials/takenEmail";
        }
        res.render('index',{data: req.body, page: page, categories: cats, header: header});
  }
  test();
});

app.get('/resPass',function(req,res){
  page="partials/resPass";
  res.render('index',{page: page, account: req.params.email, categories: cats, header: header});
});

app.post('/resPass',urlencodedParser,function(req,res){
  console.log(req.body.email);
  var newPass = Math.random().toString(36).substring(6);
  page = "partials/simple";

  Account.findOneAndUpdate({email: req.body.email},{password: newPass}).then(console.log("haslo wyslane"));

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ciekawenewslettery@gmail.com',
      pass: 'ciekaweniusy21'
    }
  });

  var mailOptions = {
    from: 'ciekawenewslettery@gmail.com',
    to: req.body.email,
    subject: 'Reset hasla.',
    html: `<p>Twoje nowe haslo to </p><p>${newPass}</p>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.render('index',{qs: req.query, page: page,mssg: "Hasło zresetowane. Sprawdź Email.", categories: cats, header: header});
});

app.get('/add',function(req,res){
  page='partials/add';
  res.render('index',{qs: req.query, page: page, categories: cats, header: header, mssg: ''});
});

app.post('/add',(req,res) => {
  upload(req,res,(err) => {
    if(err){
      res.render('index',{
        msg: err
      });
    } else {
      var AddedProduct = Product({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        prize: req.body.prize,
        quantity: req.body.quantity,
        img: picture
      }).save(function(err){
        if(err) throw err;
      });
      res.render('index',{qs: req.query, page: page, categories: cats, header: header, mssg: "Dodano ebooka! :)"});
    }
  });
});

app.get('/contact',function(req,res){
  page='contact';
  res.render(page,{qs: req.query, page: page});
});

var beforeLogin = "Wpisz dane, aby się zalogować";
var invalidLogin = "Błędne dane";

app.get('/login',function(req,res){
  page='partials/login';
  res.render('index',{qs: req.query, page: page, categories: cats, mssg: beforeLogin, header: header});
});

app.post('/login',urlencodedParser,function(req,res){
  var logged = [];
  async function check(){
    await Account.find({email: req.body.email, password: req.body.pass},function(err,datas){
        if(err) throw err;
        logged = datas;
        if(logged.length==0){
          page='partials/login';
          res.render('index',{qs: req.query, page: page, categories: cats, mssg: invalidLogin, header: header});
        } else if(logged[0].type=='admin') {
          page='partials/login-succeed';
          res.render('index',{qs: req.query, page: page, categories: cats, mssg: beforeLogin, header: header, type:"admin", email: req.body.email});
        } else {
          page='partials/login-succeed';
          res.render('index',{qs: req.query, page: page, categories: cats, mssg: beforeLogin, header: header, type: "active", email: req.body.email});
        }
      });
    console.log(logged.length);
  }

  check();
});

app.get('/logout',function(req,res){
  page='partials/logout';
  res.render('index',{qs: req.query, page: page, categories: cats, header: header});
});

app.get('/basket',function(req,res){
  page='partials/basket';
  res.render('index',{qs: req.query, page: page, categories: cats, header: header});
});

app.post('/myBasket',urlencodedParser,function(req,res){
  console.log("tu sie wywala");
  page='partials/myBasket';
  var produkty = req.body.basket;
  produkty = produkty.split(",");
  var sztuki = req.body.quant;
  sztuki = sztuki.split(",");
  console.log(produkty);
  var prods = [];
  var ready = 0;
  console.log("tu jwaxw dziala");

  if(!produkty[0]=='')
  {
    Product.find({_id: {$in: produkty}},function(err,products){
      console.log(products);
      if(err) throw err;
      prods = products;
      ready = 1;
    });
  }
  else {
    ready = 1;
  }

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, quantities: sztuki, categories: cats, header: header});
  }
  test();
});

app.post('/basket',function(req,res){
  console.log("dzieki!!");
  page='partials/basket';
  res.render('index',{qs: req.query, page: page, categories: cats, header: header});
});

app.post('/Zlozono',urlencodedParser,function(req,res){
  page="partials/simple"
  console.log("zamowienie przyjete");
  console.log(req.body);
  if(req.body.email==''||req.body.email=="") {
    mssg = "Zaloguj się, aby złożyć zamówienie.";
    res.render('index',{qs: req.query, page: page, categories: cats, header: header, mssg: mssg});
  }
  else {
  var items = [];
  var quantities =[];

  var temp = JSON.stringify(req.body);
  temp = temp.replace(/:/g,',');
  temp = temp.replace(/{/g,'');
  temp = temp.replace(/}/g,'');
  temp = temp.replace(/"/g,'');
  temp = temp.split(",");
  console.log(temp);

  temp.forEach(function(value,index){
    if(index<2){
      console.log("siema");
    }
    else if(index%2===0)
      items.push(value);
    else {
      quantities.push(value);
    }
    console.log(value);
  });


  items = items.join();
  quantities = quantities.join();


    console.log(temp);
    console.log(items);
    console.log(quantities);
  var newOrder = Order({
    //client: req.body.email,
    client: req.body.email,
    items: items,
    quantities: quantities,
    totalPrize: '0',
    status: "waiting"
  }).save(function(err){
    if(err) throw err;
    console.log("Dodano zamowienie "+req.body.email+". :)");
  });

  mssg = "Złożono zamówienie.";
  res.render('index',{qs: req.query, page: page, categories: cats, header: header, mssg: mssg});}
});

app.post('/contact',urlencodedParser,function(req,res){
  res.render('contact-success',{data: req.body});
});

app.get('/profile/:id',function(req,res){
  var hobbies = ['ninjas','phishing','rowing'];
  res.render('profile',{person: req.params.id, hobbies: hobbies});
});

app.get('/activate/:email/:active',function(req,res){
  page='partials/active';
  var account = "";

  var ready = 0;
  Account.find({email: req.params.email},function(err,datas){
    if(err) throw err;
    ready = 1;
    account = datas;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(150);

    console.log(req.params.email);
    console.log(__dirname+req.params.active);
    console.log(account[0].email);
    console.log(account[0].type);
    if(req.params.email===account[0].email&&(req.params.active===account[0].type))
      Account.findOneAndUpdate({email: req.params.email},{type: 'aktywny'}).then(console.log("Aktywowano konto!"));

    res.render('index',{page: page, kontoZBazy: account[0], account: req.params.email, code: req.params.active, categories: cats, header: header});
  }
  test();
});

app.get('/category/:name',function(req,res){
  var cat = req.params.name;
  page='partials/prods';
  var prods = ['fdfd'];
  var ready = 0;
  Product.find({category: cat},function(err,products){
    if(err) throw err;
    prods = products;
    ready = 1;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
});

app.get('/showProducts',function(req,res){
  var cat = req.params.name;
  page='partials/showProducts';
  var prods = ['fdfd'];
  var ready = 0;
  Product.find({},function(err,products){
    if(err) throw err;
    prods = products;
    ready = 1;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
});

app.get('/showOrders',function(req,res){
  var cat = req.params.name;
  page='partials/showOrders';
  var prods = ['fdfd'];
  var ready = 0;
  Order.find({},function(err,products){
    if(err) throw err;
    prods = products;
    ready = 1;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
});

app.get('/orders',function(req,res){
  var cat = req.params.name;
  page='partials/orders';
  var prods = ['fdfd'];
  var ready = 0;
  Order.find({},function(err,products){
    if(err) throw err;
    prods = products;
    ready = 1;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
});

app.post('/showOrders',urlencodedParser,function(req,res){
  console.log(req.body);
  var temp = JSON.stringify(req.body);
  temp = temp.replace(/:/g,',');
  temp = temp.replace(/{/g,'');
  temp = temp.replace(/}/g,'');
  temp = temp.replace(/"/g,'');
  temp = temp.split(",");

  Order.findOneAndRemove({_id: temp[0]}).then(function(){
    console.log('usunieto zamowienie');
  });
  res.send("usunieto");
});

app.post('/szukaj',urlencodedParser,function(req,res){
  page='partials/prods';
  console.log(req.body.szukaj);

  var prods = ['fdfd'];
  var ready = 0;
  Product.find({ name: { $regex: req.body.szukaj, $options: 'i'}},function(err,products){
    if(err) throw err;
    prods = products;
    ready = 1;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
});

app.post('/szukajAdmina',urlencodedParser,function(req,res){
  page='partials/showProducts';
  console.log(req.body.szukajAdmina);

  var prods = ['fdfd'];
  var ready = 0;
  Product.find({ name: { $regex: req.body.szukajAdmina, $options: 'i'}},function(err,products){
    if(err) throw err;
    prods = products;
    ready = 1;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
});

app.get('/showProducts/:name',function(req,res){
  var cat = req.params.name;
  console.log(cat);
  page='partials/edit';
  var prods = ['fdfd'];
  var ready = 0;
  Product.find({_id: cat},function(err,products){
    if(err) throw err;
    prods = products;
    ready = 1;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
});

app.post('/edit',(req,res) => {
  upload(req,res,(err) => {
    if(err){
      res.render('index',{
        msg: err
      });
    } else {
      console.log(picture);
      if(picture==''){
        Product.findOneAndUpdate({_id: req.body.ident},{
          name: req.body.namee,
          description: req.body.description,
          category: req.body.category,
          prize: req.body.prize,
          quantity: req.body.quantity,
        }).then(console.log("zmieniono dane"));
      } else {
      Product.findOneAndUpdate({_id: req.body.ident},{
        name: req.body.namee,
        description: req.body.description,
        category: req.body.category,
        prize: req.body.prize,
        quantity: req.body.quantity,
        img: picture
      }).then(console.log("zmieniono dane"));
      }
      page="partials/simple";
      mssg="Zmieniono dane!";
      res.render('index',{person: req.params.name, page: page, categories: cats, header: header, mssg: mssg});
    }
  });
});

app.post('/editClient2',function(req,res) {
  console.log(req.body);
  upload(req,res,(err) => {
      console.log(req.body);
      Product.findOneAndUpdate({_id: req.body.ident},{
        name: req.body.namee,
        description: req.body.description,
        category: req.body.category,
        prize: req.body.prize,
        quantity: req.body.quantity,
        img: picture
      }).then(console.log("zmieniono dane klienta"));

      res.send('Zmieniono dane klienta');
  });
});

app.post('/editClient',urlencodedParser,function(req,res){
  console.log(req.body);
  Account.findOneAndUpdate({_id: req.body.ident},{
    email: req.body.email,
    password: req.body.password,
    type: req.body.type,
    orders: req.body.orders
  }).then(console.log("zmieniono dane klienta"));
  page="partials/simple";
  mssg="Zmieniono dane!";
  res.render('index',{person: req.params.name, page: page, categories: cats, header: header, mssg: mssg});
});

app.post('/delete',urlencodedParser,function(req,res){
  console.log(req.body);
  Product.findOneAndRemove({_id: req.body.identy}).then(function(){
    console.log('usunieto prdukt');
  });

  page="partials/simple";
  mssg="Usunięto produkt!";
  res.render('index',{person: req.params.name, page: page, categories: cats, header: header, mssg: mssg});
});

app.post('/deleteOrders',urlencodedParser,function(req,res){
  console.log(req.body);
  var temp = JSON.stringify(req.body);
  temp = temp.replace(/:/g,',');
  temp = temp.replace(/{/g,'');
  temp = temp.replace(/}/g,'');
  temp = temp.replace(/"/g,'');
  temp = temp.split(",");
  var items = [];

  temp.forEach(function(value,index){
    if(index%2==0)
      items.push(value);
    console.log(value);
  });
  console.log(items);

  items.forEach(function(value){
    Order.findOneAndRemove({_id: value}).then(function(){
      console.log('usunieto prdukt');
    });
  });

  page='partials/orders';
  var prods = ['fdfd'];
  var ready = 0;

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0){
      await Order.find({},function(err,products){
        if(err) throw err;
        prods = products;
        ready = 1;
      });
      waiting(50);
    }
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
  //res.render('contact-success',{data: req.body});
});


app.post('/deleteClient',urlencodedParser,function(req,res){
  console.log(req.body);
  Account.findOneAndRemove({_id: req.body.identy}).then(function(){
    console.log('usunieto clienta');
  });
  page="partials/simple";
  mssg="Usunięto!";
  res.render('index',{person: req.params.name, page: page, categories: cats, header: header, mssg: mssg});
});

app.get('/showClients',function(req,res){
  var cat = req.params.name;
  page='partials/showClients';
  var prods = ['fdfd'];
  var ready = 0;
  Account.find({},function(err,products){
    if(err) throw err;
    prods = products;
    ready = 1;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
});

app.get('/showClients/:name',function(req,res){
  var cat = req.params.name;
  console.log(cat);
  page='partials/editClient';
  var prods = ['fdfd'];
  var ready = 0;
  Account.find({_id: cat},function(err,products){
    if(err) throw err;
    prods = products;
    ready = 1;
  });

  function waiting(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async function test(){
    while(ready===0)
      await waiting(50);
    res.render('index',{person: req.params.name, page: page, products: prods, categories: cats, header: header});
  }
  test();
});

app.listen(3000);
