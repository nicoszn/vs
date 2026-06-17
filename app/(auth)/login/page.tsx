import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Sign in — Invex" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      subtitle="Enter your credentials to access your dashboard."
    >
      <LoginForm />
    </AuthShell>
  );
}
