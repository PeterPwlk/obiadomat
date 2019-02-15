import { Request, Response } from "express";

const handleCurrencyUpdate = (req : Request, res : Response, db : any) =>{
    const {id, addedCurrency} : {id: string, addedCurrency: number} = req.body;
    db.select('currency').from('users').where('id', '=', id)
    .then((currency : any) => {
        const newCurrency : number = parseFloat(currency[0].currency) + addedCurrency;
        db('users').update('currency', newCurrency)
        .returning('currency')
        .then((newCurrency : Array<number>) => {
            res.json(newCurrency[0]);
        })
        .catch((err : any) => {
            res.status(400).json('cannot add currency');
            console.log(err);
        })
    })
}

module.exports = {
    handleCurrencyUpdate
}