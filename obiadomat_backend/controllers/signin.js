const handleSignin = (req, res, db, bcrypt) =>{
    const {email, password} = req.body;
    db.select('*').from('login').where('email', '=', email)
    .then(user =>{
        const isValid = bcrypt.compareSync(password, user[0].password);
        if(isValid){
            return db.select('*').from('users').where('id', '=', user[0].id)
            .then(user => res.json(user[0]))
            .catch(err => {res.status(400).json('unable to get user');
                console.log(err);
            })
        } else {
            res.status(400).json('wrong credencials');
        }
    })
    .catch(err => {
        res.status(400).json('error getting user');
        console.log(err);
    })
};

module.exports = {
    handleSignin
}
