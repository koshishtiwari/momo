import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

enum LoginStep {
  EnterEmail,
  VerifyToken,
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(LoginStep.EnterEmail);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, verifyToken } = useAuth();
  const router = useRouter();

  const handleSubmitEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // In a real app, this would send a magic link to the user's email
      // For this demo, we'll just show the token directly
      const magicToken = await login(email);
      setStep(LoginStep.VerifyToken);
      setIsLoading(false);
      
      // Display instructions
      alert(`For this demo, use this token to login: ${magicToken}`);
    } catch (err) {
      setError('Failed to send login link. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifyToken(token);
      // Successfully logged in, redirect handled in useAuth hook
    } catch (err) {
      setError('Invalid or expired token. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Login - Momo Ecommerce">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Login</h1>

        {step === LoginStep.EnterEmail ? (
          <form onSubmit={handleSubmitEmail} className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                required
                placeholder="your@email.com"
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="btn w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>

            <p className="text-sm text-gray-600 mt-4">
              We'll send you a magic link for passwordless login.
              <br />
              For this demo, the token will be shown on screen.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyToken} className="space-y-4">
            <div>
              <label htmlFor="token" className="block font-medium mb-1">
                Enter Magic Link Token
              </label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input w-full"
                required
                placeholder="Enter the token from your magic link"
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              className="btn w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Token'}
            </button>

            <button
              type="button"
              className="text-sm underline block w-full mt-2"
              onClick={() => setStep(LoginStep.EnterEmail)}
            >
              Back to Email Input
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}