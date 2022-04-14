import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import axios from "axios";

const FETCH_NOTES = "FETCH_NOTES";

const notes = (state = [], action) => {
  switch (action.type) {
    case FETCH_NOTES:
      return [...state, action.notes];
    default:
      return state;
  }
};

export const getNotes = (userId) => {
  return async (dispatch) => {
    const response = await axios.get(`/api/notes/${userId}`);
    const messages = response.data;
    console.log("HERES THE RESPONSE FROM THUNK", messages);
    dispatch({ type: FETCH_NOTES, notes: messages });
  };
};

const auth = (state = {}, action) => {
  if (action.type === "SET_AUTH") {
    return action.auth;
  }
  return state;
};

const logout = () => {
  window.localStorage.removeItem("token");
  return {
    type: "SET_AUTH",
    auth: {},
  };
};

const signIn = (credentials) => {
  return async (dispatch) => {
    let response = await axios.post("/api/auth", credentials);
    const { token } = response.data;
    window.localStorage.setItem("token", token);
    return dispatch(attemptLogin());
  };
};
const attemptLogin = () => {
  return async (dispatch) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const response = await axios.get("/api/auth", {
        headers: {
          authorization: token,
        },
      });
      dispatch({ type: "SET_AUTH", auth: response.data });
    }
  };
};

const store = createStore(
  combineReducers({
    auth,
    notes,
  }),
  applyMiddleware(thunk, logger)
);

export { attemptLogin, signIn, logout };

export default store;
