const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'twierdza1',
        database: 'obiadomat'
    }
});

const signin = require('./controllers/signin');
const meals = require('./controllers/meals');
const order = require('./controllers/order');
const register = require('./controllers/register');
const currency = require('./controllers/currency');

app.post('/signin', (req, res) => signin.handleSignin(req, res, db, bcrypt));
app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt));
app.get('/meals', (req, res) => meals.handleMealsGet(req, res, db));
app.put('/meal', (req, res) => meals.handleMealInsert(req, res, db));
app.put('/meal/:id', (req, res) => meals.handleMealUpdate(req, res, db));
app.delete('/meal/:id', (req, res) => meals.handleMealDelete(req, res, db));
app.put('/order', (req, res) => order.handleOrderMake(req, res, db));
app.put('/currency', (req, res) => currency.handleCurrencyUpdate(req, res, db));
app.delete('/removeorder', (req, res) => order.handleOrderDelete(req, res, db));
app.get('/get_current_orders', (req, res) => order.handleOrdersGet(req, res, db)); 
app.put('/updateorder', (req, res) => order.handleOrderUpdate(req, res, db));
app.put('/updateuserprofile', (req, res) =>{
    //TODO change update funcs to only update not null provided data
    const {id, firstname, lastname, email} = req.body;
    db.select('email').from('login')
    .then(emails =>{
        if(emails.includes(email)){
            res.status(400).json('given email already exists');
        }
        else{
            db('users').where('id','=',id)
            .update({
                firstname,
                lastname
            })
        }
    })
})


app.listen(3000, () => {
    console.log('App running on port 3000');
});