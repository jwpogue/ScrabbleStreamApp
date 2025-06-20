// // import React from "react";
// import "./App.css";
// import BoardEditor from "./components/BoardEditor";



// export function App() {

//     return (
//        <div className="App">
//         <h1>Scrabble Board Editor</h1>
//         <BoardEditor />
//        </div>
//     );
// }

// export default App;


import "./App.css";
import FrameEditorManager from "./components/FrameManager";

export default function App() {
  return (
    <div className="App">
      <FrameEditorManager />
    </div>
  );
}
