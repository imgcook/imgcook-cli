import React from 'react';
import './App.css';
import mods from './mods';

function App() {
  return (
    <div className="App">
      <div className="App-header">
        <img src="https://gw.alicdn.com/tfs/TB1YzajyNnaK1RjSZFtXXbC2VXa-200-64.png" alt="imgcook" />
      </div>
      {
        Object.keys(mods).length ? Object.keys(mods).map((modName) => {
          return React.createElement(mods[ modName ]);
        }) : <span>{'请在项目根目录执行 imgcook pull <moduleid> --path ./mods/'}</span>
      }
    </div>
  );
}

export default App;
