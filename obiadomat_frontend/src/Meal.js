import React from 'react';
import {FormControl, Checkbox} from 'react-bootstrap';

const Meal = ({id,number, mealname, description, price, addMealToOrder, quantity, changeQuantity}) =>{
    return (
        <tr key={id}> 
            <td>{number}</td>
            <td>{mealname}</td>
            <td>{description}</td>
            <td>{price}</td>
            <td><FormControl type="number" onChange={changeQuantity} number={number} value={quantity}/></td>
            <td><Checkbox 
                        onChange={addMealToOrder}
                        value={number}>Zamów</Checkbox></td>
        </tr>
    )
}

export default Meal;