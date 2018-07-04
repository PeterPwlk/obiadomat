const handleMealsGet = (req, res, db) =>{
    db.select('*').from('meals')
    .then(meals => {
        if(meals.length){
            res.json(meals);
        } else{
            res.status(400).json('no meals found');
        }
    })
    .catch(err => {
        res.status(400).json('error getting meals');
        console.log(err);
    })
}

const handleMealInsert = (req, res, db) =>{
    const {name, desc, price, number} = req.body;
    if(name && desc && price && number){
        const priceCon = parseFloat(price);
        const numberCon = parseInt(number);
        db('meals').insert({
            mealname: name,
            description: desc,
            price: priceCon,
            number: numberCon
        })
        .returning('*')
        .then(meals => res.json(meals))
        .catch(err => {
            res.status(400).json('error inserting meal');
            console.log(err);
        })
    } else {
        res.status(400).json('meal information not filled correctly');
    }
}

const handleMealUpdate = (req, res, db) =>{
    const {name, desc, price, number} = req.body;
    const {id} = req.params;
    if(id && name && desc && price && number){
        db('meals').where('id', '=', id)
        .update({
            mealname: name,
            description: desc,
            price: price,
            number: number
        })
        .returning('*')
        .then(meals => res.json(meals))
        .catch(err => {
            res.status(400).json('cannot modify meal');
            console.log(err);
        })
    } else {
        res.status(400).json('meal information not correct');
    }
}

const handleMealDelete = (req, res, db) =>{
    const {id} = req.params;
    if(id){
        db('meals').where('id', '=', id)
        .del()
        .returning('*')
        .then(meals => res.json(meals))
        .catch(err => {
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