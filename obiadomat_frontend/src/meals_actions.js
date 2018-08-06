import {REQUEST_MEALS_PENDING,
        REQUEST_MEALS_SUCCESS,
        REQUEST_MEALS_FAILED,
        ADD_MEAL_TO_ORDER,
        CHANGE_QUANTITY} from './constants';

export const requestMeals = () => (dispatch) =>{
    dispatch({type: REQUEST_MEALS_PENDING});
    fetch('http://localhost:3000/meals', {
        method: 'get',
        headers: {'Content_Type': 'application/json'}
    })
    .then(res => res.json())
    .then(data => dispatch({type: REQUEST_MEALS_SUCCESS, payload: data}))
    .catch(err => dispatch({type: REQUEST_MEALS_FAILED, payload: err}));
}

export const addMealToOrder = (meal) =>({
    type: ADD_MEAL_TO_ORDER,
    payload: meal
});

export const changeQuantity = ({quantity,meal}) =>({
    type: CHANGE_QUANTITY,
    payload: quantity,
    meal: meal
});