import React, { useReducer, useEffect, Suspense } from "react"
import { useImmerReducer } from "use-immer"
import ReactDOM from "react-dom"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import Axios from "axios"
import { CSSTransition } from "react-transition-group"

// App components
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"
import FlashMessages from "./components/FlashMessages"
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
import Home from "./components/Home"
import EditPost from "./components/EditPost"
import Profile from "./components/Profile"
import NotFound from "./components/NotFound"
import Search from "./components/Search"
import LoadingDotsIcon from "./components/LoadingDotsIcon"

// React lazyloading components
const CreatePost = React.lazy(() => import("./components/CreatePost"))
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))
const Chat = React.lazy(() => import("./components/Chat"))

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
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
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
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        return
      case "closeChat":
        draft.isChatOpen = false
        return
      case "increaseUnreadChatCount":
        draft.unreadChatCount++
        return
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
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

  // Check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchToken() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token })
          if (!response.data) {
            // Only when the server returns 'token not valid'
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "Your session has expired.  Please log in again." })
          }
        } catch (e) {
          console.log("There was a problem. ", e)
        }
      }
      fetchToken()
      return () => ourRequest.cancel()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
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
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
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
