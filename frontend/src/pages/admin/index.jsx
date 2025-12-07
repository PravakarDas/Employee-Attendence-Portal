'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin';
import { LoadingSpinner } from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      name: 'Total Employees',
      value: dashboard?.overview?.totalEmployees || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Present Today',
      value: dashboard?.overview?.presentToday || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Absent Today',
      value: dashboard?.overview?.absentToday || 0,
      icon: XCircleIcon,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      name: 'Active Now',
      value: dashboard?.overview?.activeNow || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Trend Chart */}
        {dashboard?.weeklyTrend && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Attendance Trend</h3>
            <div className="flex items-end space-x-2 h-48">
              {dashboard.weeklyTrend.map((day) => {
                const maxCheckIns = Math.max(...dashboard.weeklyTrend.map(d => d.checkIns), 1);
                const height = (day.checkIns / maxCheckIns) * 100;
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden relative" style={{ height: '180px' }}>
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-lg transition-all duration-300 hover:bg-indigo-700"
                        style={{ height: `${height}%` }}
                        title={`${day.checkIns} check-ins`}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-900">{dayName}</p>
                      <p className="text-xs text-gray-500">{day.checkIns}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Stats */}
          {dashboard?.departmentStats && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department Attendance</h3>
              <div className="space-y-4">
                {dashboard.departmentStats.map((dept) => {
                  const attendanceRate = dept.total > 0 ? (dept.present / dept.total) * 100 : 0;

                  return (
                    <div key={dept.department}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                        <span className="text-sm text-gray-500">
                          {dept.present} / {dept.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${attendanceRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {dept.checkedOut} checked out • {dept.absent} absent
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {dashboard?.recentActivity && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboard.recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No activity yet today</p>
                ) : (
                  dashboard.recentActivity.map((activity) => (
                    <div key={activity._id} className="flex items-center space-x-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {activity.employee_id?.name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.employee_id?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.employee_id?.department}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-xs font-medium ${activity.check_out ? 'text-red-600' : 'text-green-600'}`}>
                          {activity.check_out ? 'Checked Out' : 'Checked In'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.check_out || activity.check_in).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
