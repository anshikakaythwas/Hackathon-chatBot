import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import axios from "axios";

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

  const updatePreference = (message) => {
    console.log("inside updatePreference", message);
    const body = { input: message };
    axios
      .post(
        "http://localhost:8080/CPWECompletion/servlet/PreferenceTreeHandler2",
        null,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            nodeName: message.nodeName,
            updateValue: message.updateValue,
          },
        }
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const sendRequestToUpdate = (value) => {
    var message = null;
    var regex = /^([Setting ])*([a-zA-Z]*)[\s](to)[\s]([a-zA-Z]*)$/;
    message = value.message.replace(
      regex,
      '{"key": "$2", "updateValue": "$4"}'
    );
    message = JSON.parse(message);
    message.nodeName = nodeValues[message.key] + "/" + message.key;

    if (message.nodeName) {
      updatePreference(message);
      console.log("sending POST request");
      // updatePreference(message);
    }
    //console.log(message);
    //console.log("Send POST request to update the preference");
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
      <h1>Chatbot for Preferences</h1>
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
        placeholder="Type something..."
      ></input>
    </div>
  );
};
const mapStateToProps = (state) => ({
  chat: state.watson.messages,
});

export default connect(mapStateToProps, { userMessage, sendMessage })(Chat);
