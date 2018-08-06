import React,{Component} from 'react';
import {requestMeals, addMealToOrder, changeQuantity} from './meals_actions';
import { connect } from 'react-redux';
import {Table} from 'react-bootstrap';
import Meal from './Meal';

const mapStateToProps = state =>{
    return{
        mealsToOrder: state.addMealToOrder.mealsToOrder,
        meals: state.requestMeals.meals,
        isPending: state.requestMeals.isPending,
        error: state.requestMeals.error
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onRequestMeals: () => dispatch(requestMeals()),
        onAddMealToOrder: (event) => dispatch(addMealToOrder(event.target.value)),
        onChangeQuantity: (event) => dispatch(changeQuantity({quantity: event.target.value, meal: event.target.getAttribute("number")}))
    }
}

class Meals extends Component {
    componentDidMount(){
        this.props.onRequestMeals();
    }
    render(){
        const {meals, onAddMealToOrder, mealsToOrder, onChangeQuantity} = this.props;
        const mealTable = meals.map(meal => {
            if(mealsToOrder.length > 0 ){
                const ordered = (mealsToOrder.find(ordered => parseInt(ordered.meal) === meal.number));
                return (<Meal 
                    key={meal.id}
                    id={meal.id}
                    number={meal.number}
                    mealname={meal.mealname}
                    description={meal.description}
                    price={meal.price}
                    quantity={(ordered)?ordered.quantity:0}
                    addMealToOrder={onAddMealToOrder}
                    changeQuantity={onChangeQuantity}/>
                    )
            }
            else{
                return (<Meal key={meal.id}
                id={meal.id}
                number={meal.number}
                mealname={meal.mealname}
                description={meal.description}
                price={meal.price}
                quantity={0}
                addMealToOrder={onAddMealToOrder}
                changeQuantity={onChangeQuantity}
           />)
            }
        })
        return(
            <div>
                <h1>Meals</h1>
                <Table striped bordered hover responsive>
                    <thead>
                    <tr>
                        <th>Numerek</th>
                        <th>Nazwa</th>
                        <th>Opis</th>
                        <th>Cena</th>
                        <th>Ilość</th>
                        <th>Do Zamówienia</th>
                    </tr>
                    </thead>
                    <tbody>
                    {mealTable}
                    </tbody>
                </Table>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Meals);