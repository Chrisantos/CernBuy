const mongoose = require('mongoose');
const express = require('express');
const exphbs = require('express-handlebars');

const mongoUri = "mongodb://chrisantus:eze33963003@ds245250.mlab.com:45250/cernbuy";
mongoose.connect(mongoUri);

const app = express();

require('./routes/route')(app);
app.use(express.static(__dirname + "/public"));
app.set('port', process.env.PORT || 5000);
app.set('view engine', '.hbs');
app.engine('.hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));


app.listen(app.get('port'), () =>{
    console.log(`Server up and running at port ${app.get('port')}`);
});