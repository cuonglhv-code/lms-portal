import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-red-100 p-4 rounded-full mb-6">
        <ShieldAlert className="w-12 h-12 text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        You do not have the required permissions to access the Admin Portal.
      </p>
      <Link 
        to="/"
        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};
