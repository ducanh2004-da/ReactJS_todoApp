import { client } from '../../graphql/client';
import { gql } from '@apollo/client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
export default function Register() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const POST_REGISTER = gql`
        mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
            signUp(data: {
                email: $email,
                password: $password,
                firstName: $firstName,
                lastName: $lastName
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
                mutation: POST_REGISTER,
                variables: {
                    email: event.target.email.value,
                    password: event.target.password.value,
                    firstName: event.target.firstName.value,
                    lastName: event.target.lastName.value
                }
            });
            const registerResult = res.data.signUp;
            setResult(registerResult);
            if(registerResult.success){
                if(registerResult.token){
                    localStorage.setItem('access_token', registerResult.token);
                }
                navigate('/task');
            }
            else {
                setMessage(registerResult.message || "Registration failed. Please try again.");
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
                    <button className="auth-btn" type="submit">Sign Up</button>
                </form>
                {message && <div className="auth-message auth-message-error">{message}</div>}
                {error && <div className="auth-message auth-message-error">{error.message}</div>}
                {/* <p className="auth-link">
                    Have an account? <a href="/signin">Sign In</a>
                </p> */}
            </div>
        </div>
    );
}