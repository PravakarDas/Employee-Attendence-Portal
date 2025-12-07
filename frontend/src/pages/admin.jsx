import { useProtectedRoute } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Header from '../components/common/Header';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const AdminPage = () => {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  useProtectedRoute();

  useEffect(() => {
    // Redirect non-admin users to dashboard
    if (!isLoading && !isAdmin()) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header title="Admin Dashboard" />
        <AdminDashboard />
      </div>
    </ProtectedRoute>
  );
};

export default AdminPage;
