'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Header from '../components/common/Header';
import ProfileForm from '../components/profile/ProfileForm';
import FaceRegistration from '../components/profile/FaceRegistration';
import { PageLoading } from '../components/common/Loading';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header title="My Profile" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <ProfileForm user={user} />
            <FaceRegistration />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
