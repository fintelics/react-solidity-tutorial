import React, { Component } from 'react'
import TodosContract from "./contracts/Todos.json";
import getWeb3 from "./utils/getWeb3";

import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = { 
      todos: [],
      textToAdd: '',
      web3: null, 
      accounts: null, 
      contract: null 
    };
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TodosContract.networks[networkId];
      const instance = new web3.eth.Contract(
        TodosContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
      await this.getTodo();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleTextAreaChange = (event) => {
    this.setState({
      textToAdd: event.target.value
    });
  }

  addTodo = async () => {
    const { web3, accounts, contract, textToAdd } = this.state;
    await contract.methods.addTodo(web3.utils.asciiToHex(textToAdd)).send({ from: accounts[0] });
    const response = await contract.methods.getTodos().call();
    
    this.setState({ 
      todos: response.map(item => web3.utils.toAscii(item))
    });
  };

  getTodo = async () => {
    const { web3, contract } = this.state;
    const response = await contract.methods.getTodos().call();
    this.setState({ 
      todos: response.map(item => web3.utils.toAscii(item))
    });
  };

  renderTodos = () => {
    const todos = this.state.todos;
    return todos.map((todo, i) => {
      return (
        <li key={i}>{todo}</li>
      );
    })
  }

  render() {
    if (!this.state.web3) {
      return (
        <div> Loading web3 </div>
      );
    }
    return (
      <div className="App">
        <h1>Todo List</h1>
        <textarea id="textarea" cols={50} rows={3} value={this.state.textToAdd} onChange={this.handleTextAreaChange} />
        <button onClick={this.addTodo}>Add Todo</button>
        <ul>
          {this.renderTodos()}
        </ul>
      </div>
    );
  }
}


export default App
