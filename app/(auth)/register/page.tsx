import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Create account — Invex" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create account"
      subtitle="Join Invex to start investing and playing."
    >
      <RegisterForm />
    </AuthShell>
  );
}
