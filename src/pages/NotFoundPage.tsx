import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

