import { ErrorMessage, PasswordSummary } from "@/components/authentication"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { zodResolver } from "@hookform/resolvers/zod"
import { MouseEvent, useCallback, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/utils/API"
import useAuthFacade from "@/facades/useAuthFacade"
import { toast } from "react-toastify"
import Loader from "@/components/Loader"
import GoogleIcon from "@/components/icons/GoogleIcon"
import useGoogleSignIn from "@/hooks/authentication/useGoogleSignIn"

// Define the Zod schema for validation
const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Path of the error in the form
});

type SignUpResponse = {
   data: {
    success: boolean;
    user: {
        id: string;
        email: string;
        name: string;
    };
    message: string;
   }
}

type Inputs = z.infer<typeof schema>;

const SignUpPage = () => {
    const { setUser, user } = useAuthFacade();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const { handleGoogleSignIn } = useGoogleSignIn(user, navigate);

    const handlePasswordVisibility = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setShowPassword((prev) => !prev);
        },
        []
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>(
        {
            resolver: zodResolver(schema),
        }
    )

    const signUpMutation = useMutation({
        mutationFn: (data: Inputs) => axiosInstance.post("/auth/signup", data),
        onSuccess: (data: SignUpResponse) => {


            const { data: { success, user, message } } = data;
            if (success) {
                setUser(user);
                toast.success(message);
                navigate("/auth/login");
            } else {
                toast.error(message);
            }
            // setUser(data.user);
        },
        onError: (error) => {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    });

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        signUpMutation.mutate(data);
    };

    const isPasswordValid = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[@$!%*?&#]/.test(password),
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto grid w-[350px] md:w-[450px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold md:text-left">Signup</h1>
                <p className="text-balance text-muted-foreground md:text-left">
                    Create a new account to get started
                </p>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
                        {...register("name", { required: true })}
                    />
                    {
                        errors.name && <ErrorMessage message={errors.name.message || ""} />
                    }
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        {...register("email", { required: true })}
                    />
                    {
                        errors.email && <ErrorMessage message={errors.email.message || ""} />
                    }
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 88888 88888"
                        {...register("phone", { required: true })}
                    />
                    {
                        errors.phone && <ErrorMessage message={errors.phone.message || ""} />
                    }
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">

                        <Input
                            id="password"
                            placeholder="********"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            {...register("password",
                                {
                                    required: true,
                                    onChange: (e) => setPassword(e.target.value)
                                }
                            )}
                        />

                        <button onClick={handlePasswordVisibility} className="top-1/2 -translate-y-1/2 right-[16px] absolute">
                            {
                                showPassword ? <EyeSlashIcon height={18} width={18} /> : <EyeIcon height={18} width={18} />
                            }
                        </button>

                    </div>
                    <PasswordSummary isPasswordValid={isPasswordValid} />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password"> Confirm Password</Label>
                    </div>
                    <Input
                        id="confirmPassword"
                        placeholder="********"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        {...register("confirmPassword", { required: true })}
                    />
                    {
                        errors.confirmPassword && <ErrorMessage message={errors.confirmPassword.message || ""} />
                    }
                </div>
                <Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
                    {signUpMutation.isPending ? (
                        <Loader />
                    ) : (
                        "Sign Up"
                    )}
                </Button>
                <Button variant="outline" onClick={handleGoogleSignIn} className="w-full flex items-center gap-2" disabled={signUpMutation.isPending}>
                    {signUpMutation.isPending ? (
                        <Loader />
                    ) : (
                        <>
                            <GoogleIcon height={16} width={16} />
                            <p>Signup with Google</p>
                        </>
                    )}
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to={"/auth/login"} className="underline">
                    Login
                </Link>
            </div>
        </form>
    )
}

export default SignUpPage
