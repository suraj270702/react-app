import { useEffect, useState } from "react";
import "./App.css";
import Main from "./components/Main";
import { io } from "socket.io-client";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Main />
    </>
  );
}

export default App;
