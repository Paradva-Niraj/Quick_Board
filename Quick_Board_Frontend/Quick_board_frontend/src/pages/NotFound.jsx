import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-lg text-gray-700 mb-6">Page Not Found</p>
      <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl">
        Go Home
      </Link>
    </div>
  );
}
