import { useProtectedRoute } from '../../hooks/useAuth';
import AdminLayout from '../../components/admin/AdminLayout';
import { Cog6ToothIcon, BellIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const SettingsPage = () => {
  useProtectedRoute(['admin']);

  return (
    <AdminLayout title="Settings">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-purple-100 rounded-full">
              <Cog6ToothIcon className="w-16 h-16 text-purple-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Settings Coming Soon
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            System settings, notifications, security preferences, 
            and user management will be available in Phase 2.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Cog6ToothIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700 mb-1">System Config</h3>
              <p className="text-sm text-gray-500">
                Working hours, holidays, policies
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <BellIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700 mb-1">Notifications</h3>
              <p className="text-sm text-gray-500">
                Email alerts and notification settings
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <ShieldCheckIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700 mb-1">Security</h3>
              <p className="text-sm text-gray-500">
                Password policy, 2FA, access logs
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700 mb-1">Roles</h3>
              <p className="text-sm text-gray-500">
                Role management and permissions
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
