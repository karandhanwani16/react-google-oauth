import { ErrorMessage } from "@/components/authentication"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { Link, useNavigate } from "react-router-dom"
import { MouseEvent, useCallback, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import useAuthFacade from "@/facades/useAuthFacade"
import { toast } from "react-toastify"
import Loader from "@/components/Loader"
import GoogleIcon from "@/components/icons/GoogleIcon"
import useGoogleSignIn from "@/hooks/authentication/useGoogleSignIn"

const schema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type Inputs = z.infer<typeof schema>;

const Login = () => {

    const { user } = useAuthFacade();

    const [showPassword, setShowPassword] = useState(false);
    const { storeLogin } = useAuthFacade();
    const navigate = useNavigate();

    const handlePasswordVisibility = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setShowPassword((prev) => !prev);
        },
        []
    );


    const { handleGoogleSignIn } = useGoogleSignIn(user, navigate);


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>({
        resolver: zodResolver(schema),
    });

    const loginMutation = useMutation({
        mutationFn: (data: Inputs) => axiosInstance.post("/auth/login", data),
        onSuccess: (response) => {
            const { data: { success, user, message, accessToken } } = response;
            if (success) {
                storeLogin(user, accessToken);
                toast.success(message);
                navigate('/dashboard'); // Adjust this route as needed
            }
        },
        onError: (error) => {

            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error(error);
            }
        }
    });

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        loginMutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto grid w-[350px] md:w-[450px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold md:text-left">Login</h1>
                <p className="text-balance text-muted-foreground md:text-left">
                    Login to your account to get started
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    {...register("email")}
                />
                {errors.email && <ErrorMessage message={errors.email.message || ""} />}
            </div>
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        placeholder="********"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        {...register("password")}
                    />
                    <button onClick={handlePasswordVisibility} className="absolute top-1/2 -translate-y-1/2 right-[16px]">
                        {showPassword ? <EyeSlashIcon height={18} width={18} /> : <EyeIcon height={18} width={18} />}
                    </button>
                </div>
                {errors.password && <ErrorMessage message={errors.password.message || ""} />}
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <Loader /> : "Sign In"}
            </Button>
            <Button variant="outline" onClick={handleGoogleSignIn} className="w-full flex items-center gap-2" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                    <Loader />
                ) : (
                    <>
                        <GoogleIcon height={16} width={16} />
                        <p>Signin with Google</p>
                    </>
                )}
            </Button>
            <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link to={"/auth/signup"} className="underline">
                    Sign up
                </Link>
            </div>
        </form>
    );
};

export default Login;