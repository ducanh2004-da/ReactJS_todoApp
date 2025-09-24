// src/app/Auth/Register.jsx  (chỉ phần chính; điều chỉnh path import)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '../../configs/api.config';
import { AuthVar } from './AuthVar';
import { POST_REGISTER } from './services/register.service';
import './style.css';
import { useAuthStore } from '../../stores/useAuthStore';

export default function Register() {
    const [message, setMessage] = useState('');
    const [backendError, setBackendError] = useState(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const setAuth = useAuthStore(state => state.setAuth);

    const mutation = useMutation({
        mutationFn: (variables) => graphqlRequest(POST_REGISTER, variables),
        onSuccess(data) {
            const registerResult = data.signUp;
            if (registerResult.success) {
                if (registerResult.token) {
                    localStorage.setItem('token', registerResult.token);
                }
                if (registerResult.user) {
                    setAuth({ token: registerResult.token, user: registerResult.user });
                }

                // queryClient.invalidateQueries(['me']);

                try {
                    const payload = JSON.parse(atob(registerResult.token.split('.')[1]));
                    const role = payload.role;
                    if (role === 'ADMIN') navigate('/admin');
                    else navigate('/task');
                } catch (err) {
                    navigate('/');
                }
            } else {
                setMessage(registerResult.message || 'Registration failed.');
            }
        },
        onError(error) {
            setBackendError(error);
        },
    });


    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        setBackendError(null);
        const variables = {
            email: e.target.email.value,
            password: e.target.password.value,
            firstName: e.target.firstName.value,
            lastName: e.target.lastName.value,
        };
        try {
            await mutation.mutateAsync(variables);
        } catch (err) {
            // already handled in onError, but can show fallback
            console.error(err);
        }
    }

    return (
        <div className="auth-container">
            <div className="return-btn">
                <a href="/" className="back-link">&larr; Back to Home</a>
            </div>
            <div className="auth-card">
                <h1 className="auth-title">Sign Up</h1>
                <p className="auth-desc">Create your account to get started.</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label htmlFor="firstName">First name</label>
                        <input id="firstName" name="firstName" type="text" placeholder="Enter your first name" required />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="lastName">Last name</label>
                        <input id="lastName" name="lastName" type="text" placeholder="Enter your last name" required />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input id="email" name='email' type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input id="password" name='password' type="password" placeholder="Create a password" required />
                    </div>
                    <button className="auth-btn" type="submit" disabled={mutation.isLoading}>
                        {mutation.isLoading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                {message && <div className="auth-message auth-message-error">{message}</div>}
                {backendError && <div className="auth-message auth-message-error">{backendError.message}</div>}
            </div>
        </div>
    );
}
