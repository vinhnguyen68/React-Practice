import { useState, useReducer, useRef, useContext, createContext, useImperativeHandle,
    useEffect,
 } from 'react';

function Demo({name, desc}){
    return (
        <>
            <h3>{name}</h3>
            <p>{desc}</p>
        </>
    )
}

const INFO = [
    {name : "useState", desc : "Store a value and re-render when it changes."},
    {name: "useReducer", desc : "Manage state with a reducer when updates follow rules."},
    {name: "useRef", desc: "Point at a DOM element, or keep a value without re-rendering."},
    {name: "useContext", desc: "Read a value provided by a parent component."},
    {name: "useImperativeHandle", desc: "Choose which methods a child exposes through its ref."},
    {name: "useEffect", desc: "Run side effects after render, with cleanup."}
]



// State hooks

// Use state
function UseStateDemo(){
    const [count, setCount] = useState(0)
    return (
        <>
            <Demo {...INFO[0]}/>
            <button onClick = {() => setCount(count - 1)}>-</button> Count: {count} {" "}
            <button onClick = {() => setCount(count + 1)}>+</button>
        </>
    )
}


// User Reducer
// Similar to use state, but can control multiple state
function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1, lastAction: "INCREMENT" };
    case "decrement":
      return { count: state.count - 1, lastAction: "DECREMENT" };
    case "reset":
      return { count: 0, lastAction: "RESET" };
    default:
      return state;
  }
}

function UseReducerDemo(){
    const [state, dispatch] = useReducer(counterReducer, {count: 0, lastAction: "none"});
    return(
        <>
        <Demo {...INFO[1]}/>
        <p>
            Count: {state.count} (last action: {state.lastAction})
        </p>
        <button onClick = {() => dispatch({type: "increment"})}>Increment</button>
        <button onClick = {() => dispatch({type: "decrement"})}>Decrement</button>
        <button onClick = {() => dispatch({type: "reset"})}>Reset</button>
        <p>==========================================================</p>
        </>
    )
}





// 1. CREATE the shared variable (default "light")
const ThemeContext = createContext("light");

function Grandchild() {
  // 3. READ the shared variable
  const themeFromContext = useContext(ThemeContext);

  const style = themeFromContext === "dark"
    ? { background: "black", color: "white" }
    : { background: "white", color: "black" };

  return <p style={style}>Grandchild: {themeFromContext}</p>;
}

function UseContextDemo() {
  const [appTheme, setAppTheme] = useState("dark");

  return (
    // 2. SET the shared variable for everything inside
    <ThemeContext value={appTheme}>
      <button onClick={() => setAppTheme(appTheme === "dark" ? "light" : "dark")}>
        Toggle
      </button>
      <Grandchild />
    </ThemeContext>
  );
}


// Context hooks


// User ref
// Has 2 use case
// 1: Reach HTML element like focus, scroll, playvideo
// 2: Remember value without rerendering
function UseRefDemo(){
    const inputRef = useRef(null)
    const clickRef = useRef(0)
    const [count, setCount] = useState(0)

    function handleFocus(){
        inputRef.current.focus()
        clickRef.current += 1
    }
    return (
        <>
        <Demo {...INFO[2]}/>
        <p>
            <input ref = {inputRef} placeholder = "Type something.."></input>
            <button onClick = {() => handleFocus()}>Focus</button>
        </p>
        <p>
            Focus clicks on screen: {count}
            <button onClick={() => setCount(clickRef.current)}>Read ref</button>
        </p>
        </>
    )
}

// useImperativeHandler
function FancyInput({ref}){
    const inputRef = useRef(null)
    useImperativeHandle(ref, () => ({
        focus(){
            inputRef.current.focus()
        },
        clear(){
            inputRef.current.value = "";
            inputRef.current.focus();
        }
    }));
    return <input ref = {inputRef} defaultValue = "hello"/>
}


function UseImperativeHandleDemo(){
    const fancyRef = useRef(null)
    return (
        <p>
                <Demo {...INFO[4]}/>
                <FancyInput ref = {fancyRef} />
                <button onClick = {() => fancyRef.current.focus()}>ref.focus()</button>
                <button onClick = {() => fancyRef.current.clear()}>ref.clear()</button>
        </p>
    )
}


// Effect hook
// useEffect
function UseEffectDemo(){
    const [seconds, setSeconds] = useState(0)
    const [running, setRunning] = useState(true)

    useEffect(() => {
    // Paused? Then don't start a timer.
    if (running === false) {
        return;
    }

    // Add 1 to seconds
    function addOneSecond() {
        setSeconds((currentSeconds) => currentSeconds + 1);
    }

    // Start a timer: call addOneSecond every 1000 ms
    const timerId = setInterval(addOneSecond, 1000);

    // Cleanup: how to stop this timer
    function stopTimer() {
        clearInterval(timerId);
    }

    // Give React the cleanup so it can stop the timer later
    return stopTimer;

    }, [running]); // Re-run this whole block only when `running` changes

    return (
        <>
        <p>
            Seconds: {seconds} 
            <button onClick = {() => setRunning(!running)}>{running ? "Pause" : "Resume"}</button>
            <button onClick  = {() => setSeconds(0)}>Reset</button>
        </p>
        </>
    )
}


function App(){
    return (
        <>
            <h2>State hooks</h2>
            <UseStateDemo/>
            <UseReducerDemo/>

            <h2>Ref hooks</h2>
            <UseRefDemo/>
            <UseImperativeHandleDemo/>

            <h2>Context hooks</h2>
            <UseContextDemo/>

            <h2>Use effect</h2>
            <UseEffectDemo/>

        </>
    )
}

export default App