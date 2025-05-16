import { useCallback, useEffect, useState } from "react"

export function InputBox({title, type, placeholder, styles, regexp, error = "error", success = "success",
     returnValueCallback}) {

    const [status, SetStatus] = useState(0);
    const [value, SetValue] = useState(null);
    
    useEffect(() => {
        if(value === null) {
            return;
        }
        let newStatus = regexp?.test(value) ? 1 : -1;
        if (status !== newStatus) { 
            SetStatus(newStatus);
        }
        returnValueCallback && returnValueCallback({ value, status: newStatus });
    }, [regexp, value])
    const changeState = useCallback((e) => {
        const value = e.target.value;
        SetValue(value);
    }, []);
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
export function InputSelect({title, placeholder, styles, optionDict: optionList, error = "error", success = "success", returnValueCallback
}) {
    const [status, SetStatus] = useState(0);
    const changeState = useCallback((e) => {
        const value = e.target.value;
        let newStatus = value.length == 0 ? -1 : 1;
        if(newStatus !== status) {
            SetStatus(newStatus);
        }
        returnValueCallback && returnValueCallback({value:value, status:newStatus});
    }, [])
    return(
        <>
        <section className="w-full">
            <p className="text-white font-black ml-1">{title}</p>
            <select className={styles} onClick={changeState}>
                <option value="" selected className="hidden">{placeholder || "select option"}</option>
                {[...optionList].map((element) => <option value={element.key} key={element.key}>{element.value}</option>)}
            </select>
            {status === 1 ? success : status === -1 ? error : <div className="h-[1.5em]"></div>}
        </section>
        </>
    )
}