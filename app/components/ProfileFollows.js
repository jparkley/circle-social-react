import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfileFollows() {
  const { username, action } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [follows, setFollows] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source() // Generate a token to identify to cancel on unmount

    async function fetchFollows() {
      try {
        const response = await Axios.get(`/profile/${username}/${action}`, { cancelToken: ourRequest.token })

        setFollows(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("There's an error or the request was cancelled.", e)
      }
    }
    fetchFollows()

    return () => ourRequest.cancel()
  }, [username, action])

  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className="list-group">
      {follows.length > 0 &&
        follows.map((user, index) => {
          return (
            <Link key={index} to={`/profile/${user.username}`} className="list-group-item list-group-item-action">
              <img className="avatar-tiny" src={user.avatar} /> {user.username}
            </Link>
          )
        })}
    </div>
  )
}

export default ProfileFollows
