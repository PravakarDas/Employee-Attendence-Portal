'use client';

import React, { useState } from 'react';
import { attendanceService } from '../../services/attendance';
import { faceService } from '../../services/face';
import FaceCapture from '../face/FaceCapture';
import { LoadingSpinner } from '../common/Loading';
import { formatTime, calculateDuration } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CheckInButton = ({ isActive, activeAttendance, onCheckInSuccess, onCheckOutSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceVerificationMode, setFaceVerificationMode] = useState(null); // 'checkin' or 'checkout'
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFaceVerification = async (imageData) => {
    try {
      setIsVerifying(true);
      const response = await faceService.verifyFace(imageData);

      if (response.success && response.data.matched) {
        toast.success(`Identity verified: ${response.data.employee.name}`);
        setShowFaceCapture(false);
        
        // Proceed with check-in or check-out
        if (faceVerificationMode === 'checkin') {
          await performCheckIn();
        } else if (faceVerificationMode === 'checkout') {
          await performCheckOut();
        }
      } else {
        toast.error('Face not recognized. Please try again or contact admin.');
        setShowFaceCapture(false);
      }
    } catch (error) {
      console.error('Face verification error:', error);
      const errorMsg = error.response?.data?.error || 'Face verification failed';
      toast.error(errorMsg);
      setShowFaceCapture(false);
    } finally {
      setIsVerifying(false);
      setFaceVerificationMode(null);
    }
  };

  const performCheckIn = async () => {
    setIsLoading(true);
    try {
      const response = await attendanceService.checkIn();
      if (response.success) {
        toast.success('Check-in successful!');
        onCheckInSuccess && onCheckInSuccess();
      } else {
        throw new Error(response.error || 'Check-in failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Check-in failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const performCheckOut = async () => {
    setIsLoading(true);
    try {
      const response = await attendanceService.checkOut();
      if (response.success) {
        toast.success('Check-out successful!');
        onCheckOutSuccess && onCheckOutSuccess();
      } else {
        throw new Error(response.error || 'Check-out failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Check-out failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = () => {
    setFaceVerificationMode('checkin');
    setShowFaceCapture(true);
  };

  const handleCheckOut = () => {
    setFaceVerificationMode('checkout');
    setShowFaceCapture(true);
  };

  const handleCancelFaceCapture = () => {
    setShowFaceCapture(false);
    setFaceVerificationMode(null);
  };

  // Show face capture modal
  if (showFaceCapture) {
    return (
      <div className="text-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Face Verification Required
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Please position your face within the circle and capture a clear photo for verification.
          </p>
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Verifying your identity...</p>
            </div>
          ) : (
            <FaceCapture
              onCapture={handleFaceVerification}
              onCancel={handleCancelFaceCapture}
              mode="verify"
            />
          )}
        </div>
      </div>
    );
  }

  if (isActive && activeAttendance) {
    const duration = calculateDuration(activeAttendance.check_in, new Date());

    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Checked in at {formatTime(activeAttendance.check_in)}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Current duration: {duration}
          </p>
        </div>

        <button
          onClick={handleCheckOut}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">Checking out...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Check Out
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">
          <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Not checked in
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {new Date().toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={handleCheckIn}
        disabled={isLoading}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" color="white" />
            <span className="ml-2">Checking in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Check In
          </>
        )}
      </button>
    </div>
  );
};

export default CheckInButton;