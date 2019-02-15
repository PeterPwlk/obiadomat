import {MAKE_ORDER_PENDING,
        MAKE_ORDER_SUCCESS,
        MAKE_ORDER_FAILED} from './constants';

export const makeOrder = ({user,orderedMeals}) => (dispatch) =>{
    dispatch({type: MAKE_ORDER_PENDING});
    console.log(user);
    console.log(orderedMeals);
    fetch('http://localhost:3000/order',{
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            userId: user,
            orderedMeals: orderedMeals
        })
    })
    .then(res => res.json())
    .then(data => dispatch({type: MAKE_ORDER_SUCCESS, payload: data.orderedMeals}))
    .catch(err => dispatch({type: MAKE_ORDER_FAILED, payload: err}));
}