const handleOrderMake = (req, res, db) =>{
    const {userId, orderedMeals} = req.body;
    if(userId && orderedMeals){
        const mealIds = getMealIdList(orderedMeals); 
        db.select('*').from('meals').whereIn('id', mealIds)
            .then(meals => {
                const orderedM = createOrderObject(userId, orderedMeals);
                db.select('currency').from('users').where('id', '=', userId)
                    .then(currency => {
                        currency = currency[0].currency;
                        console.log('order currency: ' + currency);
                        db.transaction(trx => {
                                const totalPrice = calculateOrderPrice(orderedM, meals);
                                console.log(totalPrice);
                                if (totalPrice > currency) {
                                    res.status(400).json('not enought money to order');
                                } else {
                                    currency = currency - totalPrice;
                                    console.log('order currency after -: ' + currency);
                                    trx('orderedmeals').insert(orderedMeals)
                                        .returning('*')
                                        .then(order => {
                                            return trx('users').where('id', '=', userId).update({
                                                    currency: currency
                                                })
                                                .returning('currency')
                                                .then(currency => {
                                                    order = {
                                                        currency: currency[0],
                                                        orderedMeals: order
                                                    }
                                                    res.json(order);
                                                })
                                                .catch(err => res.status(400).json('error while making order'))
                                        })
                                        .then(trx.commit)
                                        .catch(trx.rollback);
                                }
                            })
                            .catch(err => res.status(400).json('cannot make order'))
                    })
                    .catch(err => res.status(400).json('cannot get users'))
            })
            .catch(err => {
                res.status(400).json('cannot get meals');
                console.log(err);
            })
    } else {
        res.status(400).json('empty order');
    }
    
}

const handleOrderDelete = (req, res, db) =>{
    //TODO add currency back to user after deletion using transaction
    const {userId, orderedMeals} = req.body;
    const today = currentDay();
    const mealIds = getMealIdList(orderedMeals); 
    db.select('*').from('meals').whereIn('id', mealIds)
        .then(meals => {
            //const orderedM = createOrderObject(userId, orderedMeals);
            db.select('currency').from('users').where('id', '=', userId)
                .then(currency => {
                    currency = currency[0].currency;
                    console.log('del currency: ' + currency);
                    const totalPrice = calculateOrderPrice(orderedMeals, meals);
                    console.log('del price: ' + totalPrice);
                    db.transaction(trx =>{
                        trx('orderedmeals').where((builder) =>{
                            builder.where('orderdate', '>', today).where('userid', '=', userId)
                        })
                        .del()
                        .then(() =>{
                            const newCurrency = parseFloat(currency) + parseFloat(totalPrice);
                            console.log('del currency after +: ' + newCurrency);
                            return trx('users').where('id', '=', userId).update({
                                currency: newCurrency
                            })
                            .returning('currency')
                            .then(currency => {
                                order = {
                                    currency: currency[0],
                                    orderedMeals: {}
                                }
                                res.json(order);
                            })
                            .catch(err => res.status(400).json('error while deleting order'))
                        })
                        .then(trx.commit)
                        .catch(trx.rollback)
                    })
                    .catch(err => {
                        res.status(400).json('cannot delete order');
                        console.log(err);
                    })

                })
                .catch(err => {
                    res.status(400).json('cannot get users');
                    console.log(err)
                })
            })
        .catch(err => res.status(400).json('cannot get meals'))
}

const handleOrderUpdate = (req, res, db) =>{
    const {userId, orderedMeals} = req.body;
    //TODO export currentDay to different file
    const today = currentDay();
    if(userId && orderedMeals){
        db.transaction(trx =>{
            trx('orderedmeals').where((builder) =>{
                builder.where('orderdate', '>', today).where('userId', '=', id)
            })
            .del()
            .then(() =>{
                /* TODO 
                    make selection into a method to avoid code duplication
                */
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })    
    } else {
        res.status(400).json('empty order');
    }
}

const handleOrdersGet = (req, res, db) =>{
    const today = currentDay();
    const param = req.query.param;
    db.select('*').from('orderedmeals').where('orderdate', '>', today)
        .then(orders => {
            const groupedOrders = groupOrders(orders, param);
            console.log(groupedOrders);
            res.json(groupedOrders);
        })
        .catch(err => {
            res.status(400).json('cannot get orders');
            console.log(err);
        })
}

const groupOrders = (orders, param) =>{
    const groupedOrders = [];
    const params = new Set();
    const ordersByParam = new Map();
    orders.forEach(order => params.add(order[param]));
    params.forEach(id => {
        ordersByParam.set(id, orders.filter(order => {return order[param] === id}));
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
    return groupedOrders;
}

const getOrderInfo = (userid, orderedMeals, db) =>{
    /*
    TODO change to use promise
    */
    const orderinfo = {};
    const mealIds = getMealIdList(orderedMeals);
    db.select('price').from('meals').where('id', mealIds)
    .then(meals => {
        db.select('currency').from('users').where('id','=',userid)
        .then(currency =>{
            orderinfo.currency = currency[0].currency;
            orderinfo.meals = meals;
            return orderinfo
        })
    })
}

const getMealIdList = (orderedMeals) =>{
    return orderedMeals.map((meal) =>{
        return parseInt(meal.mealid);
    });
}

const createOrderObject = (userId, orderedMeals) =>{
     return orderedMeals.map((meal) => {
        meal.userid = userId;
        meal.orderdate = new Date();
        return meal;
    });
}

const calculateOrderPrice = (orderedMeals, meals) =>{
    return orderedMeals.reduce((prev, meal, index) => {
        return prev + parseFloat(meals[index].price) * parseInt(meal.quantity);
    }, 0);
}

const currentDay = () => {
    today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    return today;
}

module.exports = {
    handleOrderMake,
    handleOrderDelete,
    handleOrdersGet
}