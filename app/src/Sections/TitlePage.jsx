
import icon from "../../images/icon.png"

import photo1 from "../../images/examplePhotos/photo-1.jpg"
import photo2 from "../../images/examplePhotos/photo-2.jpg"
import photo3 from "../../images/examplePhotos/photo-3.jpg"
import photo4 from "../../images/examplePhotos/photo-4.jpg"
import photo5 from "../../images/examplePhotos/photo-5.jpg"

import {useNavigate} from "react-router-dom"
import { useCallback } from "react"

export default function TitlePage() {
    const navigation = useNavigate();
    const redirectToEnter = useCallback(() => {
        navigation("/enter");
    }, [])

    return (
        <>
        <main className="bg-gradient-to-r from-slate-900 to-slate-700 w-max-screen overflow-x-hidden min-h-screen md:flex-row flex-col flex items-center">
            <section className="flex flex-col items-start">
                <section className="flex justify-center items-center m-4">
                    <img src={icon} alt="icon" width={120} />
                    <span className="text-white font-extrabold md:text-6xl text-4xl">Photolink</span>
                </section>
                <hr  className="border-4 border-indigo-900 ml-6 mb-2 w-full"/>
                <section className="ml-6 flex flex-col">
                    <span className="text-white text-2xl">Let's share your photos or watch other people beautiful memories</span>
                    <span className="text-white text-xl mt-1"><i>"Let's photos link people"</i></span>
                    <span className="text-white text-xl mt-3 text-wrap">Let's share your day with your followers and connect with them across the all world</span>
                </section>
                <section className=" flex justify-center my-5 w-full">
                    <span className="text-white xl:text-2xl lg:text-xl md:text-xl sm:text-xl mt-1 font-bold text-center">Join to our community and create your first account</span>
                </section>
                <hr  className="border-4 border-indigo-900 ml-6 mb-2 w-full"/>
                <section className=" flex justify-center mt-18 w-full">
                    <button onClick={redirectToEnter} className="w-auto mb-10 h-auto bg-blue-800 text-2xl text-white font-bold
                     px-6 py-4 rounded-lg hover:bg-blue-700 hover:cursor-pointer transition-colors duration-200">Get started!</button>
                </section>
            </section>
            <section className="flex-col items-end md:flex my-3">
                <section className="grid grid-cols-1 md:grid-cols-2 w-[100%] md:w-[80%] gap-4 place-items-center">
                    <img src={photo1} width={300} className="rounded-xl w-100"/>
                    <img src={photo2} width={300} className="rounded-xl"/>
                    <img src={photo3} width={300} className="rounded-xl"/>
                    <img src={photo4} width={300} className="rounded-xl"/>
                    <img src={photo5} width={300} className="rounded-xl"/>
                </section>
            </section>
        </main>
        <footer className="w-max-screen h-[5vh] py-2 bg-gray-800 flex items-center">
            <span className="text-white text-xl font-bold ml-5 relative">App created by Kamil Kijak</span>
        </footer>
        </>
    )
}