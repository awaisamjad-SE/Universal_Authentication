import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/authContext';
import { get2FAStatus } from '../utils/api';

export default function TwoFADemo() {
  const { user } = useContext(AuthContext);
  const [twoFAStatus, setTwoFAStatus] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTwoFAStatus();
    }
  }, [user]);

  const fetchTwoFAStatus = async () => {
    try {
      const response = await get2FAStatus();
      setTwoFAStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    }
  };

  const endpoints = [
    {
      name: '2FA Status',
      path: '/api/2fa/status/',
      method: 'GET',
      description: 'Check current 2FA status for authenticated user',
      requiresAuth: true,
      component: '/2fa-management',
      demo: 'Check 2FA Status'
    },
    {
      name: '2FA Setup',
      path: '/api/2fa/setup/',
      method: 'POST',
      description: 'Initialize 2FA setup and get QR code',
      requiresAuth: true,
      component: '/2fa-management',
      demo: 'Setup 2FA'
    },
    {
      name: '2FA Toggle',
      path: '/api/2fa/toggle/',
      method: 'POST',
      description: 'Enable or disable 2FA with verification code',
      requiresAuth: true,
      component: '/2fa-management',
      demo: 'Enable/Disable 2FA'
    },
    {
      name: '2FA Login',
      path: '/api/2fa/login/',
      method: 'POST',
      description: 'Login with email, password, and 2FA code',
      requiresAuth: false,
      component: '/enhanced-login',
      demo: 'Login with 2FA'
    },
    {
      name: 'Backup Codes',
      path: '/api/2fa/backup-codes/',
      method: 'POST',
      description: 'Generate new backup recovery codes',
      requiresAuth: true,
      component: '/2fa-management',
      demo: 'Generate Backup Codes'
    },
    {
      name: 'Recovery Login',
      path: '/api/2fa/recovery-login/',
      method: 'POST',
      description: 'Login using backup recovery code',
      requiresAuth: false,
      component: '/enhanced-login',
      demo: 'Recovery Login'
    },
    {
      name: 'Recovery Request',
      path: '/api/2fa/recovery-request/',
      method: 'POST',
      description: 'Request recovery help via email',
      requiresAuth: false,
      component: '/enhanced-login',
      demo: 'Request Recovery'
    },
    {
      name: 'Emergency Disable',
      path: '/api/2fa/emergency-disable/',
      method: 'POST',
      description: 'Emergency disable 2FA with email OTP',
      requiresAuth: false,
      component: '/2fa-recovery',
      demo: 'Emergency Disable'
    }
  ];

  const userFlows = [
    {
      title: 'First Time Setup',
      steps: [
        '1. User logs in normally',
        '2. Goes to 2FA Management',
        '3. Clicks "Enable 2FA"',
        '4. Scans QR code with authenticator app',
        '5. Enters verification code',
        '6. Downloads backup codes',
        '7. 2FA is now enabled'
      ],
      startLink: '/2fa-management',
      status: user?.is_2fa_enabled ? 'completed' : 'available'
    },
    {
      title: 'Normal Login with 2FA',
      steps: [
        '1. User enters email and password',
        '2. System detects 2FA is enabled',
        '3. Shows 2FA code input field',
        '4. User enters code from authenticator app',
        '5. Successfully logs in'
      ],
      startLink: '/enhanced-login',
      status: user ? 'available' : 'demo'
    },
    {
      title: 'Recovery with Backup Codes',
      steps: [
        '1. User lost phone but has backup codes',
        '2. Clicks "Use backup recovery code"',
        '3. Enters email, password, and backup code',
        '4. Successfully logs in',
        '5. Backup code is consumed (single use)'
      ],
      startLink: '/enhanced-login',
      status: 'demo'
    },
    {
      title: 'Emergency Recovery',
      steps: [
        '1. User lost everything (phone + backup codes)',
        '2. Clicks "Can\'t access 2FA? Get help"',
        '3. Enters email address',
        '4. Receives recovery email with OTP',
        '5. Uses OTP to completely disable 2FA',
        '6. Can now login normally'
      ],
      startLink: '/enhanced-login',
      status: 'demo'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            2FA Complete Implementation Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Comprehensive Two-Factor Authentication with Recovery Options
          </p>
          
          {/* Current Status */}
          {user && twoFAStatus && (
            <div className="inline-block bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Your Current Status</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                <div>
                  <span className="font-medium">2FA Status:</span>{' '}
                  <span className={twoFAStatus.is_2fa_enabled ? 'text-green-600' : 'text-red-600'}>
                    {twoFAStatus.is_2fa_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Has Backup Codes:</span>{' '}
                  <span className={twoFAStatus.has_backup_codes ? 'text-green-600' : 'text-red-600'}>
                    {twoFAStatus.has_backup_codes ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">TOTP Secret:</span>{' '}
                  <span className={twoFAStatus.has_totp_secret ? 'text-green-600' : 'text-red-600'}>
                    {twoFAStatus.has_totp_secret ? 'Configured' : 'Not Set'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Endpoints */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints (8 Total)</h2>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{endpoint.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {endpoint.method}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-3">
                    {endpoint.path}
                  </code>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {endpoint.requiresAuth ? '🔒 Requires Auth' : '🌐 Public'}
                    </span>
                    <Link
                      to={endpoint.component}
                      className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    >
                      {endpoint.demo}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Flows */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Flows</h2>
            <div className="space-y-6">
              {userFlows.map((flow, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{flow.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      flow.status === 'completed' ? 'bg-green-100 text-green-800' :
                      flow.status === 'available' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {flow.status}
                    </span>
                  </div>
                  <ol className="text-sm text-gray-600 space-y-1 mb-4">
                    {flow.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ol>
                  <Link
                    to={flow.startLink}
                    className="inline-block text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                  >
                    Try This Flow
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/2fa-management"
              className="bg-indigo-600 text-white p-4 rounded-lg text-center hover:bg-indigo-700 transition-colors"
            >
              <div className="text-lg font-semibold mb-1">Manage 2FA</div>
              <div className="text-sm opacity-90">Setup, Enable, Disable</div>
            </Link>
            <Link
              to="/enhanced-login"
              className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
            >
              <div className="text-lg font-semibold mb-1">Enhanced Login</div>
              <div className="text-sm opacity-90">2FA + Recovery Options</div>
            </Link>
            <Link
              to="/2fa-recovery"
              className="bg-red-600 text-white p-4 rounded-lg text-center hover:bg-red-700 transition-colors"
            >
              <div className="text-lg font-semibold mb-1">Recovery Page</div>
              <div className="text-sm opacity-90">Emergency Disable</div>
            </Link>
            <Link
              to="/2fa-test"
              className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
            >
              <div className="text-lg font-semibold mb-1">API Tester</div>
              <div className="text-sm opacity-90">Test All Endpoints</div>
            </Link>
          </div>
        </div>

        {/* Security Features */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Backup Codes</h3>
              <p className="text-sm text-gray-600">Single-use recovery codes that auto-delete after use</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Recovery</h3>
              <p className="text-sm text-gray-600">Email-based recovery with time-limited OTPs</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Emergency Disable</h3>
              <p className="text-sm text-gray-600">Complete 2FA removal for account recovery</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM20.07 2.93L23 5.86 5.86 23 2.93 20.07 20.07 2.93z"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Audit Trail</h3>
              <p className="text-sm text-gray-600">Track all recovery method usage for security</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
              <p className="text-sm text-gray-600">Email alerts when recovery methods are used</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Time Limits</h3>
              <p className="text-sm text-gray-600">All recovery codes expire for added security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}