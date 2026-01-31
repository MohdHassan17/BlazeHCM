import React from "react";
import LoginBG from "../../assets/components/login-bg.webp";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import BlazeHCM from '../../assets/logo/logo.png'

function Login() {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${LoginBG})` }}
    >
      {/* Form Container */}
      <div className="w-full h-full flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}

function LoginForm() {
  const loginSchema = z.object({
    email: z
      .email()
      .min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <Card className="w-[400px] ">
      <CardHeader className="items-center gap-2">
        <div className="">
            <img src={BlazeHCM} alt="BlazeHCM Logo" className="w-20 h-20" />
        </div>
        <CardTitle className="text-2xl">Login to BlazeHCM</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit((data) => console.log(data))}>
        <CardContent>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    {...field}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="Email"
                    className="w-full p-2 border rounded-md"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    {...field}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Password"
                    className="w-full p-2 border rounded-md"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" variant={"default"} className="w-full ">
            Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default Login;
