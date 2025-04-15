import { useEffect, useState } from "react"


export default function Post({data}) {

    const [photos, setPhotos] = useState([]);
    useEffect(() => {
        fetch(`/api/get_post_images/${data.postID}`).then(res => res.json()).then(data => {
            if(data.success) {
                setPhotos(data.data)
            }
        })
    })

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
                    {/* likes and comments */}
                </div>
            </div>
            <div></div>
        </section>
    )
}