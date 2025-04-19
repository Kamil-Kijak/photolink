
import { useEffect, useState, useCallback} from "react";
import {useNavigate, useParams} from "react-router-dom"

import NavigationBar from "../components/NavigationBar"
import Post from "../components/Post"
import noProfile from "../../images/noProfile.jpeg"

export default function Profile({socket, userID}) {
    const navigation = useNavigate();
    const {id} = useParams();
    const [user, setUser] = useState({})
    const [posts, setPosts] = useState([]);
    const [editProfile, setEditProfile] = useState(false);
    const [loadStatus, setLoadStatus] = useState("loading");
    const [changes, setChanges] = useState({});

    useEffect(()=>{
        if(!userID) {
            navigation("/");
        } 
        fetch(`/api/get_user/${id}`).then(res => res.json()).then(data => {
            if(data.success) {
                setUser(data.data[0]);
            } else {
                navigation('/')
            }
        })
        generatePosts();
    }, []);

    const generatePosts = useCallback(() => {
        if(userID == id) {
            fetch(`/api/get_my_posts`).then(res => {
                return res.json();
            }).then(data => {
                if(data.success) {
                    setPosts(data.data)
                    if(data.data.length == 0) {
                        setLoadStatus("empty")
                    } else {
                        setLoadStatus("loaded")
                    }
                }
            })
        } else {
            fetch(`/api/get_user_posts/${id}`).then(res => {
                return res.json();
            }).then(data => {
                if(data.success) {
                    setPosts(data.data)
                    if(data.data.length == 0) {
                        setLoadStatus("empty")
                    } else {
                        setLoadStatus("loaded")
                    }
                }
            })
        }
        }, [])
    const saveChanges = useCallback(() => {
        const formData = new FormData();
        if(!changes.photo) {

        } else {
            formData.append("photo", changes.photo);
            fetch(`/api/upload_avatar`, {
                method:"POST",
                credentials:'include',
                body:formData
            }).then(res => res.json()).then(data => {
                navigation(0);
            })
        }

    }, [changes])


    return (
        <section>
            <NavigationBar IDUser={userID}></NavigationBar>
        <main>
            {!user.username ? <span>No user found</span> : <></>}
            <div>
                <span>{user.username}</span>
                {userID == user.ID && 
                <button onClick={() => {
                    fetch("/api/logout", {
                        method:"POST"
                    }).then(res => {
                        return res.json();
                    }).then(data => {
                        if(data.success) {
                            socket.disconnect();
                            navigation("/")
                        }
                    })
                }}>Logout</button>
                }
                
            </div>
            <div>
                <div>
                    <img src={user.profile_image ? `/api/get_avatar_img/${user.ID}/${user.profile_image}` : noProfile} alt="" width={200} />
                    {user.status === "online" ? <div></div>:<div></div>}
                </div>
                <div>
                    <p>{user.username}</p>
                    <p>{user.name} {user.surname}</p>
                    <p>{user.profile_desc || `no description!`}</p>
                </div>
            </div>
            <div>
                {
                    userID == user.ID ? <button onClick={() => setEditProfile(true)}>Edit profile</button> : <button>Follow</button>
                }
            </div>
            <div>
                {
                    posts.map((element) => (<Post data={element}></Post>))
                }
                {
                    loadStatus == "loading" ?
                    <section>Loading</section>
                   :
                   loadStatus == "empty" ?
                     userID == user.ID ? <span>You dont have any posts!</span>: user.protected === 1 ?
                      <span>This account is protected</span>: <span>This account doesnt have any posts!</span>
                     
                     :<></>
                }
            </div>
        </main>
        {editProfile && 
        <section>
            <div>
                <span>Edit profile</span>
                <button onClick={() => setEditProfile(false)}>X</button>
            </div>
            <div>
                <img src={user.profile_image ? `/api/get_avatar_img/${user.ID}/${user.profile_image}` : noProfile} alt="" width={200} />
                <input type="file" accept="image/*" onChange={(e) => setChanges(prev => ({...prev, photo:e.target.files[0]}))}/>
            </div>
            <hr />
            <div>
                <textarea onChange={(e) => setChanges(prev => ({...prev, profile_desc:e.target.value}))}>{user.profile_desc}</textarea>
            </div>
            <div>
                <button onClick={saveChanges}>Save changes</button>
            </div>
        </section>
        }
        </section>
    )
}