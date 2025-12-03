import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const schema = z
  .object({
    username: z.string().min(3, "Pick a username with at least 3 characters"),
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Provide a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const onSubmit = async (data: FormValues) => {
    try {
      await apiRequest("POST", "/api/auth/register", {
        username: data.username,
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast({ title: "Account created", description: "Please log in to continue." });
      reset();
      setLocation("/admin/login");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "An error occurred", variant: "destructive" });
    }
  };

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Sign up for a writer account at PKMedia.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </CardContent>
          <div className="p-4 border-t flex items-center justify-between">
            <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Signing up..." : "Sign up"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
