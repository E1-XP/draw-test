import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";

import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";

import { Message, State } from "./../store";
import { setMessage } from "./../actions";

interface Props {
  username: string;
  messages: Message[];
  setMessage: (v: Message) => void;
}

export const Chat = connect(
  ({ chat, user }: State) => ({
    messages: chat.messages,
    username: user.username
  }),
  { setMessage }
)(({ messages, setMessage, username }: Props) => {
  const [value, setValue] = React.useState("");
  const onChange = (e: any) => setValue(e.target.value);

  const handleClick = (e: any) => {
    setMessage({ text: value, author: username });
    setValue("");
  };

  return (
    <Card>
      <Card.Header>Chat</Card.Header>
      <Card.Body>
        <ListGroup>
          {messages.length ? (
            messages.map(({ text, author }) => (
              <ListGroup.Item key={text}>
                {text} - {author}
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>
              No messages found. Type one to begin chatting
            </ListGroup.Item>
          )}
        </ListGroup>
        <InputGroup>
          <FormControl
            placeholder="type message here..."
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            value={value}
            onChange={onChange}
          />
          <InputGroup.Append>
            <Button variant="outline-primary" onClick={handleClick}>
              Send
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Card.Body>
    </Card>
  );
});
