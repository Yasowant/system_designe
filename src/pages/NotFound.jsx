import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container section page center">
      <p className="mono big accent">404</p>
      <h1>This route isn’t <span className="serif">sharded</span> here.</h1>
      <p className="muted">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn btn-primary">Back to topics</Link>
    </div>
  )
}
