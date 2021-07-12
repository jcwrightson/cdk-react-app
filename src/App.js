import "./App.css";
import { useStore } from "./store";
import { counterStore } from "./stores";

const App = () => {
  const { state, dispatch } = useStore(counterStore);

  // const getData = async () => {
  //   const res = await fetch(
  //     "https://lgi3phzhyg.execute-api.eu-west-1.amazonaws.com/"
  //   );

  //   return res.json();
  // };

  // useEffect(() => {
  //   const fetchAction = async (state, update) => {
  //     const data = await getData();
  //     update("records", data);
  //   };
  //   dispatch(fetchAction);
  // }, []);

  return (
    <div className="App">
      <h1>{state.counter}</h1>
      <button
        onClick={() => {
          dispatch((state, update) => update("counter", state.counter + 1));
        }}
      >
        Increment
      </button>
      <button
        onClick={() => {
          dispatch((state, update) => update("counter", state.counter - 1));
        }}
      >
        Decrement
      </button>
    </div>
  );
};

export default App;
