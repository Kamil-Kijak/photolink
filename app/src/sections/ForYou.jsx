
import {useState, useEffect, useCallback} from "react"
import { useNavigate } from "react-router-dom"
import NavigationBar from "../components/NavigationBar"
import Post from "../components/Post"

export default function ForYou({IDUser}) {
    const [posts, setPosts] = useState([]);
    const [loadStatus, setLoadStatus] = useState("loading");
    const [limit, setLimit] = useState(40);
    const navigation = useNavigate();
    useEffect(() => {
        if(!IDUser) {
            navigation("/");
        } 
    });
    useEffect(() => {
        setLoadStatus("loading")
        generatePosts(limit)
    }, [limit])

    const generatePosts = useCallback((limit) => {
        fetch(`/api/get_for_you_posts/${limit}`).then(res => {
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
    }, [])


    return (
        <section>
            <NavigationBar IDUser={IDUser}></NavigationBar>
            <main>
                {
                    posts.map((element) => (<Post data={element}></Post>))
                }
                {
                    loadStatus == "loading" ?
                     <section>Loading</section>
                    :
                    loadStatus == "empty" ? <section>You dont have any posts! Follow a people</section>
                    :
                    limit <= 200 && <button onClick={() => setLimit(prev => prev + 40)}>Generate more</button>
                }
            </main>
        </section>
    )
}