
import AppIcon from "../../images/icon.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faCompass } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';

import {useNavigate} from "react-router-dom"

export default function NavigationBar({IDUser}) {

    const navigation = useNavigate();
    return (
        <nav>
            <img src={AppIcon} alt=""  width={100}/>
            <hr />
            <section>
                <button onClick={() => navigation("/app")}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>For you</span>
                </button>
                <button onClick={() => navigation("/explore")}>
                    <FontAwesomeIcon icon={faCompass} />
                    <span>Explore</span>
                </button>
                <button onClick={() => navigation("/notifications")}>
                    <FontAwesomeIcon icon={faBell} />
                    <span>Notifications</span>
                    <div></div>
                </button>
                <button onClick={() => navigation("/create")}>
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Create</span>
                </button>
                <button onClick={() => navigation(`/profile/${IDUser}`)}>
                    <FontAwesomeIcon icon={faGear} />
                    <span>Profile</span>
                </button>
            </section>
        </nav>
    )
}