import { useCallback, useState } from "react"

export function InputBox({title, type, placeholder, styles, regexp, error = "error", success = "success",
     returnStatusCallback = (e) => {}, returnValueCallback}) {

    const [status, SetStatus] = useState(0);
    const changeState = useCallback((e) => {
        const value = e.target.value;
        if(regexp != null) {
            if(regexp.test(value)) {
                SetStatus(1);
                returnStatusCallback(1);
            } else {
                SetStatus(-1);
                returnStatusCallback(-1);
            }
        } else {
            SetStatus(1);
            returnStatusCallback(1);
        }
        returnValueCallback(value)
    }, [regexp]);
    return(
        <>
        <section className="w-full">
            <p className="text-white font-black ml-1">{title}</p>
            <input onChange={(e) => changeState(e)} type={type || "text"} placeholder={placeholder || ""} className={styles}/>
            {status === 1 ? success : status === -1 ? error : <div className="h-[1.5em]"></div>}
        </section>
        </>
    )
}
export function InputSelect({title, placeholder, styles, optionDict: optionList}) {
    

    return(
        <>
        <section className="w-full">
            <p className="text-white font-black ml-1">{title}</p>
            <select className={styles}>
                <option value="" selected className="hidden">{placeholder || "select option"}</option>
                {[...optionList].map((element) => <option value={element.key} key={element.key}>{element.value}</option>)}
            </select>
            <div className="h-[1.5em]"></div>
        </section>
        </>
    )
}