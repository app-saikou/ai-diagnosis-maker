import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-16 w-16 text-primary-500 mb-6" />
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      
      <p className="text-lg text-gray-600 mb-8 max-w-lg">
        We couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      
      <div className="flex space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-outline"
        >
          Go Back
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="btn-primary flex items-center"
        >
          <Home className="h-5 w-5 mr-2" />
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;