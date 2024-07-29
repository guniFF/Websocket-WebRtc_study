import React, { useState, useEffect } from "react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";

const APPLICATION_SERVER_URL = "http://localhost:8080/api";

function App() {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const OV = new OpenVidu();
    const mySession = OV.initSession();

    mySession.on("streamCreated", (event) => {
      const subscriber = mySession.subscribe(event.stream, undefined);
      setSubscribers((oldSubscribers) => [...oldSubscribers, subscriber]);
    });

    mySession.on("signal:chat", (event) => {
      setMessages((oldMessages) => [...oldMessages, event.data]);
    });

    setSession(mySession);

    axios.post(`${APPLICATION_SERVER_URL}/sessions`).then((response) => {
      const sessionId = response.data.sessionId;

      axios
        .post(`${APPLICATION_SERVER_URL}/sessions/${sessionId}/connections`)
        .then((response) => {
          const token = response.data.token;

          mySession.connect(token, { clientData: "User" }).then(() => {
            const publisher = OV.initPublisher(undefined); // 여기서 OV.initPublisher 사용
            mySession.publish(publisher);
            setPublisher(publisher);
          });
        });
    });
  }, []);

  const sendMessage = () => {
    session.signal({
      data: message,
      to: [],
      type: "chat",
    });
    setMessage("");
  };

  return (
    <div>
      <div id="video-container">
        {publisher && <div id="publisher">{publisher.element}</div>}
        {subscribers.map((sub, i) => (
          <div key={i} id="subscriber">
            {sub.element}
          </div>
        ))}
      </div>
      <div id="chat-container">
        <div id="message-area">
          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
