import { client } from '../../graphql/client';
import { gql } from '@apollo/client';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {AuthVar} from './AuthVar';
import './style.css';

export default function Login() {
    const CLIENT_ID = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_CLIENT_ID;
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [backendResp, setBackendResp] = useState(null);
    const googleBtnRef = useRef(null);
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
                user {
                  id
                  email
                  firstName
                  lastName
                }
            }
        }
    `;
    const GOOGLE_OAUTH_LOGIN = gql`
        mutation GoogleLogin($idToken: String!) {
            googleLogin(idToken: $idToken) {
                success
                message
                token
                user {
                  id
                  email
                  firstName
                  lastName
                }
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
                // Mutate AuthVar properties instead of reassigning
                if (loginResult.user) {
                  AuthVar.userId = loginResult.user.id || '';
                  AuthVar.email = loginResult.user.email || '';
                  AuthVar.firstName = loginResult.user.firstName || '';
                  AuthVar.lastName = loginResult.user.lastName || '';
                }
                console.log(AuthVar);
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

    // Load Google Identity Services script and render button
    useEffect(() => {
        function loadGoogleScript(cb) {
            if (window.google && window.google.accounts && window.google.accounts.id) {
                cb();
                return;
            }
            const existingScript = document.getElementById('google-identity-services');
            if (!existingScript) {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.id = 'google-identity-services';
                script.onload = cb;
                document.body.appendChild(script);
            } else {
                if (existingScript.onload) {
                    existingScript.onload = () => { existingScript.onload = null; cb(); };
                } else {
                    cb();
                }
            }
        }
        loadGoogleScript(() => {
            if (window.google && window.google.accounts && window.google.accounts.id && googleBtnRef.current) {
                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: handleCredentialResponse,
                });
                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: 'outline',
                    size: 'large',
                });
            }
        });
    }, [CLIENT_ID]);

    // Log the Google idToken to the console
    async function handleCredentialResponse(response) {
        if (!response || !response.credential) {
            setError('No credential received from Google');
            return;
        }
        console.log('idToken:', response.credential);
         try {
            const res = await client.mutate({
                mutation: GOOGLE_OAUTH_LOGIN,
                variables: {
                    idToken: response.credential
                }
            });
            const loginResult = res.data.googleLogin;
            setResult(loginResult);
            if (loginResult.success) {
                if (loginResult.token) {
                    localStorage.setItem('access_token', loginResult.token);
                }
                if (loginResult.user) {
                  AuthVar.userId = loginResult.user.id || '';
                  AuthVar.email = loginResult.user.email || '';
                  AuthVar.firstName = loginResult.user.firstName || '';
                  AuthVar.lastName = loginResult.user.lastName || '';
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
        console.log('segments:', response.credential.split('.').length); // should be 3
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
                <div style={{ display: 'flex', justifyContent: 'center', margin: '1.2rem 0' }}>
                    <div ref={googleBtnRef}></div>
                </div>
                <div style={{ marginTop: 12 }}>
                    {loading && <div>Loading...</div>}
                    {message && <div className="auth-message auth-message-error">{message}</div>}
                    {error && <div className="auth-message auth-message-error">{typeof error === 'string' ? error : error?.message}</div>}
                    {/* Show a more helpful message for Google OAuth errors */}
                    {typeof error === 'string' && error.includes('google.com') && (
                        <div style={{ color: 'crimson', marginTop: 8 }}>
                            <strong>Google login failed.</strong><br />
                            Please check your Google Cloud Console OAuth settings.<br />
                            See the code comments above for details.
                        </div>
                    )}
                    {backendResp && (
                        <div>
                            <h3>Backend response</h3>
                            <pre style={{ background: '#f6f8fa', padding: 8 }}>{JSON.stringify(backendResp, null, 2)}</pre>
                        </div>
                    )}
                </div>
                {/* <p className="auth-link">
                    Don't have an account? <a href="/signup">Sign Up</a>
                </p> */}
            </div>
        </div>
    );
}

