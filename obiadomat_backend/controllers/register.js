const handleRegister = (req, res, db, bcrypt) =>{
    const {email, password, firstname, lastname} = req.body;
    if(email && password && firstname && lastname){
        console.log(password);
        const hash = bcrypt.hashSync(password);
        db.transaction(trx =>{
            trx.insert({
                email: email,
                password: hash
            })
            .into('login')
            .returning('id')
            .then(id =>{
                return trx.insert({
                    id: id[0],
                    firstname: firstname,
                    lastname: lastname,
                    currency: 0
                })
                .into('users')
                .returning('*')
                .then(user =>{
                    res.json(user[0]);
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => {
            res.status(400).json('unable to register');
        })
    }
    else{
        res.status(400).json('wrong user data');
    }
}

const validateUserCredencials = (credencials) =>{
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