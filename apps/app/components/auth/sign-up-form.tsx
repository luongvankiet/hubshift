"use client";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "@workspace/ui/components/sonner";
// import { IconFacebook, IconGithub } from "@/assets/brand-icons";
// import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  useForm,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { PasswordInput } from "@workspace/ui/components/password-input";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter your email",
  }),
  password: z
    .string()
    .min(1, "Please enter your password")
    .min(7, "Password must be at least 8 characters long"),
});

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string;
}

export function SignUpForm({
  className,
  redirectTo,
  ...props
}: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: "Signing in...",
      success: () => {
        setIsLoading(false);

        // Set user and access token
        // auth.setUser(mockUser);
        // auth.setAccessToken("mock-access-token");

        // Redirect to the stored location or default to dashboard
        const targetPath = redirectTo || "/dashboard";
        router.push(targetPath);

        return `Welcome back, ${data.email}!`;
      },
      error: "Error",
    });
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-start mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Sign in</h2>
        <p className="text-muted-foreground text-sm">
          Enter your email and password below <br />
          to log into your account
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("grid gap-4", className)}
          {...props}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75"
                >
                  Forgot password?
                </Link>
              </FormItem>
            )}
          />
          <Button className="my-4" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
            Sign in
          </Button>

          {/* <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              Or continue with
            </span>
          </div>
        </div> */}

          {/* <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" disabled={isLoading}>
            <IconGithub className="h-4 w-4" /> GitHub
          </Button>
          <Button variant="outline" type="button" disabled={isLoading}>
            <IconFacebook className="h-4 w-4" /> Facebook
          </Button>
        </div> */}
        </form>
      </Form>
    </>
  );
}
