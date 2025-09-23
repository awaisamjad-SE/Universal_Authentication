import { useContext, useState, useEffect } from 'react';
import { 
  setup2FA, 
  toggle2FA, 
  get2FAStatus, 
  generateBackupCodes 
} from '../utils/api';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext';

export default function TwoFAManagement() {
  const { user, loading, updateUser } = useContext(AuthContext);
  const [status, setStatus] = useState(null);
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [activeTab, setActiveTab] = useState('status');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchStatus();
    }
  }, [user, loading, navigate]);

  const fetchStatus = async () => {
    try {
      const res = await get2FAStatus();
      setStatus(res.data);
    } catch (err) {
      setError('Failed to fetch 2FA status');
    }
  };

  const handleSetup = async () => {
    setError(null);
    setMsg(null);
    try {
      const res = await setup2FA();
      setQr(res.data.qr_code_url);
      setSecret(res.data.secret);
      setActiveTab('setup');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start 2FA setup');
    }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMsg(null);
    try {
      const res = await toggle2FA({ action: 'enable', code });
      
      // Check if backup codes were automatically generated
      if (res.data.backup_codes) {
        setBackupCodes(res.data.backup_codes);
        setShowBackupCodes(true);
        setMsg(`${res.data.detail} ${res.data.message}`);
      } else {
        setMsg(res.data.detail);
      }
      
      setStatus({ ...status, is_2fa_enabled: true, has_backup_codes: true });
      updateUser({ ...user, is_2fa_enabled: true });
      setActiveTab('status');
      setCode('');
      setQr(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to enable 2FA');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }
    setSubmitting(true);
    setError(null);
    setMsg(null);
    try {
      const res = await toggle2FA({ action: 'disable', code });
      setMsg(res.data.detail);
      setStatus({ ...status, is_2fa_enabled: false });
      updateUser({ ...user, is_2fa_enabled: false });
      setCode('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to disable 2FA');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    setError(null);
    setMsg(null);
    try {
      const res = await generateBackupCodes();
      setBackupCodes(res.data.backup_codes);
      setShowBackupCodes(true);
      setMsg(res.data.message);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate backup codes');
    }
  };

  const downloadBackupCodes = () => {
    const text = `2FA Backup Codes\n\nSave these codes in a safe place!\nEach code can only be used once.\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading || !user || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Two-Factor Authentication</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your account security settings</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('status')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'status' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Status
              </button>
              {!status.is_2fa_enabled && (
                <button
                  onClick={() => setActiveTab('setup')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'setup' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Setup
                </button>
              )}
              {status.is_2fa_enabled && (
                <button
                  onClick={() => setActiveTab('backup')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'backup' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Backup Codes
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {msg && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">{msg}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Status Tab */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">
                      Status: {status.is_2fa_enabled ? (
                        <span className="text-green-600 font-medium">Enabled</span>
                      ) : (
                        <span className="text-red-600 font-medium">Disabled</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Backup codes available: {status.has_backup_codes ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    {!status.is_2fa_enabled ? (
                      <button
                        onClick={handleSetup}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Enable 2FA
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={handleGenerateBackupCodes}
                          className="block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Generate Backup Codes
                        </button>
                        <form onSubmit={handleDisable} className="flex space-x-2">
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter 2FA code"
                            maxLength={6}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            required
                          />
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            {submitting ? <Loader /> : 'Disable'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>

                {/* Backup Codes Display - Show immediately after 2FA is enabled */}
                {showBackupCodes && backupCodes.length > 0 && (
                  <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-yellow-800">🔐 Your Backup Recovery Codes</h3>
                      <button
                        onClick={downloadBackupCodes}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      >
                        Download
                      </button>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <p className="text-sm text-yellow-800 mb-3">
                        ⚠️ <strong>Save these codes in a safe place!</strong> Each code can only be used once.
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="bg-gray-100 p-2 rounded text-center">
                            {code}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-3">
                        Use these codes if you lose access to your authenticator app.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBackupCodes(false)}
                      className="mt-3 text-sm text-yellow-700 hover:text-yellow-800"
                    >
                      I've saved these codes securely ✓
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Setup Tab */}
            {activeTab === 'setup' && (
              <div className="space-y-6">
                {!qr ? (
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Enable Two-Factor Authentication</h3>
                    <p className="text-gray-600 mb-6">
                      Add an extra layer of security to your account by requiring a code from your phone.
                    </p>
                    <button
                      onClick={handleSetup}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Start Setup
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Scan QR Code</h3>
                    <div className="text-center mb-6">
                      <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}&size=200x200`}
                          alt="2FA QR Code"
                          className="mx-auto"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Or enter this secret manually: <br />
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{secret}</code>
                      </p>
                    </div>
                    
                    <form onSubmit={handleEnable} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter the 6-digit code from your authenticator app:
                        </label>
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          maxLength={6}
                          placeholder="123456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {submitting ? <Loader /> : 'Verify & Enable 2FA'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Backup Codes Tab */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Recovery Codes</h3>
                  <p className="text-gray-600 mb-6">
                    These codes can be used to access your account if you lose your phone.
                    Each code can only be used once.
                  </p>
                  
                  {!showBackupCodes ? (
                    <button
                      onClick={handleGenerateBackupCodes}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Generate New Backup Codes
                    </button>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                        <p className="text-yellow-800 text-sm">
                          ⚠️ Save these codes in a safe place! You won't see them again.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-md p-4 mb-4">
                        <div className="grid grid-cols-2 gap-2">
                          {backupCodes.map((code, index) => (
                            <div key={index} className="font-mono text-sm bg-white p-2 rounded border">
                              {code}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={downloadBackupCodes}
                          className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Download Codes
                        </button>
                        <button
                          onClick={() => setShowBackupCodes(false)}
                          className="flex-1 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}