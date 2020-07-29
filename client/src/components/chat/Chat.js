import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";

//  Import action
import { userMessage, sendMessage } from "../../actions/watson";

import { nodeValues } from "../../constants/constants";

const Chat = ({ chat, userMessage, sendMessage }) => {
  // Handle Users Message
  const [message, setMessage] = useState("");
  const endOfMessages = useRef(null);

  const scrollToBottom = () => {
    endOfMessages.current.scrollIntoView({ behavior: "smooth" });
  };

  const checkMessage = (value) => {
    return (
      value &&
      value.type == "bot" &&
      /^[Setting]*[a-zA-Z ]*[to][a-zA-Z ]*$/.test(value.message) == true
    );
  };

  const sendRequestToUpdate = (value) => {
    var message = null;
    var regex = /^([Setting ])*([a-zA-Z]*)[\s](to)[\s]([a-zA-Z]*)$/;
    message = value.message.replace(regex, '{"key": "$2", "value": "$4"}');
    // message.key = value.message.sub;
    console.log(message);
    message = JSON.parse(message);
    message.nodeValue = nodeValues[message.key];
    if (message.nodeValue) {
      console.log("sending POST request");
    }
    console.log(message);
    console.log("Send POST request to update the preference");
  };
  useEffect(scrollToBottom, [chat]);

  useEffect(() => {
    if (checkMessage(chat[chat.length - 1])) {
      sendRequestToUpdate(chat[chat.length - 1]);
    }
  }, [chat]);

  //  Function that handles user submission
  const handleClick = async (e) => {
    const code = e.keyCode || e.which;

    if (code === 13) {
      // console.log(message);
      userMessage(message);
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="chat">
      <h1>Chatty the Chatbot</h1>
      {/* Handle Messages */}
      <div class="historyContainer">
        {chat.length === 0
          ? ""
          : chat.map((msg) => <div className={msg.type}>{msg.message}</div>)}
        <div ref={endOfMessages}></div>
      </div>
      {/* Input Box */}
      <input
        id="chatBox"
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleClick}
        value={message}
      ></input>
    </div>
  );
};
const mapStateToProps = (state) => ({
  chat: state.watson.messages,
});

export default connect(mapStateToProps, { userMessage, sendMessage })(Chat);
