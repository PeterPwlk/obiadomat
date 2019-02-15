import {REQUEST_MEALS_PENDING,
        REQUEST_MEALS_SUCCESS,
        REQUEST_MEALS_FAILED,
        ADD_MEAL_TO_ORDER, 
        CHANGE_QUANTITY} from './constants';


const initialStateMeals = {
    isPending: false,
    meals: [],
    error: ''
}

export const requestMeals = (state = initialStateMeals, action = {}) =>{
    switch(action.type){
        case REQUEST_MEALS_PENDING:
            return {...state, isPending: true}
        case REQUEST_MEALS_SUCCESS:
            return {...state, meals: action.payload, isPending: false}
        case REQUEST_MEALS_FAILED:
            return{...state, error: action.payload, isPending: false}
        default:
            return state;
    }
}

const initialStateMealsToOrder = {
    mealsToOrder: []
}

export const addMealToOrder = (state = initialStateMealsToOrder, action = {}) =>{
    switch(action.type){
        case ADD_MEAL_TO_ORDER:
            if(state.mealsToOrder.length > 0){
                const ids = state.mealsToOrder.map(meal =>{ return meal.meal});
                if(ids.includes(action.payload)){
                    return {...state, 
                        mealsToOrder: state.mealsToOrder.map(meal =>
                            (meal.meal === action.payload)
                            ?{...meal,toggle: !meal.toggle}
                            :meal)}
                }
            }
            return {...state, mealsToOrder: [...state.mealsToOrder,{meal: action.payload,toggle: true,quantity: 1}]}
        case CHANGE_QUANTITY:
            if(state.mealsToOrder.length > 0){
                const ids = state.mealsToOrder.map(meal =>{ return meal.meal});
                if(ids.includes(action.meal)){
                    return {...state, 
                        mealsToOrder: state.mealsToOrder.map(meal => 
                            (meal.meal === action.meal)
                            ?{...meal, quantity: parseInt(action.payload)}
                            :meal
                        )}
                }
            }
            return {...state, mealsToOrder: [...state.mealsToOrder,{meal: action.meal,quantity: parseInt(action.payload),toggle: false}]}
        default: 
            return state;
    }
}