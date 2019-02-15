import {MAKE_ORDER_PENDING,
        MAKE_ORDER_SUCCESS,
        MAKE_ORDER_FAILED} from './constants'

const initialStateOrder = {
    isPending: false,
    order: [],
    error: ''
}

export const makeOrder = (state = initialStateOrder, action = {}) =>{
    switch(action.type){
        case MAKE_ORDER_PENDING:
            return {...state, isPending: true}
        case MAKE_ORDER_SUCCESS:
            return {...state, order: action.payload, isPending: false}
        case MAKE_ORDER_FAILED:
            return {...state, error: action.payload, isPending: false}
        default:
            return state
    }
}