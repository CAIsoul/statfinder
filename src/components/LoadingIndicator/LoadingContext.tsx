import { createContext, useContext, useState } from "react";

interface LoadingProp {
    loading?: boolean;
    showLoading?: any;
    hideLoading?: any;
}

const LoadingContext = createContext<LoadingProp>({});

export function LoadingProvider({ children }: any) {
    const [loading, setLoading] = useState(false);

    const showLoading = () => setLoading(true);

    const hideLoading = () => setLoading(false);

    return (
        <LoadingContext.Provider value={{ loading, showLoading, hideLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    return useContext(LoadingContext);
}