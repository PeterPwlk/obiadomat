import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {requestMeals, addMealToOrder} from './meals_reducers';
import {composeWithDevTools} from 'redux-devtools-extension';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-bootstrap';


const rootReducer = combineReducers({requestMeals,addMealToOrder});
const store = createStore(rootReducer,composeWithDevTools(applyMiddleware(thunkMiddleware)));

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>, document.getElementById('root'));
registerServiceWorker();
