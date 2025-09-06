import { client } from '../../graphql/client';
import { gql } from '@apollo/client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

export default function Login() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const POST_LOGIN = gql`
        mutation Login($email: String!, $password: String!) {
            signIn(data: {
                email: $email,
                password: $password,
            }) {
                success
                message
                token
            }
        }
    `;
    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage("");
        try {
            const res = await client.mutate({
                mutation: POST_LOGIN,
                variables: {
                    email: event.target.email.value,
                    password: event.target.password.value
                }
            });
            const loginResult = res.data.signIn;
            setResult(loginResult);
            if (loginResult.success) {
                if (loginResult.token) {
                    localStorage.setItem('access_token', loginResult.token);
                }
                navigate('/task');
            } else {
                setMessage(loginResult.message || "Login failed. Please try again.");
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="return-btn">
                <a href="/" className="back-link">&larr; Back to Home</a>
            </div>
            <div className="auth-card">
                <h1 className="auth-title">Sign In</h1>
                <p className="auth-desc">Welcome back! Please log in to your account.</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input id="email" name='email' type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input id="password" name='password' type="password" placeholder="Enter your password" required />
                    </div>
                    <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
                </form>
                <div style={{ textAlign: 'center', margin: '0.5rem 0 0' }}>
                    <span style={{ color: '#aaa', fontWeight: 500 }}>or</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        type="button"
                        className="google-login-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.7rem',
                            background: '#fff',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '2rem',
                            padding: '0.7rem 2.2rem',
                            fontWeight: 600,
                            fontSize: '1.08rem',
                            color: '#23235b',
                            boxShadow: '0 2px 12px rgba(60,60,120,0.08)',
                            cursor: 'pointer',
                            transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                        }}
                        onClick={() => {
                            if (window.google && window.google.accounts && window.google.accounts.id) {
                               setMessage('Google login not available. Try with form.');
                            } else {
                                setMessage('Google login not available. Try with form.');
                            }
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_17_40)">
                                <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.02h12.98c-.56 3.02-2.24 5.58-4.78 7.3v6.06h7.74c4.54-4.18 7.112-10.34 7.112-17.676z" fill="#4285F4"/>
                                <path d="M24.48 48c6.48 0 11.92-2.14 15.89-5.82l-7.74-6.06c-2.14 1.44-4.88 2.3-8.15 2.3-6.26 0-11.56-4.22-13.46-9.9H2.5v6.22C6.46 43.78 14.7 48 24.48 48z" fill="#34A853"/>
                                <path d="M11.02 28.52a14.77 14.77 0 010-9.44v-6.22H2.5a24.01 24.01 0 000 21.88l8.52-6.22z" fill="#FBBC05"/>
                                <path d="M24.48 9.54c3.54 0 6.68 1.22 9.17 3.62l6.87-6.87C36.4 2.14 30.96 0 24.48 0 14.7 0 6.46 4.22 2.5 10.34l8.52 6.22c1.9-5.68 7.2-9.9 13.46-9.9z" fill="#EA4335"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_17_40">
                                    <rect width="48" height="48" fill="#fff"/>
                                </clipPath>
                            </defs>
                        </svg>
                        <span>Sign in with Google</span>
                    </button>
                </div>
                {message && <div className="auth-message auth-message-error">{message}</div>}
                {error && <div className="auth-message auth-message-error">{error.message}</div>}
                <p className="auth-link">
                    Don't have an account? <a href="/signup">Sign Up</a>
                </p>
            </div>
        </div>
    );
}

