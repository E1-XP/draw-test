import React, { useEffect } from "react";
import { Provider } from "react-redux";

import Container from "react-bootstrap/Container";

import { store } from "./store";
import * as actions from "./actions";

import { socketService } from "./services/socket";

import { NavBar } from "./components/navbar";
import { Chat } from "./components/chat";
import { Canvas } from "./components/canvas";

const App = () => {
  useEffect(() => {
    const name = prompt("name?");
    if (!name) throw new Error("No name provided");

    store.dispatch(actions.setName(name));
    // store.dispatch(actions.startApp());
    socketService.start();
  }, []);

  return (
    <Provider store={store}>
      <NavBar />
      <Container className="mt-2">
        <Chat />
        <Canvas />
      </Container>
    </Provider>
  );
};

document.body.style.background = "#343a40";

export default App;
