import { useState } from 'react';
import './App.css';


function App(){
    const [isActive, setIsActive] = useState(false); 


    function handleToggle(click){
        if (isActive === false) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }

    return(
        <div className = "container">
            <p className = {isActive ? "active" : undefined}>Click vào em</p>
            <button onClick = {handleToggle}>Toggle btn</button>
        </div>
    )
}

export default App