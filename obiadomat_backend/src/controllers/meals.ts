import { Response, Request } from "express";

export interface Meal {
    id?: number,
    mealname?: string,
    description?: string,
    price?: number,
    number?: number
}

interface MealRequest {
    mealname: string,
    desc: string,
    price: number,
    number: number
}

const handleMealsGet = (req : Request, res : Response, db: any) =>{
    db.select('*').from('meals')
    .then((meals : Array<Meal>) => {
        if(meals.length){
            res.json(meals);
        } else{
            res.status(400).json('no meals found');
        }
    })
    .catch((err : any )=> {
        res.status(400).json('error getting meals');
        console.log(err);
    })
}

const handleMealInsert = (req : Request, res : Response, db : any) =>{
    const {mealname, desc, price, number} : MealRequest= req.body;
    if(mealname && desc && price && number){
        db('meals').insert({
            mealname: mealname,
            description: desc,
            price: price,
            number: number
        })
        .returning('*')
        .then((meals : Array<Meal>) => res.json(meals))
        .catch((err : any)=> {
            res.status(400).json('error inserting meal');
            console.log(err);
        })
    } else {
        res.status(400).json('meal information not filled correctly');
    }
}

const handleMealUpdate = (req : Request, res : Response, db : any) =>{
    const {mealname, desc, price, number} : MealRequest = req.body;
    const {id}: {id : number} = req.params;
    if(id && mealname && desc && price && number){
        db('meals').where('id', '=', id)
        .update({
            mealname: mealname,
            description: desc,
            price: price,
            number: number
        })
        .returning('*')
        .then((meals : Array<Meal>) => res.json(meals))
        .catch((err : any) => {
            res.status(400).json('cannot modify meal');
            console.log(err);
        })
    } else {
        res.status(400).json('meal information not correct');
    }
}

const handleMealDelete = (req : Request, res : Response, db : any) =>{
    const {id} : {id : number} = req.params;
    if(id){
        db('meals').where('id', '=', id)
        .del()
        .then(() => {
            db.select("*").from("meals")
            .then((meals : Array<Meal>) => res.json(meals))
            .catch((err: any) => res.status(400).json("error removing meal"))
        })
        .catch((err : any) => {
            res.status(400).json('error removing meal');
            console.log(err);
        })
    } else {
        res.status(400).json('cannot find meal')
    }
}

module.exports = {
    handleMealsGet,
    handleMealInsert,
    handleMealUpdate,
    handleMealDelete
}