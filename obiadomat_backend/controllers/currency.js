const handleCurrencyUpdate = (req, res, db) =>{
    const {id, addedCurrency} = req.body;
    db.select('currency').from('users').where('id', '=', id)
    .then(currency => {
        const newCurrency = parseFloat(currency[0].currency)+parseFloat(addedCurrency);
        db('users').update('currency', newCurrency)
        .returning('currency')
        .then(newCurrency => {
            res.json(newCurrency[0]);
        })
        .catch(err => {
            res.status(400).json('cannot add currency');
            console.log(err);
        })
    })
}

module.exports = {
    handleCurrencyUpdate
}