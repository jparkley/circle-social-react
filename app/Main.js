import { func } from "prop-types"
import React, { useState, useReducer, useEffect } from "react"
import { useImmerReducer } from "use-immer"
import ReactDOM from "react-dom"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import Axios from "axios"
import { CSSTransition } from "react-transition-group"

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
import EditPost from "./components/EditPost"
import ViewSinglePost from "./components/ViewSinglePost"
import Profile from "./components/Profile"
import NotFound from "./components/NotFound"
import Search from "./components/Search"

Axios.defaults.baseURL = "http://localhost:8080"

function Main() {
  const initalState = {
    loggedIn: Boolean(localStorage.getItem("circleAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("circleAppToken"),
      username: localStorage.getItem("circleAppUsername"),
      avatar: localStorage.getItem("circleAppAvatar")
    },
    isSearchOpen: false
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
      case "openSearch":
        draft.isSearchOpen = true
        return
      case "closeSearch":
        draft.isSearchOpen = false
        return
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
            <Route path="/post/:id" exact>
              <ViewSinglePost />
            </Route>
            <Route path="/post/:id/edit" exact>
              <EditPost />
            </Route>
            <Route path="/about-us">
              <About />
            </Route>
            <Route path="/terms">
              <Terms />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
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
