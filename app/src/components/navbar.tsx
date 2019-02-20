import * as React from "react";
import { connect } from "react-redux";

import { State } from "./../store";

import { socketService } from "./../services/socket";

import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

interface Props {
  username: string;
  isSocketConnected: boolean;
}

export const NavBar = connect(({ user, global }: State) => ({
  username: user.username,
  isSocketConnected: global.isSocketConnected
}))(({ username, isSocketConnected }: Props) => {
  const { start, closeSocket } = socketService;

  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand href="#">TestApp</Navbar.Brand>
        <Navbar.Collapse bsPrefix="navbar-collapse justify-content-end">
          <Navbar.Text className="mr-2">
            Signed in as: <a href="#login">{username}</a>
          </Navbar.Text>
          <Button
            variant={isSocketConnected ? "danger" : "light"}
            onClick={
              isSocketConnected
                ? closeSocket.bind(socketService)
                : start.bind(socketService)
            }
          >
            {isSocketConnected ? "Disconnect" : "Connect"}
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
});
