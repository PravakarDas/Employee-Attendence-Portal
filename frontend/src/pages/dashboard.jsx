import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProtectedRoute, useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Header from '../components/common/Header';
import EmployeeDashboard from '../components/employee/Dashboard';
import { LoadingSpinner } from '../components/common/Loading';

const DashboardPage = () => {
  useProtectedRoute();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect admins to admin dashboard
      if (user.role === 'admin') {
        router.replace('/admin');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is admin, show nothing while redirecting
  if (user && user.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header title="Employee Dashboard" />
        <EmployeeDashboard />
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;