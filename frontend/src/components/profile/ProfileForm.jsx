'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/Loading';
import toast from 'react-hot-toast';

const ProfileForm = ({ user }) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      role: user?.role || '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Prepare update data
      const updateData = {
        name: data.name,
        department: data.department,
      };

      // Only include password if user wants to change it
      if (showPasswordFields && data.password) {
        if (data.password !== data.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        updateData.password = data.password;
      }

      await updateUser(updateData);
      
      setIsEditing(false);
      setShowPasswordFields(false);
      
      // Reset password fields
      reset({
        ...data,
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPasswordFields(false);
    reset({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      role: user?.role || '',
      password: '',
      confirmPassword: '',
    });
  };

  const getRoleBadgeColor = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Profile Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role)}`}>
            {user?.role === 'admin' ? 'Administrator' : 'Employee'}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6">
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
              type="text"
              disabled={!isEditing}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                isEditing
                  ? 'border-gray-300 bg-white'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              } ${errors.name ? 'border-red-300' : ''}`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              disabled
              className="block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Department Field */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              {...register('department', {
                required: 'Department is required',
              })}
              type="text"
              disabled={!isEditing}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                isEditing
                  ? 'border-gray-300 bg-white'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              } ${errors.department ? 'border-red-300' : ''}`}
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>

          {/* Role Field (Read-only) */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              {...register('role')}
              type="text"
              disabled
              className="block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm capitalize"
            />
            <p className="mt-1 text-xs text-gray-500">Role cannot be changed</p>
          </div>

          {/* Change Password Section */}
          {isEditing && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {showPasswordFields ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordFields && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      {...register('password', {
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      type="password"
                      autoComplete="new-password"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      {...register('confirmPassword', {
                        validate: (value) =>
                          !password || value === password || 'Passwords do not match',
                      })}
                      type="password"
                      autoComplete="new-password"
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Account Information */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Account Information</h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-500">Employee ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{user?._id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Account Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ProfileForm;
