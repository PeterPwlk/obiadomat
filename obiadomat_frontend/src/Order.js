import React,{Component} from 'react';
import {makeOrder} from './order_actions'
import {connect} from 'react-redux';
import {Table,Button} from 'react-bootstrap';
import Meal from './Meal';

const mapStateToProps = state =>{
    return {
        meals: state.requestMeals.meals,
        mealsToOrder: state.addMealToOrder.mealsToOrder
    }
}

const mapDispatchToProps = (dispatch) =>{
    return {
        makeOrder: (user,order) => dispatch(makeOrder({user: user,orderedMeals:order}))
    }
}

class Order extends Component {

    toOrder = (meals, mealsToOrder,makeOrder) =>{
        const order = mealsToOrder
            .filter(ordered => ordered.toggle)
            .map(ordered => {
                const mealInfo = meals.find(meal => meal.number === parseInt(ordered.meal));
                return {
                    mealid: mealInfo.id,
                    quantity: ordered.quantity
                }
            });
        makeOrder(1,order);
    }

    render(){
        const {meals,mealsToOrder,makeOrder} = this.props; 
        const orderedMeals = mealsToOrder.map(ordered =>{
            if(ordered.toggle){
                const mealInfo = meals.find(meal => meal.number === parseInt(ordered.meal))
                return {...mealInfo, quantity:ordered.quantity}
            }
        })
        const orderedMealsTable = orderedMeals.map(ordered =>{
            if(ordered)
            return <Meal 
                key={ordered.id}
                id={ordered.id}
                number={ordered.number}
                mealname={ordered.mealname}
                price={ordered.price}
                description={ordered.description}
                quantity={ordered.quantity}
        />})
        if(!orderedMeals.length === 0 || !orderedMeals.every(meal => meal===undefined))
        return (
            <div>
                <h1>Order</h1>
                <Table>
                    <thead>
                        <tr>
                            <th>Numerek</th>
                            <th>Nazwa</th>
                            <th>Opis</th>
                            <th>Cena</th>
                            <th>Ilość</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderedMealsTable}
                    </tbody>
                </Table>
                <Button onClick={() => this.toOrder(meals,mealsToOrder,makeOrder)}>Zamów</Button>
            </div>
        )
        else
        return(
            <div>
                <h1>Order</h1>
                <h5>Zamówienie jest puste</h5>
            </div>
        )
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Order)