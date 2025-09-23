// src/app/Auth/Login.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '../../configs/api.config';
import { AuthVar } from './AuthVar';
import './style.css';
import { POST_LOGIN, GOOGLE_OAUTH_LOGIN } from './services/login.service';
import { useAuthStore } from '../../stores/useAuthStore';

export default function Login() {
    const CLIENT_ID = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || '';
    const [message, setMessage] = useState('');
    const [backendError, setBackendError] = useState(null);
    const googleBtnRef = useRef(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const setAuth = useAuthStore(state => state.setAuth);
    const setUser = useAuthStore(state => state.setUser); // nếu cần riêng

    const loginMutation = useMutation({
        mutationFn: (vars) => graphqlRequest(POST_LOGIN, vars),
        onSuccess(data) {
            const loginResult = data.signIn;
            if (loginResult.success) {
                if (loginResult.token) localStorage.setItem('token', loginResult.token);
                if (loginResult.user) {
                    setAuth({ token: loginResult.token, user: loginResult.user });
                }
                queryClient.invalidateQueries(['me']);
                try {
                    const payload = JSON.parse(atob(loginResult.token.split('.')[1]));
                    const role = payload.role;
                    if (role === 'ADMIN') navigate('/admin');
                    else navigate('/task');
                } catch (err) {
                    navigate('/');
                }
            } else {
                setMessage(loginResult.message || 'Login failed.');
            }
        },
        onError(error) {
            setBackendError(error);
        },
    });



    const googleMutation = useMutation({
        mutationFn: ({ idToken }) => graphqlRequest(GOOGLE_OAUTH_LOGIN, { idToken }),
        onSuccess(data) {
            const loginResult = data.googleLogin;
            if (loginResult.success) {
                if (loginResult.token) localStorage.setItem('token', loginResult.token);
                if (loginResult.user) {
                    setAuth({ token: loginResult.token, user: loginResult.user });
                }
                queryClient.invalidateQueries(['me']);
                navigate('/task');
            } else {
                setMessage(loginResult.message || 'Google login failed.');
            }
        },
        onError(error) {
            setBackendError(error);
        }
    });


    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        setBackendError(null);
        await loginMutation.mutateAsync({
            email: e.target.email.value,
            password: e.target.password.value,
        });
    }

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

    async function handleCredentialResponse(response) {
        if (!response || !response.credential) {
            setBackendError(new Error('No credential received from Google'));
            return;
        }
        await googleMutation.mutateAsync({ idToken: response.credential });
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
                    <button className="auth-btn" type="submit" disabled={loginMutation.isLoading}>
                        {loginMutation.isLoading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', margin: '0.5rem 0 0' }}>
                    <span style={{ color: '#aaa', fontWeight: 500 }}>or</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '1.2rem 0' }}>
                    <div ref={googleBtnRef}></div>
                </div>

                <div style={{ marginTop: 12 }}>
                    {(loginMutation.isLoading || googleMutation.isLoading) && <div>Loading...</div>}
                    {message && <div className="auth-message auth-message-error">{message}</div>}
                    {backendError && <div className="auth-message auth-message-error">{backendError.message}</div>}
                </div>
            </div>
        </div>
    );
}
