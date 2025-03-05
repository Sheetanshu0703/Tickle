import { useEffect, useState } from "react";

export default function useDebounce<T>(value: T, delay: number =250): T{
    const[ debouncedValue, setDebouncedvalue] = useState<T>(value) 

    useEffect(()=>{
        const handler= setTimeout(()=>{
            setDebouncedvalue(value);


        },delay)

        return ()=> clearTimeout(handler);
    },[value,delay]);

    return debouncedValue;


}