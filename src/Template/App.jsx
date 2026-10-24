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
import styles from "./App.module.css";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

// cx("btn", "primary", isOn && "on") -> "App_btn_x1 App_primary_x2 ..."
const cx = (...names) => names.filter(Boolean).map((n) => styles[n]).join(" ");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Freeze the main thread on purpose, so slow work is easy to notice.
function slowDown(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // busy wait
  }
}

// Flashes an element yellow every time its component re-renders.
function useRenderFlash() {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.animate([{ backgroundColor: "#FDE68A" }, { backgroundColor: "#FFFFFF" }], { duration: 700 });
  });
  return ref;
}

// An on/off switch for "with the hook" vs "without the hook".
function Toggle({ checked, onChange, children }) {
  return (
    <label className={cx("toggle")}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}

// A list that is slow on purpose (~250ms per render), so useTransition /
// useDeferredValue have something to make responsive.
const ITEMS = Array.from({ length: 10000 }, (_, i) => `item ${i + 1}`);

const SlowList = memo(function SlowList({ query }) {
  const matches = ITEMS.filter((item) => item.includes(query)).slice(0, 50);
  return (
    <ul className={cx("slowList")}>
      {matches.map((item) => (
        <SlowItem key={item} text={item} />
      ))}
    </ul>
  );
});

function SlowItem({ text }) {
  slowDown(5); // 50 items x 5ms = ~250ms
  return <li className={cx("mono")}>{text}</li>;
}

/* ------------------------------------------------------------------ */
/* State hooks                                                         */
/* ------------------------------------------------------------------ */

function UseStateDemo() {
  const [count, setCount] = useState(0);
  return (
    <div className={cx("center")}>
      <span className={cx("label")}>Count</span>
      <div className={cx("row", "rowWide")}>
        <button className={cx("btn", "square")} onClick={() => setCount(count - 1)} aria-label="Decrease">
          −
        </button>
        <span className={cx("mono", "big")}>{count}</span>
        <button className={cx("btn", "primary", "square")} onClick={() => setCount(count + 1)} aria-label="Increase">
          +
        </button>
      </div>
    </div>
  );
}

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
      <div className={cx("row", "spread")}>
        <strong>Count: {state.count}</strong>
        <span className={cx("mono", "muted")}>last: {state.lastAction}</span>
      </div>
      <div className={cx("row")}>
        <button className={cx("btn", "primary")} onClick={() => dispatch({ type: "increment" })}>Increment</button>
        <button className={cx("btn")} onClick={() => dispatch({ type: "decrement" })}>Decrement</button>
        <button className={cx("btn")} onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
      <p className={cx("muted")}>Every button dispatches an action; one reducer decides the new state.</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Context hooks                                                       */
/* ------------------------------------------------------------------ */

const ThemeContext = createContext("light");

function UseContextDemo() {
  const [theme, setTheme] = useState("dark");
  return (
    <ThemeContext value={theme}>
      <div className={cx("row")}>
        <span className={cx("label")}>Theme provider</span>
        <button className={cx("btn", theme === "light" && "on")} onClick={() => setTheme("light")}>Light</button>
        <button className={cx("btn", theme === "dark" && "on")} onClick={() => setTheme("dark")}>Dark</button>
      </div>
      <Child />
    </ThemeContext>
  );
}

function Child() {
  return (
    <div className={cx("nest")}>
      <span className={cx("muted")}>Parent → Child →</span>
      <Grandchild />
    </div>
  );
}

function Grandchild() {
  const theme = useContext(ThemeContext);
  return (
    <div className={cx("grandchild", theme)}>
      Grandchild reads theme: <span className={cx("mono")}>{theme}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ref hooks                                                           */
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
      <label className={cx("label")} htmlFor="ref-input">Name</label>
      <div className={cx("row")}>
        <input id="ref-input" ref={inputRef} className={cx("input")} placeholder="Type something…" />
        <button className={cx("btn", "primary")} onClick={handleFocus}>Focus</button>
      </div>
      <div className={cx("row")}>
        <span className={cx("muted")}>
          Focus clicks on screen: <span className={cx("mono")}>{shown}</span>
        </span>
        <button className={cx("btn")} onClick={() => setShown(clicksRef.current)}>Read ref</button>
      </div>
      <p className={cx("muted")}>The ref counts every click, but the number only appears when you read it.</p>
    </>
  );
}

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
  return <input ref={inputRef} className={cx("input")} defaultValue="hello" aria-label="Fancy input" />;
}

function UseImperativeHandleDemo() {
  const fancyRef = useRef(null);
  return (
    <>
      <div className={cx("nest")}>
        <span className={cx("label")}>Child: FancyInput</span>
        <FancyInput ref={fancyRef} />
      </div>
      <div className={cx("row")}>
        <span className={cx("label")}>Parent calls</span>
        <button className={cx("btn", "mono")} onClick={() => fancyRef.current.focus()}>ref.focus()</button>
        <button className={cx("btn", "mono")} onClick={() => fancyRef.current.clear()}>ref.clear()</button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Effect hooks                                                        */
/* ------------------------------------------------------------------ */

function UseEffectDemo() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id); // cleanup: stop the old timer
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className={cx("center")}>
      <span className={cx("mono", "big")}>{mm}:{ss}</span>
      <span className={cx("muted")}>Seconds since this card mounted</span>
      <div className={cx("row")}>
        <button className={cx("btn")} onClick={() => setRunning(!running)}>{running ? "Pause" : "Resume"}</button>
        <button className={cx("btn")} onClick={() => setSeconds(0)}>Reset</button>
      </div>
    </div>
  );
}

function Tooltip({ mode, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  // Before the height is known, top is -8px, so the tooltip sits ON the
  // button. The 500ms slowdown makes the difference easy to see.

  // useLayoutEffect: runs BEFORE the browser paints. You never see the
  // wrong position; the screen just waits, then shows it in the right spot.
  useLayoutEffect(() => {
    if (mode !== "layout") return;
    slowDown(500);
    setHeight(ref.current.getBoundingClientRect().height);
  }, [mode]);

  // useEffect: runs AFTER the browser paints. You see the wrong position
  // first, then it jumps.
  useEffect(() => {
    if (mode !== "effect") return;
    slowDown(500);
    setHeight(ref.current.getBoundingClientRect().height);
  }, [mode]);

  return (
    <div ref={ref} role="tooltip" className={cx("tooltip")} style={{ top: -height - 8 }}>
      {children}
    </div>
  );
}

function UseLayoutEffectDemo() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState("layout");
  return (
    <div className={cx("center")}>
      <div className={cx("row")}>
        <button className={cx("btn", mode === "layout" && "on")} aria-pressed={mode === "layout"} onClick={() => setMode("layout")}>
          useLayoutEffect
        </button>
        <button className={cx("btn", mode === "effect" && "on")} aria-pressed={mode === "effect"} onClick={() => setMode("effect")}>
          useEffect
        </button>
      </div>
      <div className={cx("tooltipWrap")}>
        {show && <Tooltip mode={mode}>I belong above the button</Tooltip>}
        <button
          className={cx("btn")}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          onFocus={() => setShow(true)}
          onBlur={() => setShow(false)}
        >
          Hover me
        </button>
      </div>
      <p className={cx("muted")}>
        Hover the button in each mode. With useEffect the tooltip first covers the button, then jumps up. With
        useLayoutEffect it appears in the right spot. (A 0.5s slowdown is added so you can see it.)
      </p>
    </div>
  );
}

function UseInsertionEffectDemo() {
  const [color, setColor] = useState("#0F766E");

  // Injects a real stylesheet at runtime. The class name is long and
  // prefixed so it can't collide with your own CSS, and the <style> tag
  // is removed on cleanup.
  useInsertionEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.hooks-playground-injected { color: ${color}; font-weight: 600; }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [color]);

  return (
    <>
      <div className={`${cx("nest")} hooks-playground-injected`}>This box is styled by an injected rule</div>
      <span className={cx("mono", "muted")}>{`.hooks-playground-injected { color: ${color} }`}</span>
      <div className={cx("row")}>
        <button className={cx("btn")} onClick={() => setColor(color === "#0F766E" ? "#7C3AED" : "#0F766E")}>
          Swap color
        </button>
      </div>
    </>
  );
}

// A fake chat server connection.
function createConnection(roomId) {
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
    const connection = createConnection(roomId);
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
      <div className={cx("row")}>
        <label className={cx("label")} htmlFor="room">Room</label>
        <select id="room" className={cx("input", "narrowInput")} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="general">#general</option>
          <option value="travel">#travel</option>
          <option value="music">#music</option>
        </select>
        <button className={cx("btn", theme === "dark" && "on")} aria-pressed={theme === "dark"} onClick={toggleTheme}>
          {theme === "dark" ? "Dark" : "Light"}
        </button>
      </div>
      <div className={cx("log", "mono")}>
        {log.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Performance hooks                                                   */
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

// The calculation is made slow on purpose (+300ms) so skipping it is noticeable.
function slowCountPrimes(limit) {
  slowDown(300);
  return { primes: countPrimes(limit) };
}

function UseMemoDemo() {
  const [limit, setLimit] = useState(10000);
  const [note, setNote] = useState("");
  const [memoOn, setMemoOn] = useState(true);

  // Hooks can't be called conditionally, so useMemo always runs; the toggle
  // only decides whether we USE its cached result.
  const cached = useMemo(() => slowCountPrimes(limit), [limit]);
  const result = memoOn ? cached : slowCountPrimes(limit);

  // Flash the badge whenever the calculation actually ran (new result object).
  const badgeRef = useRef(null);
  useEffect(() => {
    badgeRef.current?.animate([{ backgroundColor: "#FDE68A" }, { backgroundColor: "#FFFFFF" }], { duration: 700 });
  }, [result]);

  return (
    <>
      <Toggle checked={memoOn} onChange={setMemoOn}>Use useMemo</Toggle>
      <div className={cx("row")}>
        <label className={cx("label")} htmlFor="memo-limit">Primes up to</label>
        <input
          id="memo-limit"
          className={cx("input", "mono", "narrowInput")}
          type="number"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        />
        <strong>= {result.primes.toLocaleString()}</strong>
      </div>
      <div className={cx("row")}>
        <label className={cx("label")} htmlFor="memo-note">Unrelated note</label>
        <input id="memo-note" className={cx("input")} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type here…" />
      </div>
      <span ref={badgeRef} className={cx("badge")}>Calculation ran</span>
      <p className={cx("muted")}>
        Type in the note. With useMemo on, typing is instant and the badge stays still. Turn it off and every
        keystroke reruns the slow calculation: the badge flashes and typing lags.
      </p>
    </>
  );
}

const MemoChild = memo(function MemoChild({ onPing, pings }) {
  const flashRef = useRenderFlash();
  return (
    <div ref={flashRef} className={cx("stat")}>
      <div className={cx("muted")}>Child (memo)</div>
      <div className={cx("mono", "statN")}>{pings} pings</div>
      <button className={cx("btn")} onClick={onPing}>Ping</button>
    </div>
  );
});

function UseCallbackDemo() {
  const [clicks, setClicks] = useState(0);
  const [pings, setPings] = useState(0);
  const [callbackOn, setCallbackOn] = useState(true);
  const parentFlashRef = useRenderFlash();

  // With useCallback: the same function every render, so memo() can skip the child.
  const cachedPing = useCallback(() => setPings((p) => p + 1), []);
  // Without it: a brand-new function every render, so the child always re-renders.
  const freshPing = () => setPings((p) => p + 1);
  const handlePing = callbackOn ? cachedPing : freshPing;

  return (
    <>
      <Toggle checked={callbackOn} onChange={setCallbackOn}>Use useCallback</Toggle>
      <div className={cx("row")}>
        <div ref={parentFlashRef} className={cx("stat")}>
          <div className={cx("muted")}>Parent</div>
          <div className={cx("mono", "statN")}>{clicks} clicks</div>
          <button className={cx("btn", "primary")} onClick={() => setClicks(clicks + 1)}>Re-render</button>
        </div>
        <MemoChild onPing={handlePing} pings={pings} />
      </div>
      <p className={cx("muted")}>
        A yellow flash means that box re-rendered. Click the parent’s Re-render: with useCallback on, only the parent
        flashes. Turn it off and the child flashes too.
      </p>
    </>
  );
}

function UseTransitionDemo() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [transitionOn, setTransitionOn] = useState(true);
  const [isPending, startListTransition] = useTransition();

  function handleChange(e) {
    setText(e.target.value); // urgent: the input updates right away
    if (transitionOn) {
      startListTransition(() => setQuery(e.target.value)); // low priority: can wait
    } else {
      setQuery(e.target.value); // same priority: the input waits for the list
    }
  }

  return (
    <>
      <Toggle checked={transitionOn} onChange={setTransitionOn}>Use useTransition</Toggle>
      <label className={cx("label")} htmlFor="transition-input">Filter 10,000 items</label>
      <input id="transition-input" className={cx("input")} value={text} onChange={handleChange} placeholder="Type quickly, e.g. 123" />
      <p className={cx("muted")}>{isPending ? "isPending: updating list…" : "List is up to date"}</p>
      <div className={cx(isPending && "dimmed")}>
        <SlowList query={query} />
      </div>
      <p className={cx("muted")}>
        The list is slow on purpose. With the switch on, letters appear instantly and the list catches up. Turn it
        off and the input freezes on every keystroke.
      </p>
    </>
  );
}

function UseDeferredValueDemo() {
  const [query, setQuery] = useState("");
  const [deferOn, setDeferOn] = useState(true);
  const deferredQuery = useDeferredValue(query);
  const listQuery = deferOn ? deferredQuery : query;
  const isStale = query !== listQuery;

  return (
    <>
      <Toggle checked={deferOn} onChange={setDeferOn}>Use useDeferredValue</Toggle>
      <label className={cx("label")} htmlFor="deferred-input">Search items</label>
      <input id="deferred-input" className={cx("input")} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type quickly, e.g. 456" />
      <p className={cx("muted")}>
        You typed “<span className={cx("mono")}>{query}</span>”, list shows “<span className={cx("mono")}>{listQuery}</span>”
        {isStale ? " (stale, catching up)" : ""}
      </p>
      <div className={cx(isStale && "dimmed")}>
        <SlowList query={listQuery} />
      </div>
      <p className={cx("muted")}>
        With the switch on, the list lags a step behind (dimmed) while your typing stays smooth. Turn it off and the
        input freezes instead.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Other hooks                                                         */
/* ------------------------------------------------------------------ */

// The SAME component, used twice below. Each copy calls useId and gets its own ID.
function EmailField({ title }) {
  const id = useId();
  return (
    <div className={cx("nest")}>
      <div className={cx("row", "spread")}>
        <label className={cx("label")} htmlFor={`${id}-email`}>Email for {title}</label>
        <span className={cx("mono", "muted")}>id="{id}-email"</span>
      </div>
      <input id={`${id}-email`} className={cx("input")} type="email" placeholder="you@example.com" />
    </div>
  );
}

function UseIdDemo() {
  return (
    <>
      <EmailField title="sign in" />
      <EmailField title="newsletter" />
      <p className={cx("muted")}>
        Same component twice, two different IDs. Click either label: it focuses its own input, not the other one.
      </p>
    </>
  );
}

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
  return (
    <>
      <div className={cx("row")}>
        <span className={cx("pill")}>
          <span className={cx("dot", isOnline ? "online" : "offline")} />
          {isOnline ? "Online" : "Offline"}
        </span>
        <span className={cx("mono", "muted")}>navigator.onLine</span>
      </div>
      <p className={cx("muted")}>
        The browser, not React, owns this value. Turn off Wi-Fi (or DevTools › Network › Offline) and the badge
        updates instantly.
      </p>
    </>
  );
}

// A custom hook that labels itself in React DevTools.
function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribeOnline, () => navigator.onLine);
  useDebugValue(isOnline ? "Online" : "Offline");
  return isOnline;
}

function UseDebugValueDemo() {
  const isOnline = useOnlineStatus();
  return (
    <>
      <div className={cx("devtools", "mono")}>
        <span className={cx("devtoolsPath")}>Components › UseDebugValueDemo › hooks</span>
        <span>
          OnlineStatus: <span className={cx("devtoolsValue")}>"{isOnline ? "Online" : "Offline"}"</span>
        </span>
      </div>
      <p className={cx("muted")}>
        This panel is a mock. Open React DevTools and select this component to see the real label.
      </p>
    </>
  );
}

async function addToCart(previousState, formData) {
  await delay(800); // pretend to call a server
  const quantity = Number(formData.get("quantity")) || 1;
  return { added: quantity, total: previousState.total + quantity };
}

function UseActionStateDemo() {
  const [cart, formAction, isPending] = useActionState(addToCart, { added: 0, total: 3 });
  return (
    <form action={formAction} className={cx("stack")}>
      <div className={cx("row")}>
        <label className={cx("label")} htmlFor="quantity">Quantity</label>
        <input id="quantity" name="quantity" className={cx("input", "mono", "tinyInput")} type="number" min="1" defaultValue="2" />
        <button className={cx("btn", "primary")} type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add to cart"}
        </button>
      </div>
      <p className={cx("success")}>
        {cart.added > 0 ? `Added ${cart.added}. Cart total: ${cart.total}` : `Cart total: ${cart.total}`}
      </p>
    </form>
  );
}

function UseOptimisticDemo() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! Are we still on?", mine: false },
    { id: 2, text: "Yes, see you at 6", mine: true },
  ]);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(messages, (current, text) => [
    ...current,
    { id: `pending-${current.length}`, text, mine: true, sending: true },
  ]);

  async function sendMessage(formData) {
    const text = String(formData.get("message") || "").trim();
    if (!text) return;
    addOptimisticMessage(text); // shows right away as "sending…"
    await delay(2000); // pretend the server takes 2 seconds
    setMessages((m) => [...m, { id: Date.now(), text, mine: true }]); // confirmed
  }

  return (
    <>
      <div className={cx("messages")}>
        {optimisticMessages.map((m) => (
          <span key={m.id} className={cx("bubble", m.mine ? "mine" : "theirs", m.sending && "sending")}>
            {m.text}
            {m.sending && <span className={cx("muted")}> (sending…)</span>}
          </span>
        ))}
      </div>
      <form action={sendMessage} className={cx("row")}>
        <label htmlFor="message" className={cx("srOnly")}>Message</label>
        <input id="message" name="message" className={cx("input")} placeholder="Message" autoComplete="off" />
        <button className={cx("btn", "primary")} type="submit">Send</button>
      </form>
      <p className={cx("muted")}>
        Your message shows up right away (faded) while the fake server takes 2 seconds, then turns solid when confirmed.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page data                                                           */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { id: "State", title: "State hooks", sub: "Let a component remember values between renders." },
  { id: "Context", title: "Context hooks", sub: "Read data from far up the tree without passing props." },
  { id: "Ref", title: "Ref hooks", sub: "Hold values that don’t trigger a re-render, often DOM nodes." },
  { id: "Effect", title: "Effect hooks", sub: "Sync with things outside React: timers, APIs, the DOM." },
  { id: "Performance", title: "Performance hooks", sub: "Skip wasted work and keep typing responsive." },
  { id: "Other", title: "Other hooks", sub: "IDs, external stores, DevTools labels, and form actions." },
];

const HOOKS = [
  { name: "useState", category: "State", desc: "Store a value and re-render when it changes.", Demo: UseStateDemo },
  { name: "useReducer", category: "State", desc: "Manage state with a reducer when updates follow rules.", Demo: UseReducerDemo },
  { name: "useContext", category: "Context", desc: "Read a value provided by a parent component.", Demo: UseContextDemo },
  { name: "useRef", category: "Ref", desc: "Point at a DOM element, or keep a value without re-rendering.", Demo: UseRefDemo },
  { name: "useImperativeHandle", category: "Ref", desc: "Choose which methods a child exposes through its ref.", Demo: UseImperativeHandleDemo },
  { name: "useEffect", category: "Effect", desc: "Run side effects after render, with cleanup.", Demo: UseEffectDemo },
  { name: "useLayoutEffect", category: "Effect", desc: "Measure layout before the browser paints.", Demo: UseLayoutEffectDemo },
  { name: "useInsertionEffect", category: "Effect", desc: "Inject styles before layout effects run. For CSS-in-JS libraries.", Demo: UseInsertionEffectDemo },
  { name: "useEffectEvent", category: "Effect", tag: "Effect · new", desc: "Read the latest value inside an effect without restarting it.", Demo: UseEffectEventDemo },
  { name: "useMemo", category: "Performance", desc: "Cache an expensive calculation between renders.", Demo: UseMemoDemo },
  { name: "useCallback", category: "Performance", desc: "Keep the same function between renders.", Demo: UseCallbackDemo },
  { name: "useTransition", category: "Performance", desc: "Mark a slow update as low priority.", Demo: UseTransitionDemo },
  { name: "useDeferredValue", category: "Performance", desc: "Show a slightly stale result while the new one renders.", Demo: UseDeferredValueDemo },
  { name: "useId", category: "Other", desc: "Generate stable unique IDs for accessibility attributes.", Demo: UseIdDemo },
  { name: "useSyncExternalStore", category: "Other", desc: "Subscribe to a store that lives outside React.", Demo: UseSyncExternalStoreDemo },
  { name: "useDebugValue", category: "Other", desc: "Label a custom hook in React DevTools.", Demo: UseDebugValueDemo },
  { name: "useActionState", category: "Other", desc: "Track the result and pending state of a form action.", Demo: UseActionStateDemo },
  { name: "useOptimistic", category: "Other", desc: "Show the expected result before the server confirms.", Demo: UseOptimisticDemo },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const term = search.trim().toLowerCase();
  const visible = HOOKS.filter(
    (h) =>
      (filter === "All" || h.category === filter) &&
      (term === "" || h.name.toLowerCase().includes(term) || h.desc.toLowerCase().includes(term))
  );

  return (
    <div className={cx("page")}>
      <header className={cx("header")}>
        <div className={cx("wrap", "headerInner")}>
          <span className={cx("mono", "eyebrow")}>React 19.2 · built-in hooks</span>
          <h1 className={cx("title")}>React Hooks Playground</h1>
          <p className={cx("lead")}>All 18 built-in hooks, each with a tiny live demo you can click.</p>
          <div className={cx("row")}>
            <label htmlFor="search" className={cx("srOnly")}>Search hooks</label>
            <input
              id="search"
              className={cx("input", "search")}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hooks, e.g. useMemo"
            />
            <div className={cx("row")}>
              {["All", ...CATEGORIES.map((c) => c.id)].map((id) => (
                <button
                  key={id}
                  className={cx("chip", filter === id && "on")}
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {id === "All" ? "All 18" : id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className={cx("wrap")}>
        {CATEGORIES.map((cat) => {
          const hooks = visible.filter((h) => h.category === cat.id);
          if (hooks.length === 0) return null;
          return (
            <section key={cat.id} className={cx("section")}>
              <div className={cx("sectionHead")}>
                <h2>{cat.title}</h2>
                <span className={cx("count")}>{hooks.length}</span>
                <p>{cat.sub}</p>
              </div>
              <div className={cx("grid")}>
                {hooks.map(({ name, category, tag, desc, Demo }) => (
                  <article key={name} className={cx("card")}>
                    <div className={cx("cardTop")}>
                      <h3 className={cx("mono")}>{name}</h3>
                      <span className={cx("tag")}>{tag ?? category}</span>
                    </div>
                    <p className={cx("desc")}>{desc}</p>
                    <div className={cx("demo")}>
                      <Demo />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
        {visible.length === 0 && <p className={cx("muted", "empty")}>No hooks match “{search}”.</p>}
      </main>

      <footer className={cx("wrap", "footer")}>
        <p className={cx("muted")}>Examples follow the react.dev hook reference.</p>
      </footer>
    </div>
  );
}
