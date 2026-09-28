import { Suspense } from "react";
import { googleEnabled } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm googleEnabled={googleEnabled} />
    </Suspense>
  );
}
