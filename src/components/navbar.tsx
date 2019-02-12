import * as React from "react";
import { connect } from "react-redux";

import { State } from "./../store";

import Navbar from "react-bootstrap/Navbar";

interface Props {
  username: string;
}

export const NavBar = connect(({ user }: State) => ({
  username: user.username
}))(({ username }: Props) => (
  <Navbar bg="primary" variant="dark">
    <Navbar.Brand href="#">TestApp</Navbar.Brand>
    <Navbar.Collapse>
      <Navbar.Text>
        Signed in as: <a href="#login">{username}</a>
      </Navbar.Text>
    </Navbar.Collapse>
  </Navbar>
));
