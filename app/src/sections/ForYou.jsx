
import {useState, useEffect, useCallback} from "react"
import { useNavigate } from "react-router-dom"
import NavigationBar from "../components/NavigationBar"
import Post from "../components/Post"

export default function ForYou({IDUser}) {
    const [posts, setPost] = useState([]);
    const [loadStatus, setLoadStatus] = useState("loading");
    const [limit, setLimit] = useState(15);
    const navigation = useNavigate();
    useEffect(() => {
        if(!IDUser) {
            navigation("/");
        } 
    });
    useEffect(() => {
        generatePosts(limit)
    }, [limit])

    const handleScroll = useCallback((event) => {
          const scrollTop = event.target.scrollTop; // Ilość przewiniętych pikseli
          const scrollHeight = event.target.scrollHeight; // Wysokość całego zawartości
          const clientHeight = event.target.clientHeight; // Wysokość widocznej części
          
          if (scrollTop + clientHeight >= scrollHeight) {
            const elements = limit + 15;
            generatePosts(elements);
            setLimit(elements);
          }
      }, [limit]);

    const generatePosts = useCallback((limit) => {
        fetch(`/api/get_for_you_posts/${limit}`).then(res => {
            return res.json();
        }).then(data => {
            if(data.success) {
                setPost(data.data)
                if(data.data.length == 0) {
                    setLoadStatus("empty")
                } else {
                    setLoadStatus("loaded")
                }
            }
        })
    }, [posts])


    return (
        <section>
            <NavigationBar></NavigationBar>
            <main onScroll={(e) => handleScroll(e)}>
                {
                    posts.map((element) => (<Post data={element}></Post>))
                }
                {
                    loadStatus == "loading" ?
                     <section>Loading</section>
                    :
                    loadStatus == "empty" ? <section>You dont have any posts! Follow a people</section>
                    :
                     <section></section>
                }
            </main>
        </section>
    )
}