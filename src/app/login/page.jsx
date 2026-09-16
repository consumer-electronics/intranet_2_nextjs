import LoginForm from "@/components/login/loginForm";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}