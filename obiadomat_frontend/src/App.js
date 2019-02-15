import React, { Component } from 'react';
import Meals from './Meals';
import Order from './Order';
class App extends Component {
  render() {
    return (
      <div className="App">
        <Meals />
        <Order />
      </div>
    );
  }
}

export default App;
