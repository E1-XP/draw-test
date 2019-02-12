import React, { Component } from "react";
import { Provider } from "react-redux";

import { store } from "./store";
import * as actions from "./actions";

import { NavBar } from "./components/navbar";
import { Chat } from "./components/chat";
import { Canvas } from "./components/canvas";

class App extends Component {
  componentDidMount() {
    const name = prompt("name?");
    if (!name) throw new Error("No name provided");

    store.dispatch(actions.setName(name));
  }

  render() {
    return (
      <Provider store={store}>
        <NavBar />
        <Container className="mt-2">
          <Chat />
          <Canvas />
        </Container>
      </Provider>
    );
  }
}

document.body.style.background = "#343a40";

export default App;
