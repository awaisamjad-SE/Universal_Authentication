import { useState } from 'react';
import { emergencyDisable2FA, requestRecovery } from '../utils/api';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

export default function TwoFARecovery() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestingOTP, setRequestingOTP] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    setRequestingOTP(true);
    
    try {
      await requestRecovery({ email });
      setOtpRequested(true);
      toast.success('Recovery OTP sent to your email! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send recovery OTP');
    } finally {
      setRequestingOTP(false);
    }
  };

  const handleEmergencyDisable = async (e) => {
    e.preventDefault();
    
    if (!email || !otp) {
      toast.error('Please fill all fields');
      return;
    }

    if (!confirmed) {
      toast.error('Please confirm that you want to disable 2FA');
      return;
    }

    setSubmitting(true);
    
    try {
      const res = await emergencyDisable2FA({
        email,
        otp,
        confirm_disable: true
      });
      
      setSuccess(true);
      toast.success(res.data.detail);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Recovery failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">2FA Disabled Successfully</h2>
          <p className="text-gray-600 mb-4">
            Two-factor authentication has been completely removed from your account.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Your account is now less secure. Please re-enable 2FA as soon as possible.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to login page in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Emergency 2FA Recovery</h2>
          <p className="text-sm text-gray-600">
            Use this only if you've completely lost access to your authenticator app
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Warning: This will completely disable 2FA
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Your account will be less secure</li>
                  <li>All backup codes will be deleted</li>
                  <li>You'll need to set up 2FA again from scratch</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How to get OTP Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                📧 How to get the Recovery OTP
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Enter your email address above</li>
                  <li>Click "Send OTP" button</li>
                  <li>Check your email inbox</li>
                  <li>Enter the 6-digit code you received</li>
                </ol>
                <p className="mt-2 text-xs">
                  💡 The OTP expires in 10 minutes. If you don't receive it, check your spam folder.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleEmergencyDisable} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={requestingOTP || !email}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {requestingOTP ? <Loader /> : 'Send OTP'}
              </button>
            </div>
            {otpRequested && (
              <p className="text-sm text-green-600 mt-1">
                ✅ OTP sent to your email! Check your inbox and enter the code below.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recovery OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the OTP sent to your email from the recovery request
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="confirm"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="confirm" className="font-medium text-gray-700">
                I understand that this will completely disable 2FA and make my account less secure
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !confirmed}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-md focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader /> : 'Disable 2FA Completely'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Still have access to your authenticator app?
          </p>
          <a
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Try logging in normally
          </a>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact support for assistance with your account recovery.
          </p>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}