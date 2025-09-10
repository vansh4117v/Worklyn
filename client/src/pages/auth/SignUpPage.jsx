import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { signUp } from "@/api/apiAuth";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  role: z.enum(["candidate", "recruiter"], { required_error: "Role is required" }),
});

export default function SignUpPage() {
  const navigate = useNavigate();
  const { fn: signupUser, loading, error, data } = useFetch(signUp);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "candidate",
    },
  });

  // Clear previous API errors when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName && error?.errors?.some((err) => err.field === fieldName)) {
        form.clearErrors(fieldName);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, error]);

  // Clear previous API field errors when the related field changes
  useEffect(() => {
    if (error?.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err) => {
        if (err.field && formSchema.keyof().options.includes(err.field)) {
          form.setError(err.field, {
            type: "manual",
            message: err.message,
          });
        }
      });
    }
  }, [error, form]);

  const onSubmit = (values) => {
    // Clear any previous API errors before new submission
    form.clearErrors();
    signupUser(values);
  };

  useEffect(() => {
    if (data&&Object.keys(data).length > 0 && !error) {
      setTimeout(() => {
        navigate("/auth/verify-email", { state: { email: form.getValues("email") } });
      }, 2500);
    }
  }, [data, error, navigate, form]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Join our community today! Fill in your details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && !error.errors && (
            <Alert variant="destructive" className="mb-6 animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error.message || "Failed to create account. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {data&&Object.keys(data).length > 0 && !error ? (
            <div className="space-y-6">
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50">
                // Registration successful, redirect to verification
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Verification Email Sent!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We've sent a verification code to{" "}
                  <span className="font-medium">{form.getValues("email")}</span>. Please check your
                  inbox and enter the code to verify your account.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Redirecting to verification page in 2 seconds...
                </div>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Role</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} defaultValue="candidate">
                          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 focus:border-indigo-500 dark:focus:border-indigo-400">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="candidate">Candidate</SelectItem>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-5 text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
