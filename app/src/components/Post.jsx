import { useCallback, useEffect, useState } from "react"

import {faHeart} from "@fortawesome/free-solid-svg-icons"
import {faComment} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function Post({data}) {

    const [photos, setPhotos] = useState([]);
    const [like, setLike] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);
    useEffect(() => {
        fetch(`/api/get_post_images/${data.postID}`).then(res => res.json()).then(data => {
            if(data.success) {
                setPhotos(data.data)
            }
        })
        fetch(`/api/get_like/${data.ID}`).then(res => res.json()).then(data => {
            if(data.success) {
                if(data.data.length != 0) {
                    setLike(true);
                } else {
                    setLike(true);
                }
            }
        })
        fetch(`/api/get_comments_count/${data.ID}`).then(res => res.json()).then(data => {
            if(data.success) {
                setCommentsCount(data.data[0].count);
            }
        })
    }, []);
    useEffect(() => {
        fetch(`/api/get_likes_count/${data.ID}`).then(res => res.json()).then(data => {
            if(data.success) {
                setLikesCount(data.data[0].count);
            }
        })
    }, [like]);

    const likeClick = useCallback(() => {
        if(like) {
            fetch('/api/delete_like', {
                method:"DELETE",
                headers:{
                    "Content-type":"application.json"
                },
                credentials:'include',
                body:JSON.stringify({
                    IDPost:data.ID
                })
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    setLike(false);
                    setLikesCount(prev => prev - 1);
                }
            })
        } else {
            fetch('/api/set_like', {
                method:"POST",
                headers:{
                    "Content-type":"application.json"
                },
                credentials:'include',
                body:JSON.stringify({
                    IDPost:data.ID
                })
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    setLike(true);
                    setLikesCount(prev => prev + 1);
                }
            });
        }
    }, [like])

    return (
        <section>
            <div>
                <div>
                    <img src={`/api/get_avatar_img/${data.userID}/${data.profile_image}`} alt="" />
                    <span>{data.username}</span>
                    <div></div>
                </div>
                <span>{data.title}</span>
                <span>{data.send_date} {data.edited ? "(edited)":""}</span>
            </div>
            <div>
                <span>
                    {data.text_body}
                </span>
                <div>
                    {
                        photos.map((element) => (
                            <img src={`/api/get_post_img/${data.userID}/${element.img}`} />
                        ))
                    }
                </div>
                <div>
                    <div>
                        {like ? <FontAwesomeIcon icon={faHeart} className="red" onClick={likeClick}></FontAwesomeIcon> :
                         <FontAwesomeIcon icon={faHeart} onClick={likeClick}></FontAwesomeIcon>}
                        {likesCount > 1000 ? `${likesCount / 1000}k`: likesCount}
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faComment}></FontAwesomeIcon>
                        {commentsCount > 1000 ? `${commentsCount / 1000}k`: commentsCount}
                    </div>
                </div>
            </div>
            <div></div>
        </section>
    )
}