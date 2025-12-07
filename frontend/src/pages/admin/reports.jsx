import { useProtectedRoute } from '../../hooks/useAuth';
import AdminLayout from '../../components/admin/AdminLayout';
import { ChartBarIcon, DocumentArrowDownIcon, CalendarIcon } from '@heroicons/react/24/outline';

const ReportsPage = () => {
  useProtectedRoute(['admin']);

  return (
    <AdminLayout title="Reports">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-blue-100 rounded-full">
              <ChartBarIcon className="w-16 h-16 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Reports Coming Soon
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Advanced reporting features including attendance reports, 
            export functionality, and analytics will be available in Phase 2.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <DocumentArrowDownIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700 mb-1">Export Reports</h3>
              <p className="text-sm text-gray-500">
                Export data to Excel, PDF, or CSV formats
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700 mb-1">Date Range Reports</h3>
              <p className="text-sm text-gray-500">
                Generate reports for custom date ranges
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <ChartBarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700 mb-1">Analytics</h3>
              <p className="text-sm text-gray-500">
                Detailed analytics and insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
