import { useState } from "react";

export const createStore = (initialState = {}, enableHistory = true) => {
  let state = { ...initialState };
  let stateHistory = {};

  const handleUpdates = (key, val) => {
    if (enableHistory) {
      stateHistory[Date.now()] = { ...state };
    }
    state[key] = val;
    return state;
  };

  return {
    handleUpdates,
    getState: () => ({ ...state }),
    getHistory: () => ({ ...stateHistory }),
    dispatch: async (action) => await action({ ...state }, handleUpdates),
  };
};

export const useStore = (store) => {
  const [state, setState] = useState(store.getState());

  return {
    state: { ...state },
    ...store,
    getState: () => {
      return { ...state };
    },
    dispatch: async (action) =>
      await action({ ...state }, (key, val) => {
        store.handleUpdates(key, val);
        setState(store.getState());
      }),
  };
};
