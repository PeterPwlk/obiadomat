import { Request, Response } from "express";
import { Transaction } from "knex";

interface RegisterRequest {
    email: string,
    password: string,
    firstname: string,
    lastname: string
}

interface User {
    id: number,
    firstname: string,
    lastname: string,
    currency: number
}

const handleRegister = (req : Request, res : Response, db : any, bcrypt : any) =>{
    const {email, password, firstname, lastname} : RegisterRequest = req.body;
    if(email && password && firstname && lastname){
        console.log(password);
        const hash = bcrypt.hashSync(password);
        db.transaction((trx : Transaction) =>{
            trx.insert({
                email: email,
                password: hash
            })
            .into('login')
            .returning('id')
            .then((id : Array<Number>) =>{
                return trx.insert({
                    id: id[0],
                    firstname: firstname,
                    lastname: lastname,
                    currency: 0
                })
                .into('users')
                .returning('*')
                .then((user : Array<User>) =>{
                    res.json(user[0]);
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch((err : any) => {
            res.status(400).json('unable to register');
        })
    }
    else{
        res.status(400).json('wrong user data');
    }
}

const validateUserCredencials = (credencials : RegisterRequest) =>{
    if(credencials.email &&
        credencials.password &&
        credencials.firstname &&
        credencials.lastname){
            return true;
        }
    else {
        return false;
    }
}

module.exports ={
    handleRegister
}