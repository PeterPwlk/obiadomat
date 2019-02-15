import { Request, Response } from "express";

interface UserCredencials{
    email: string,
    password: string
}

interface Login{
    id: number,
    email: string,
    password: string
}

interface User {
    id: number,
    firstname: string,
    lastname: string,
    currency: number
}

const handleSignin = (req : Request, res : Response, db : any, bcrypt : any) =>{
    const {email, password} : UserCredencials = req.body;
    db.select('*').from('login').where('email', '=', email)
    .then((user : Array<Login>) =>{
        const isValid = bcrypt.compareSync(password, user[0].password);
        if(isValid){
            return db.select('*').from('users').where('id', '=', user[0].id)
            .then((user : Array<User>) => res.json(user[0]))
            .catch((err : any) => {res.status(400).json('unable to get user');
                console.log(err);
            })
        } else {
            res.status(400).json('wrong credencials');
        }
    })
    .catch((err : any) => {
        res.status(400).json('error getting user');
        console.log(err);
    })
};

module.exports = {
    handleSignin
}
