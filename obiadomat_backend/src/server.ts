import { Request } from "express";

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

app.post('/signin', (req : Request, res : Response) => signin.handleSignin(req, res, db, bcrypt));
app.post('/register', (req : Request, res : Response) => register.handleRegister(req, res, db, bcrypt));
app.get('/meals', (req : Request, res : Response) => meals.handleMealsGet(req, res, db));
app.put('/meal', (req : Request, res : Response) => meals.handleMealInsert(req, res, db));
app.put('/meal/:id', (req : Request, res : Response) => meals.handleMealUpdate(req, res, db));
app.delete('/meal/:id', (req : Request, res : Response) => meals.handleMealDelete(req, res, db));
app.put('/order', (req : Request, res : Response) => order.handleOrderMake(req, res, db));
app.put('/currency', (req : Request, res : Response) => currency.handleCurrencyUpdate(req, res, db));
app.delete('/removeorder', (req : Request, res : Response) => order.handleOrderDelete(req, res, db));
app.get('/get_current_orders', (req : Request, res : Response) => order.handleOrdersGet(req, res, db)); 
app.put('/updateorder', (req : Request, res : Response) => order.handleOrderUpdate(req, res, db));
// app.put('/updateuserprofile', (req : Request, res : Response) =>{
//     //TODO change update funcs to only update not null provided data
//     const {id, firstname, lastname, email} = req.body;
//     db.select('email').from('login')
//     .then(emails =>{
//         if(emails.includes(email)){
//             res.status(400).json('given email already exists');
//         }
//         else{
//             db('users').where('id','=',id)
//             .update({
//                 firstname,
//                 lastname
//             })
//         }
//     })
// })


app.listen(3000, () => {
    console.log('App running on port 3000');
});