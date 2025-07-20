"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = io();

    // Receive messages
    socketRef.current.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() === "") return;

    // Ensure socket is connected before emitting
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("message", input);
      setMessages((prev) => [...prev, `You: ${input}`]);
      setInput("");
    } else {
      console.warn("Socket not connected yet.");
    }
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-2">Real-time Chat</h2>

      <div className="mb-2 h-48 overflow-y-auto border p-2 rounded bg-gray-100">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1 text-sm text-black">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded p-1"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
