import { Request, Response } from "express";
import { QueryInterface, Transaction, QueryBuilder } from "knex";
import { Meal } from "./meals";

interface OrderedMeal {
    mealid: number,
    quantity: number
}

interface OrderedMealsRequest {
    userId: number,
    orderedMeals: Array<OrderedMeal>
}

interface Order extends OrderedMeal {
    id?: number,
    userid: number,
    orderdate: Date
}

interface UserOrder {
    currency: number,
    orderedMeals: Array<Order>
}

const handleOrderMake = async (req : Request, res : Response, db : any) => {
    const { userId, orderedMeals } : OrderedMealsRequest = req.body;
    if (userId && orderedMeals) {
        const sortedOrderedMeals = orderedMeals.sort((a : OrderedMeal, b : OrderedMeal) => {
            return a.mealid - b.mealid
        });
        try {
            const mealIds = getMealIdList(orderedMeals);
            const meals : Array<Meal> = await db.select('price').from('meals').whereIn('id', mealIds).orderBy('id');
            const orderedM = createOrder(userId, orderedMeals);
            let currency = await db.select('currency').from('users').where('id', '=', userId);
            currency = currency[0].currency;
            const totalPrice = calculateOrderPrice(sortedOrderedMeals, meals);
            if (totalPrice > currency) {
                res.status(400).json('not enought money to order');
            } else {
                currency = currency - totalPrice;
                db.transaction((trx : Transaction) => {
                    trx('orderedmeals').insert(orderedM)
                        .returning('*')
                        .then((order : Array<Order>) => {
                            return trx('users').where('id', '=', userId).update({
                                currency: currency
                            })
                                .returning('currency')
                                .then((currency : Array<number>) => {
                                    const userOrder : UserOrder = {
                                        currency: currency[0],
                                        orderedMeals: order
                                    }
                                    res.json(userOrder);
                                })
                                .catch((err : any) => res.status(400).json('error while making order'))
                        })
                        .then(trx.commit)
                        .catch(trx.rollback);
                })
            }
        } catch (e) {
            console.log(e)
            res.status(400).json('error');
        }
    } else {
        res.status(400).json('empty order');
    }
}

const handleOrderDelete = async (req: Request, res: Response, db: any) => {
    const { userId }: { userId: number } = req.body;
    const today = currentDay();
    try {
        const oldMeals = await db.select('price', 'quantity').from('orderedmeals').where((builder: QueryBuilder) => {
            builder.where('orderdate', '>', today).where('userid', '=', userId)
        }).innerJoin('meals', 'orderedmeals.mealid', 'meals.id');
        let currency = await db.select('currency').from('users').where('id', '=', userId);
        currency = currency[0].currency;
        const totalPrice = calculateOrderPrice(oldMeals, oldMeals);
        db.transaction(async (trx: Transaction) => {
            try {
                await trx('orderedmeals').where((builder: QueryBuilder) => {
                    builder.where('orderdate', '>', today).where('userid', '=', userId)
                })
                .del()
                const newCurrency = parseFloat(currency) + totalPrice;
                const updatedCurrency: Array<number> = await trx('users').where('id', '=', userId)
                    .update({
                        currency: newCurrency
                    })
                    .returning('currency')
                const order: UserOrder = {
                    currency: currency[0],
                    orderedMeals: []
                }
                res.json(order);
                trx.commit;
            }
            catch (err) {
                trx.rollback
                console.log(err);
                res.status(400).json('cannot delete order');
            }
        })

    } catch (err) {
        console.log(err);
        res.status(400).json("cannot delete order");
    }

}

const handleOrderUpdate = async (req: Request, res: Response, db: any) => {
    //TODO export currentDay to different file
    //TODO need to calculate two order prices one for old one for new order
    const { userId, orderedMeals } = req.body;
    if (userId && orderedMeals) {
        try {
            const today = currentDay();
            const mealIds = getMealIdList(orderedMeals);
            const meals: Array<Meal> = await db.select('*').from('meals').whereIn('id', mealIds);
            const orderedM = createOrder(userId, orderedMeals);
            let currency = await db.select('currency').from('users').where('id', '=', userId);
            currency = currency[0].currency;
            const oldMeals = await db.select('price', 'quantity').from('orderedmeals').where((builder: QueryBuilder) => {
                builder.where('orderdate', '>', today).where('userid', '=', userId)
            }).innerJoin('meals', 'orderedmeals.mealid', 'meals.id');
            const totalPriceNew = calculateOrderPrice(orderedM, meals);
            const totalPriceOld = calculateOrderPrice(oldMeals, oldMeals);
            const newCurrency = parseFloat(currency) + totalPriceOld;
            if (totalPriceNew > newCurrency) {
                res.status(400).json('not enought money');
            } else {
                db.transaction(async (trx: Transaction) => {
                    try {
                        await trx('orderedmeals')
                            .where((builder: QueryBuilder) => {
                                builder.where('orderdate', '>', today).where('userid', '=', userId)
                            })
                            .del()
                        currency = newCurrency - totalPriceNew;
                        const order: Array<Order> = await trx('orderedmeals')
                            .insert(orderedM)
                            .returning('*');
                        const updatedCurrency: Array<number> = await trx('users')
                            .where('id', '=', userId).update({
                                currency: currency
                            })
                            .returning('currency')
                        const userOrder: UserOrder = {
                            currency: updatedCurrency[0],
                            orderedMeals: order
                        }
                        res.json(userOrder);
                        trx.commit;
                    } catch (err) {
                        res.status(400).json('error while making order')
                        console.log(err);
                        trx.rollback
                    }
                })
            }
        } catch (err) {
            console.log(err);
            res.status(400).json("bad request");
        }
    } else {
        res.status(400).json('empty order');
    }
}

const handleOrdersGet = async (req : Request, res : Response, db : any) =>{
    const today = currentDay();
    const param = req.query.param;
    try {
        const orders = await db.select('*').from('orderedmeals').where('orderdate', '>', today);
        const groupedOrders = await groupOrders(orders, param);
        res.json(groupedOrders);
    } catch (err) {
        console.log(err);
        res.status(400).json('cannot get orders'); 
    }
}

const groupOrders = (orders : any, param : string) =>{
    return new Promise((resolve, reject) =>{
        const groupedOrders : any = [];
        const params = new Set();
        const ordersByParam = new Map();
        orders.forEach((order : any) => params.add(order[param]));
        params.forEach(id => {
            ordersByParam.set(id, orders.filter((order : any) => {return order[param] === id}));
        });
        const iterator = ordersByParam.keys();
        for(let order = iterator.next(); order.done !== true; order = iterator.next()){
            const id = order.value;
            if(param === 'userid'){
                groupedOrders.push({
                    userid: id,
                    orders: ordersByParam.get(id)
                })
            } 
            else if(param === 'mealid'){
                groupedOrders.push({
                    mealid: id,
                    orders: ordersByParam.get(id)
                })
            }
        }
        resolve(groupedOrders);
    })
    
}

// const getOrderInfo = (userid, orderedMeals, db) =>{
//     //TODO change to use promise
//     const orderinfo = {};
//     const mealIds = getMealIdList(orderedMeals);
//     db.select('price').from('meals').where('id', mealIds)
//     .then(meals => {
//         db.select('currency').from('users').where('id','=',userid)
//         .then(currency =>{
//             orderinfo.currency = currency[0].currency;
//             orderinfo.meals = meals;
//             return orderinfo
//         })
//     })
// }

const getMealIdList = (orderedMeals : Array<OrderedMeal>) : Array<number> =>{
    return orderedMeals.map((meal : OrderedMeal) =>{
        return meal.mealid;
    });
}

const createOrder = (userId : number, orderedMeals : Array<OrderedMeal>) : Array<Order> =>{
     return orderedMeals.map((meal : OrderedMeal) => {
        return {
            ...meal,
            userid: userId,
            orderdate: new Date()
        }
    });
}

const calculateOrderPrice = (orderedMeals : Array<OrderedMeal>, meals : Array<Meal>) =>{
    return orderedMeals.reduce((prev : number, meal : OrderedMeal , index : number) => {
        return prev + meals[index].price * meal.quantity;
    }, 0);
}

const currentDay = () => {
    const today : Date = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    return today;
}

module.exports = {
    handleOrderMake,
    handleOrderDelete,
    handleOrdersGet,
    handleOrderUpdate
}