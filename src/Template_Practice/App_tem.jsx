import {
  createContext,
  memo,
  useActionState,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useOptimistic,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Freeze the main thread on purpose, so slow work is easy to notice.
function slowDown(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // busy wait
  }
}

// Current time with milliseconds, e.g. "14:03:27.512".
// Shown on screen so you can tell when something re-rendered.
const stamp = () => new Date().toISOString().slice(11, 23);

// A list that is slow on purpose (~250ms per render), for
// useTransition and useDeferredValue.
const ITEMS = Array.from({ length: 10000 }, (_, i) => `item ${i + 1}`);

const SlowList = memo(function SlowList({ query }) {
  const matches = ITEMS.filter((item) => item.includes(query)).slice(0, 50);
  return (
    <ul>
      {matches.map((item) => (
        <SlowItem key={item} text={item} />
      ))}
    </ul>
  );
});

function SlowItem({ text }) {
  slowDown(5); // 50 items x 5ms = ~250ms
  return <li>{text}</li>;
}

/* ------------------------------------------------------------------ */
/* 1. useState                                                         */
/* ------------------------------------------------------------------ */

function UseStateDemo() {
  const [count, setCount] = useState(0);
  return (
    <p>
      <button onClick={() => setCount(count - 1)}>−</button> Count: {count}{" "}
      <button onClick={() => setCount(count + 1)}>+</button>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 2. useReducer                                                       */
/* ------------------------------------------------------------------ */

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

function UseReducerDemo() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0, lastAction: "none" });
  return (
    <>
      <p>
        Count: {state.count} (last action: {state.lastAction})
      </p>
      <button onClick={() => dispatch({ type: "increment" })}>Increment</button>{" "}
      <button onClick={() => dispatch({ type: "decrement" })}>Decrement</button>{" "}
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. useContext                                                       */
/* ------------------------------------------------------------------ */

const ThemeContext = createContext("light");

function UseContextDemo() {
  const [theme, setTheme] = useState("dark");
  return (
    <ThemeContext value={theme}>
      <button onClick={() => setTheme("light")}>Light</button>{" "}
      <button onClick={() => setTheme("dark")}>Dark</button>
      <Child />
    </ThemeContext>
  );
}

function Child() {
  // Child doesn't receive or pass any props.
  return <Grandchild />;
}

function Grandchild() {
  const theme = useContext(ThemeContext);
  return <p>Grandchild reads theme: {theme}</p>;
}

/* ------------------------------------------------------------------ */
/* 4. useRef                                                           */
/* ------------------------------------------------------------------ */

function UseRefDemo() {
  const inputRef = useRef(null); // idea 1: point at a DOM node
  const clicksRef = useRef(0); // idea 2: remember a value without re-rendering
  const [shown, setShown] = useState(0);

  function handleFocus() {
    inputRef.current.focus();
    clicksRef.current += 1; // changes, but the screen doesn't update
  }

  return (
    <>
      <p>
        <input ref={inputRef} placeholder="Type something…" /> <button onClick={handleFocus}>Focus</button>
      </p>
      <p>
        Focus clicks on screen: {shown} <button onClick={() => setShown(clicksRef.current)}>Read ref</button>
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. useImperativeHandle                                              */
/* ------------------------------------------------------------------ */

// In React 19, ref is a normal prop.
function FancyInput({ ref }) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    },
    clear() {
      inputRef.current.value = "";
      inputRef.current.focus();
    },
  }));
  return <input ref={inputRef} defaultValue="hello" />;
}

function UseImperativeHandleDemo() {
  const fancyRef = useRef(null);
  return (
    <p>
      <FancyInput ref={fancyRef} /> <button onClick={() => fancyRef.current.focus()}>ref.focus()</button>{" "}
      <button onClick={() => fancyRef.current.clear()}>ref.clear()</button>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 6. useEffect                                                        */
/* ------------------------------------------------------------------ */

function UseEffectDemo() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id); // cleanup: stop the old timer
  }, [running]);

  return (
    <p>
      Seconds: {seconds} <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Resume"}</button>{" "}
      <button onClick={() => setSeconds(0)}>Reset</button>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 7. useLayoutEffect                                                  */
/* ------------------------------------------------------------------ */

function MeasuredText({ mode }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  // Runs BEFORE the browser paints: you never see "0px".
  useLayoutEffect(() => {
    if (mode !== "layout") return;
    slowDown(500); // makes the difference easy to see
    setWidth(ref.current.offsetWidth);
  }, [mode]);

  // Runs AFTER the browser paints: you see "0px" first, then the real width.
  useEffect(() => {
    if (mode !== "effect") return;
    slowDown(500);
    setWidth(ref.current.offsetWidth);
  }, [mode]);

  return (
    <p>
      <span ref={ref}>This sentence measures its own width.</span> Measured: {width}px
    </p>
  );
}

function UseLayoutEffectDemo() {
  const [mode, setMode] = useState("layout");
  const [show, setShow] = useState(false);
  return (
    <>
      <p>
        <label>
          <input type="radio" checked={mode === "layout"} onChange={() => setMode("layout")} /> useLayoutEffect
        </label>{" "}
        <label>
          <input type="radio" checked={mode === "effect"} onChange={() => setMode("effect")} /> useEffect
        </label>{" "}
        <button onClick={() => setShow(!show)}>{show ? "Hide" : "Show"} text</button>
      </p>
      {show && <MeasuredText mode={mode} />}
      <p>Click Show in each mode. With useEffect you'll see "0px" for a moment first.</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 8. useInsertionEffect                                               */
/* ------------------------------------------------------------------ */

function UseInsertionEffectDemo() {
  const [color, setColor] = useState("teal");

  // Injects a <style> tag before React touches the DOM. This is how
  // CSS-in-JS libraries add their styles.
  useInsertionEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.hooks-plain-injected { color: ${color}; }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [color]);

  return (
    <>
      <p className="hooks-plain-injected">This text is colored by an injected rule: {color}</p>
      <button onClick={() => setColor(color === "teal" ? "purple" : "teal")}>Swap color</button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 9. useEffectEvent                                                   */
/* ------------------------------------------------------------------ */

// A fake chat server connection.
function createConnection() {
  let timer;
  let onConnected;
  return {
    on(handler) {
      onConnected = handler;
    },
    connect() {
      timer = setTimeout(() => onConnected?.(), 600);
    },
    disconnect() {
      clearTimeout(timer);
    },
  };
}

function UseEffectEventDemo() {
  const [roomId, setRoomId] = useState("general");
  const [theme, setTheme] = useState("dark");
  const [log, setLog] = useState([]);
  const addLog = (line) => setLog((l) => [...l.slice(-3), line]);

  // Reads the latest theme, but the effect doesn't depend on it.
  const onConnected = useEffectEvent(() => {
    addLog(`Connected to #${roomId} (theme: ${theme})`);
  });

  useEffect(() => {
    const connection = createConnection();
    connection.on(() => onConnected());
    addLog(`Connecting to #${roomId}…`);
    connection.connect();
    return () => {
      connection.disconnect();
      addLog(`Disconnected from #${roomId}`);
    };
  }, [roomId]); // only the room causes a reconnect

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
    addLog("Theme changed → no reconnect");
  }

  return (
    <>
      <p>
        Room:{" "}
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="general">#general</option>
          <option value="travel">#travel</option>
          <option value="music">#music</option>
        </select>{" "}
        <button onClick={toggleTheme}>Theme: {theme}</button>
      </p>
      <ul>
        {log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 10. useMemo                                                         */
/* ------------------------------------------------------------------ */

function countPrimes(limit) {
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count++;
  }
  return count;
}

// Slow on purpose (+300ms) so skipping it is noticeable.
function slowCountPrimes(limit) {
  slowDown(300);
  return { primes: countPrimes(limit), calculatedAt: stamp() };
}

function UseMemoDemo() {
  const [limit, setLimit] = useState(10000);
  const [note, setNote] = useState("");
  const [memoOn, setMemoOn] = useState(true);

  // Hooks can't be called conditionally, so useMemo always runs; the
  // checkbox only decides whether we USE its cached result.
  const cached = useMemo(() => slowCountPrimes(limit), [limit]);
  const result = memoOn ? cached : slowCountPrimes(limit);

  return (
    <>
      <label>
        <input type="checkbox" checked={memoOn} onChange={(e) => setMemoOn(e.target.checked)} /> Use useMemo
      </label>
      <p>
        Primes up to <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} /> ={" "}
        {result.primes}
      </p>
      <p>
        Unrelated note: <input value={note} onChange={(e) => setNote(e.target.value)} />
      </p>
      <p>Calculated at: {result.calculatedAt}</p>
      <p>Type in the note. With useMemo the time stays the same. Without it, the time changes and typing lags.</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 11. useCallback                                                     */
/* ------------------------------------------------------------------ */

const MemoChild = memo(function MemoChild({ onPing, pings }) {
  return (
    <p>
      Child rendered at {stamp()}. Pings: {pings} <button onClick={onPing}>Ping</button>
    </p>
  );
});

function UseCallbackDemo() {
  const [clicks, setClicks] = useState(0);
  const [pings, setPings] = useState(0);
  const [callbackOn, setCallbackOn] = useState(true);

  // With useCallback: the same function every render, so memo() can skip the child.
  const cachedPing = useCallback(() => setPings((p) => p + 1), []);
  // Without it: a brand-new function every render, so the child always re-renders.
  const freshPing = () => setPings((p) => p + 1);
  const handlePing = callbackOn ? cachedPing : freshPing;

  return (
    <>
      <label>
        <input type="checkbox" checked={callbackOn} onChange={(e) => setCallbackOn(e.target.checked)} /> Use
        useCallback
      </label>
      <p>
        Parent rendered at {stamp()}. Clicks: {clicks}{" "}
        <button onClick={() => setClicks(clicks + 1)}>Re-render parent</button>
      </p>
      <MemoChild onPing={handlePing} pings={pings} />
      <p>Click "Re-render parent". With useCallback, only the parent's time changes.</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 12. useTransition                                                   */
/* ------------------------------------------------------------------ */

function UseTransitionDemo() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [transitionOn, setTransitionOn] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    setText(e.target.value); // urgent: the input updates right away
    if (transitionOn) {
      startTransition(() => setQuery(e.target.value)); // low priority
    } else {
      setQuery(e.target.value); // same priority: the input waits for the list
    }
  }

  return (
    <>
      <label>
        <input type="checkbox" checked={transitionOn} onChange={(e) => setTransitionOn(e.target.checked)} /> Use
        useTransition
      </label>
      <p>
        Filter: <input value={text} onChange={handleChange} placeholder="Type quickly, e.g. 123" />{" "}
        {isPending ? "Updating list…" : "Up to date"}
      </p>
      <SlowList query={query} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 13. useDeferredValue                                                */
/* ------------------------------------------------------------------ */

function UseDeferredValueDemo() {
  const [query, setQuery] = useState("");
  const [deferOn, setDeferOn] = useState(true);
  const deferredQuery = useDeferredValue(query);
  const listQuery = deferOn ? deferredQuery : query;

  return (
    <>
      <label>
        <input type="checkbox" checked={deferOn} onChange={(e) => setDeferOn(e.target.checked)} /> Use
        useDeferredValue
      </label>
      <p>
        Search: <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type quickly, e.g. 456" />
      </p>
      <p>
        You typed "{query}", list shows "{listQuery}"{query !== listQuery ? " (stale, catching up)" : ""}
      </p>
      <SlowList query={listQuery} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 14. useId                                                           */
/* ------------------------------------------------------------------ */

// The SAME component, used twice. Each copy gets its own ID.
function EmailField({ title }) {
  const id = useId();
  return (
    <p>
      <label htmlFor={`${id}-email`}>Email for {title}</label> <input id={`${id}-email`} type="email" />{" "}
      (id="{id}-email")
    </p>
  );
}

function UseIdDemo() {
  return (
    <>
      <EmailField title="sign in" />
      <EmailField title="newsletter" />
      <p>Click either label: it focuses its own input.</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 15. useSyncExternalStore                                            */
/* ------------------------------------------------------------------ */

function subscribeOnline(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function UseSyncExternalStoreDemo() {
  const isOnline = useSyncExternalStore(subscribeOnline, () => navigator.onLine);
  return <p>You are {isOnline ? "online" : "offline"}. Turn off Wi-Fi to see it change.</p>;
}

/* ------------------------------------------------------------------ */
/* 16. useDebugValue                                                   */
/* ------------------------------------------------------------------ */

// A custom hook that labels itself in React DevTools.
function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribeOnline, () => navigator.onLine);
  useDebugValue(isOnline ? "Online" : "Offline");
  return isOnline;
}

function UseDebugValueDemo() {
  const isOnline = useOnlineStatus();
  return (
    <p>
      Status: {isOnline ? "Online" : "Offline"}. Open React DevTools and select UseDebugValueDemo to see the label
      "OnlineStatus: {isOnline ? "Online" : "Offline"}".
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 17. useActionState                                                  */
/* ------------------------------------------------------------------ */

async function addToCart(previousState, formData) {
  await delay(800); // pretend to call a server
  const quantity = Number(formData.get("quantity")) || 1;
  return { added: quantity, total: previousState.total + quantity };
}

function UseActionStateDemo() {
  const [cart, formAction, isPending] = useActionState(addToCart, { added: 0, total: 3 });
  return (
    <form action={formAction}>
      <p>
        Quantity: <input name="quantity" type="number" min="1" defaultValue="2" />{" "}
        <button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add to cart"}
        </button>
      </p>
      <p>{cart.added > 0 ? `Added ${cart.added}. Cart total: ${cart.total}` : `Cart total: ${cart.total}`}</p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* 18. useOptimistic                                                   */
/* ------------------------------------------------------------------ */

function UseOptimisticDemo() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! Are we still on?" },
    { id: 2, text: "Yes, see you at 6" },
  ]);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(messages, (current, text) => [
    ...current,
    { id: `pending-${current.length}`, text, sending: true },
  ]);

  async function sendMessage(formData) {
    const text = String(formData.get("message") || "").trim();
    if (!text) return;
    addOptimisticMessage(text); // shows right away
    await delay(2000); // pretend the server takes 2 seconds
    setMessages((m) => [...m, { id: Date.now(), text }]); // confirmed
  }

  return (
    <>
      <ul>
        {optimisticMessages.map((m) => (
          <li key={m.id}>
            {m.text}
            {m.sending && " (sending…)"}
          </li>
        ))}
      </ul>
      <form action={sendMessage}>
        <input name="message" placeholder="Message" autoComplete="off" /> <button type="submit">Send</button>
      </form>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Demo({ name, desc, children }) {
  return (
    <section>
      <h3>{name}</h3>
      <p>{desc}</p>
      {children}
      <hr />
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>React Hooks Playground</h1>

      <h2>State hooks</h2>
      <Demo name="useState" desc="Store a value and re-render when it changes.">
        <UseStateDemo />
      </Demo>
      <Demo name="useReducer" desc="Manage state with a reducer when updates follow rules.">
        <UseReducerDemo />
      </Demo>

      <h2>Context hooks</h2>
      <Demo name="useContext" desc="Read a value provided by a parent component.">
        <UseContextDemo />
      </Demo>

      <h2>Ref hooks</h2>
      <Demo name="useRef" desc="Point at a DOM element, or keep a value without re-rendering.">
        <UseRefDemo />
      </Demo>
      <Demo name="useImperativeHandle" desc="Choose which methods a child exposes through its ref.">
        <UseImperativeHandleDemo />
      </Demo>

      <h2>Effect hooks</h2>
      <Demo name="useEffect" desc="Run side effects after render, with cleanup.">
        <UseEffectDemo />
      </Demo>
      <Demo name="useLayoutEffect" desc="Measure layout before the browser paints.">
        <UseLayoutEffectDemo />
      </Demo>
      <Demo name="useInsertionEffect" desc="Inject styles before layout effects run. For CSS-in-JS libraries.">
        <UseInsertionEffectDemo />
      </Demo>
      <Demo name="useEffectEvent" desc="Read the latest value inside an effect without restarting it.">
        <UseEffectEventDemo />
      </Demo>

      <h2>Performance hooks</h2>
      <Demo name="useMemo" desc="Cache an expensive calculation between renders.">
        <UseMemoDemo />
      </Demo>
      <Demo name="useCallback" desc="Keep the same function between renders.">
        <UseCallbackDemo />
      </Demo>
      <Demo name="useTransition" desc="Mark a slow update as low priority.">
        <UseTransitionDemo />
      </Demo>
      <Demo name="useDeferredValue" desc="Show a slightly stale result while the new one renders.">
        <UseDeferredValueDemo />
      </Demo>

      <h2>Other hooks</h2>
      <Demo name="useId" desc="Generate stable unique IDs for accessibility attributes.">
        <UseIdDemo />
      </Demo>
      <Demo name="useSyncExternalStore" desc="Subscribe to a store that lives outside React.">
        <UseSyncExternalStoreDemo />
      </Demo>
      <Demo name="useDebugValue" desc="Label a custom hook in React DevTools.">
        <UseDebugValueDemo />
      </Demo>
      <Demo name="useActionState" desc="Track the result and pending state of a form action.">
        <UseActionStateDemo />
      </Demo>
      <Demo name="useOptimistic" desc="Show the expected result before the server confirms.">
        <UseOptimisticDemo />
      </Demo>
    </main>
  );
}
