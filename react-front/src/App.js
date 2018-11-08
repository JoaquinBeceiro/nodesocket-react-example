import React, { Component } from 'react';
import './App.css';
import socketIOClient from "socket.io-client";
import Notifications, {notify} from 'react-notify-toast';

class App extends Component {

  state = {
    response: false,
    endpoint: "http://127.0.0.1:4001",
    connections: [],
    connectionId: '',
    myName: '',
  };

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    
    socket.on("date", data => this.setState({ response: data }));

    const name = prompt("Enter user name")

    this.setState({
      myName: name
    })

    socket.emit( 'nClient', name )

    socket.on("connectionId", id => {
      this.setState({
        connectionId: id
      })
    })

    socket.on("connections", clients => {
      this.setState({
        connections: clients
      })
    })

    socket.on("newConnection", client => {
      this.setState( prevState => ({
        connections: [...prevState.connections, client]
      }))
      notify.show(`New connection: ${client['name']}`,"success");
    })

    socket.on("removeConnection", client => {
      notify.show(`Disconnected: ${client[0]['name']}`,"error");
    })
  }

  render() {
    const { response, connections, connectionId, myName } = this.state;
    return (
      <div style={{ textAlign: "center" }}>
        <Notifications />
        <h1>{myName}</h1>
        {response
          ? <p>
              Date: <strong>{response}</strong>
            </p>
          : <p>Loading...</p>}

          <h3>Clients: { connections.length }</h3>
          <ul>
          {
            connections &&
            connections.map( (data, i) => {
              return (
                <li key={i}>{i} : 
                  { data.id === connectionId ? <strong>({data.id}) {data.name}</strong> :
                  `(${data.id}) - ${data.name}` }
                </li>
                )
            })
          }
          </ul>
      </div>
    );
  }
}

export default App;