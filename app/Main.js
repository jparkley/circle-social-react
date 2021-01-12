import { func } from "prop-types"
import React, { useState, useReducer, useEffect } from "react"
import { useImmerReducer } from "use-immer"
import ReactDOM from "react-dom"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import Axios from "axios"

import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

import FlashMessages from "./components/FlashMessages"
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
import Home from "./components/Home"
import CreatePost from "./components/CreatePost"
import ViewSinglePost from "./components/ViewSinglePost"
import Profile from "./components/Profile"

Axios.defaults.baseURL = "http://localhost:8080"

function Main() {
  const initalState = {
    loggedIn: Boolean(localStorage.getItem("circleAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("circleAppToken"),
      username: localStorage.getItem("circleAppUsername"),
      avatar: localStorage.getItem("circleAppAvatar")
    }
  }

  function ourReducer(draft, action) {
    // 'draft' of state (using Immer)
    switch (action.type) {
      case "login":
        //return { loggedIn: true, flashMessages: state.flashMessages }
        draft.loggedIn = true
        draft.user = action.data
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        //return { loggedIn: state.loggedIn, flashMessages: state.flashMessages.concat(action.value) }
        draft.flashMessages.push(action.value)
    }
  }

  //const [state, dispatch] = useReducer(ourReducer, initalState)
  const [state, dispatch] = useImmerReducer(ourReducer, initalState) // Use Immer to handle the state object

  // When 'state.logged' value changes, do this (as side effect)
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("circleAppToken", state.user.token)
      localStorage.setItem("circleAppUsername", state.user.username)
      localStorage.setItem("circleAppAvatar", state.user.avatar)
    } else {
      localStorage.removeItem("circleAppToken")
      localStorage.removeItem("circleAppUsername")
      localStorage.removeItem("circleAppAvatar")
    }
  }, [state.loggedIn]) // 2nd arg: a list or an array you want to watch for changes

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Switch>
            <Route path="/" exact>
              {state.loggedIn ? <Home /> : <HomeGuest />}
            </Route>
            <Route path="/profile/:username">
              <Profile />
            </Route>
            <Route path="/create-post">
              <CreatePost />
            </Route>
            <Route path="/post/:id">
              <ViewSinglePost />
            </Route>
            <Route path="/about-us">
              <About />
            </Route>
            <Route path="/terms">
              <Terms />
            </Route>
          </Switch>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector("#app"))

if (module.hot) {
  module.hot.accept()
}
