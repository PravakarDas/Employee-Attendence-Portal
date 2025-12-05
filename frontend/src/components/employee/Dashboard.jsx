'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendance';
import { LoadingSpinner } from '../common/Loading';
import CheckInButton from './CheckInButton';
import AttendanceTable from './AttendanceTable';
import { formatDateTime, getAttendanceStatusMessage } from '../../utils/helpers';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAttendanceTable, setShowAttendanceTable] = useState(false);

  useEffect(() => {
    loadCurrentStatus();
    loadStats();
  }, []);

  const loadCurrentStatus = async () => {
    try {
      const response = await attendanceService.getCurrentStatus();
      if (response.success) {
        setCurrentStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load current status:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await attendanceService.getEmployeeAttendance(user._id, {
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        endDate: new Date(),
        limit: 100
      });

      if (response.success) {
        const attendanceRecords = response.data.attendance;
        const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0);
        const daysPresent = attendanceRecords.filter(record => record.check_out).length;

        setStats({
          totalHours: totalHours.toFixed(2),
          daysPresent,
          averageHours: daysPresent > 0 ? (totalHours / daysPresent).toFixed(2) : '0.00'
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInSuccess = () => {
    loadCurrentStatus();
    loadStats();
  };

  const handleCheckOutSuccess = () => {
    loadCurrentStatus();
    loadStats();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="xl" color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's your attendance overview for today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Days Present (This Week)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.daysPresent || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Hours (This Week)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalHours || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Average Hours/Day
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.averageHours || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Check In/Out Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Today's Attendance
            </h3>

            {currentStatus?.todayAttendance ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        Today's Check-in: {formatDateTime(currentStatus.todayAttendance.check_in)}
                        {currentStatus.todayAttendance.check_out && (
                          <span> | Check-out: {formatDateTime(currentStatus.todayAttendance.check_out)}</span>
                        )}
                      </p>
                      {currentStatus.todayAttendance.total_hours && (
                        <p className="text-sm text-green-700 mt-1">
                          Total hours: {currentStatus.todayAttendance.total_hours.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <CheckInButton
                  isActive={currentStatus.isActive}
                  activeAttendance={currentStatus.activeAttendance}
                  onCheckInSuccess={handleCheckInSuccess}
                  onCheckOutSuccess={handleCheckOutSuccess}
                />
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckInButton
                  isActive={currentStatus?.isActive}
                  activeAttendance={currentStatus?.activeAttendance}
                  onCheckInSuccess={handleCheckInSuccess}
                  onCheckOutSuccess={handleCheckOutSuccess}
                />
              </div>
            )}
          </div>
        </div>

        {/* Attendance History Toggle */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Attendance History
              </h3>
              <button
                onClick={() => setShowAttendanceTable(!showAttendanceTable)}
                className="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                {showAttendanceTable ? 'Hide' : 'Show'} History
              </button>
            </div>

            {showAttendanceTable && (
              <AttendanceTable employeeId={user?._id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;