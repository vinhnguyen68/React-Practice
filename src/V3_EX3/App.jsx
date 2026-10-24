import { useState } from 'react';
import './App.css';

function Button({ children, onClick, className }) {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function AlertBox({ onConfirm, onCancel }) {
  return (
    <div className="alert-box">
      <h2>Warning!</h2>
      <p>Are you sure you want to activate this mode?</p>
      <Button onClick={onConfirm} className="confirm-btn">Confirm</Button>
      <Button onClick={onCancel} className="cancel-btn">Cancel</Button>
    </div>
  );
}


function App() {
  const [mode, setMode] = useState("idle");

  return (
    <>
      {mode === "idle" && (
        <button className="action-btn" onClick={() => setMode("asking")}>
          Activate
        </button>
      )}

      {mode === "asking" && (
        <div className="alert-box">
          <h2>Warning!</h2>
          <p>Are you sure you want to activate this mode?</p>
          <button className="confirm-btn" onClick={() => setMode("activated")}>
            Confirm
          </button>
          <button className="cancel-btn" onClick={() => setMode("idle")}>
            Cancel
          </button>
        </div>
      )}

      {mode === "activated" && (
        <h3 className="success-message">Mode Activated!</h3>
      )}
    </>
  );
}

export default App;