import { useState, useContext } from 'react';
import { 
  get2FAStatus,
  setup2FA,
  toggle2FA,
  generateBackupCodes,
  twoFALogin,
  recoveryLogin,
  requestRecovery,
  emergencyDisable2FA
} from '../utils/api';
import AuthContext from '../context/authContext';
import { toast } from 'react-toastify';

export default function TwoFATestPage() {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const addResult = (key, data) => {
    setResults(prev => ({ ...prev, [key]: data }));
  };

  const setLoadingState = (key, state) => {
    setLoading(prev => ({ ...prev, [key]: state }));
  };

  const testAPI = async (key, apiCall, params = {}) => {
    setLoadingState(key, true);
    try {
      const result = await apiCall(params);
      addResult(key, { success: true, data: result.data });
      toast.success(`${key} successful!`);
    } catch (error) {
      addResult(key, { success: false, error: error.response?.data || error.message });
      toast.error(`${key} failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoadingState(key, false);
    }
  };

  const testEndpoints = [
    {
      id: 'status',
      name: 'Get 2FA Status',
      description: 'Check current 2FA status for authenticated user',
      requiresAuth: true,
      action: () => testAPI('Get 2FA Status', get2FAStatus)
    },
    {
      id: 'setup',
      name: 'Setup 2FA',
      description: 'Initialize 2FA setup and get QR code',
      requiresAuth: true,
      action: () => testAPI('Setup 2FA', setup2FA)
    },
    {
      id: 'enable',
      name: 'Enable 2FA',
      description: 'Enable 2FA with verification code',
      requiresAuth: true,
      action: () => {
        const code = prompt('Enter 2FA code from your authenticator app:');
        if (code) {
          testAPI('Enable 2FA', toggle2FA, { action: 'enable', code });
        }
      }
    },
    {
      id: 'disable',
      name: 'Disable 2FA',
      description: 'Disable 2FA with verification code',
      requiresAuth: true,
      action: () => {
        const code = prompt('Enter 2FA code to disable:');
        if (code) {
          testAPI('Disable 2FA', toggle2FA, { action: 'disable', code });
        }
      }
    },
    {
      id: 'backup',
      name: 'Generate Backup Codes',
      description: 'Generate new backup recovery codes',
      requiresAuth: true,
      action: () => testAPI('Generate Backup Codes', generateBackupCodes)
    },
    {
      id: '2fa-login',
      name: 'Test 2FA Login',
      description: 'Login with email, password, and 2FA code',
      requiresAuth: false,
      action: () => {
        const email = prompt('Enter email:');
        const password = prompt('Enter password:');
        const code = prompt('Enter 2FA code:');
        if (email && password && code) {
          testAPI('2FA Login', twoFALogin, { email, password, code });
        }
      }
    },
    {
      id: 'recovery-login',
      name: 'Test Recovery Login',
      description: 'Login with backup recovery code',
      requiresAuth: false,
      action: () => {
        const email = prompt('Enter email:');
        const password = prompt('Enter password:');
        const recovery_code = prompt('Enter recovery code:');
        if (email && password && recovery_code) {
          testAPI('Recovery Login', recoveryLogin, { email, password, recovery_code });
        }
      }
    },
    {
      id: 'request-recovery',
      name: 'Request Recovery',
      description: 'Request recovery help via email',
      requiresAuth: false,
      action: () => {
        const email = prompt('Enter email:');
        if (email) {
          testAPI('Request Recovery', requestRecovery, { email });
        }
      }
    },
    {
      id: 'emergency-disable',
      name: 'Emergency Disable',
      description: 'Emergency disable 2FA with OTP',
      requiresAuth: false,
      action: () => {
        const email = prompt('Enter email:');
        const otp = prompt('Enter OTP from recovery email:');
        if (email && otp) {
          testAPI('Emergency Disable', emergencyDisable2FA, { 
            email, 
            otp, 
            confirm_disable: true 
          });
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">2FA API Test Suite</h1>
            <p className="text-sm text-gray-600 mt-1">
              Test all 2FA and recovery endpoints
              {user && (
                <span className="ml-2 text-green-600">
                  • Logged in as {user.email}
                </span>
              )}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Test Buttons */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Available Tests</h2>
                <div className="space-y-3">
                  {testEndpoints.map((endpoint) => (
                    <div key={endpoint.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{endpoint.name}</h3>
                          <p className="text-sm text-gray-600">{endpoint.description}</p>
                          {endpoint.requiresAuth && !user && (
                            <p className="text-xs text-red-600 mt-1">Requires authentication</p>
                          )}
                        </div>
                        <button
                          onClick={endpoint.action}
                          disabled={loading[endpoint.name] || (endpoint.requiresAuth && !user)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading[endpoint.name] ? 'Testing...' : 'Test'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Test Results</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(results).length === 0 ? (
                    <p className="text-gray-500 text-sm">No tests run yet</p>
                  ) : (
                    Object.entries(results).map(([key, result]) => (
                      <div key={key} className={`border rounded-md p-4 ${
                        result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-medium ${
                            result.success ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {key}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.success 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.success ? 'Success' : 'Error'}
                          </span>
                        </div>
                        <pre className={`text-xs overflow-x-auto ${
                          result.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {JSON.stringify(result.success ? result.data : result.error, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setResults({})}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Clear Results
                </button>
                <a
                  href="/2fa-management"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Go to 2FA Management
                </a>
                <a
                  href="/enhanced-login"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Test Enhanced Login
                </a>
                <a
                  href="/2fa-recovery"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Test Recovery Flow
                </a>
              </div>
            </div>

            {/* Documentation */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">API Documentation</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <h3 className="font-medium text-gray-900 mb-2">Available Endpoints:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><code>GET /api/2fa/status/</code> - Get 2FA status</li>
                  <li><code>POST /api/2fa/setup/</code> - Initialize 2FA setup</li>
                  <li><code>POST /api/2fa/toggle/</code> - Enable/disable 2FA</li>
                  <li><code>POST /api/2fa/backup-codes/</code> - Generate backup codes</li>
                  <li><code>POST /api/2fa/login/</code> - Login with 2FA</li>
                  <li><code>POST /api/2fa/recovery-login/</code> - Login with recovery code</li>
                  <li><code>POST /api/2fa/recovery-request/</code> - Request recovery help</li>
                  <li><code>POST /api/2fa/emergency-disable/</code> - Emergency disable 2FA</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}