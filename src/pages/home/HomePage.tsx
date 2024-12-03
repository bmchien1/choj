import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="container mt-5">
            <header className="text-center mb-5">
                <h1 className="display-4 font-weight-bold">CHOJ</h1>
                <p className="lead text-muted">Giải quyết các thử thách lập trình và cải thiện kỹ năng của bạn</p>
            </header>

			{/* Statistics Section */}
            <div className="row g-4">
                <div className="col-md-3">
                    <div className="card text-center shadow-sm border-light rounded p-4">
                        <h3 className="display-6">1200+</h3>
                        <p className="lead text-muted">Coding Problems</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center shadow-sm border-light rounded p-4">
                        <h3 className="display-6">450+</h3>
                        <p className="lead text-muted">Quiz Tests</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center shadow-sm border-light rounded p-4">
                        <h3 className="display-6">10,000+</h3>
                        <p className="lead text-muted">Active Users</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-center shadow-sm border-light rounded p-4">
                        <h3 className="display-6">600,000+</h3>
                        <p className="lead text-muted">Code Submissions</p>
                    </div>
                </div>
            </div>

            <div className="row g-4 mt-4">
                {/* Explore Challenges Section */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-light rounded">
                        <div className="card-body">
                            <h2 className="card-title">Explore Challenges</h2>
                            <p className="card-text">
                                Dive into a variety of programming problems across different categories and difficulty levels. Hone your skills and track your progress.
                            </p>
                            <Link to="/problems" className="btn btn-primary w-100">Browse Problems</Link>
                        </div>
                    </div>
                </div>

                {/* Join the Community Section */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-light rounded">
                        <div className="card-body">
                            <h2 className="card-title">Join the Community</h2>
                            <p className="card-text">
                                Sign up to save your progress, compete with others, and climb the leaderboard.
                            </p>
                            <div className="d-flex justify-content-between">
                                <Link to="/login" className="btn btn-outline-primary w-48">Login</Link>
                                <Link to="/register" className="btn btn-outline-secondary w-48">Register</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Collaborators Section */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-light rounded">
                        <div className="card-body">
                            <h2 className="card-title">Our Collaborators</h2>
                            <p className="card-text">
                                Meet our trusted partners who help us bring quality challenges and resources to you.
                            </p>
                            <Link to="/collaborators" className="btn btn-info w-100">Meet the Collaborators</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mt-4">
                {/* Featured Challenges Section */}
                <div className="col-lg-6">
                    <div className="card shadow-sm border-light rounded">
                        <div className="card-body">
                            <h2 className="card-title">Featured Challenges</h2>
                            <p className="card-text">
                                Check out some of the most popular and challenging problems selected by our community.
                            </p>
                            <Link to="/featured" className="btn btn-warning w-100">Explore Featured</Link>
                        </div>
                    </div>
                </div>

                {/* Forum Section */}
                <div className="col-lg-6">
                    <div className="card shadow-sm border-light rounded">
                        <div className="card-body">
                            <h2 className="card-title">Join the Forum</h2>
                            <p className="card-text">
                                Participate in discussions, share solutions, and learn from others in our vibrant community forum.
                            </p>
                            <Link to="/forum" className="btn btn-success w-100">Visit Forum</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
