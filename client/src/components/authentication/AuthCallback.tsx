import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthFacade from '@/facades/useAuthFacade';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/API';
import GoogleAuthLoader from './GoogleAuthLoader';

interface Inputs {
    code: string;
}

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { storeLogin } = useAuthFacade();


    const googleSignInMutation = useMutation({
        mutationFn: (data: Inputs) => axiosInstance.post("/auth/google", { code: data.code }),
        onSuccess: (data) => {
            const { data: { success, user, message, accessToken } } = data;

            if (success) {
                storeLogin({
                    id: user?.id,
                    name: user?.name,
                    email: user?.email
                }, accessToken);
                toast.success(message);
                navigate("/");
            } else {
                toast.error(message);
            }
        },
        onError: (error) => {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    });


    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const code = query.get('code');

        if (code) {
            googleSignInMutation.mutate({ code });
        }else{
            toast.error("Something went wrong");
            navigate("/auth/login");
        }


    }, []);

    return (
        <GoogleAuthLoader />
    );
};

export default AuthCallback;