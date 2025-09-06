import './style.css';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <main className="home-hero">
            <div className="home-hero-content">
                <h1 className="home-title">Welcome to <span className="accent">Todo List App</span></h1>
                <p className="home-desc">Organize your tasks, manage your time, and boost your productivity with our simple and beautiful todo list application.</p>
                <div className="home-actions">
                    <Link to="/signin" className="home-btn home-btn-primary">Sign In</Link>
                    <Link to="/task" className="home-btn home-btn-secondary">Go to Tasks</Link>
                </div>
            </div>
            <div className="home-hero-graphic">
                <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="180" height="120" rx="24" fill="#f3f4fa"/>
                    <rect x="40" y="60" width="140" height="80" rx="16" fill="#e9eafc"/>
                    <rect x="60" y="80" width="100" height="40" rx="8" fill="#6366f1"/>
                    <circle cx="110" cy="100" r="12" fill="#fff"/>
                    <rect x="90" y="120" width="40" height="8" rx="4" fill="#a5b4fc"/>
                </svg>
            </div>
        </main>
    );
}