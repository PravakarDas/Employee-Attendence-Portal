import { useProtectedRoute } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Header from '../components/common/Header';
import EmployeeDashboard from '../components/employee/Dashboard';

const DashboardPage = () => {
  useProtectedRoute();

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