import React from 'react'

export default function Home() {

  return (
    <div className="space-y-10">
      <section className="bg-gradient-to-r from-indigo-900 via-gray-900 to-black rounded-lg p-10 mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-3">Universal Auth — Complete 2FA Security</h1>
          <p className="text-gray-300 mb-6">Advanced Two-Factor Authentication with comprehensive recovery options. Never get locked out again.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/2fa-demo" className="py-3 px-6 bg-green-500 hover:bg-green-600 rounded text-black font-semibold">Explore 2FA Demo</a>
            <a href="/profile" className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold">Profile</a>
            <a href="/signup" className="py-3 px-6 border border-gray-600 rounded text-gray-200">Create account</a>
          </div>
        </div>
      </section>

      {/* 2FA Features Section */}
      <section className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Complete 2FA Implementation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">8 API Endpoints</h3>
            <p className="text-gray-600 text-sm">Complete API coverage for all 2FA operations</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Recovery Options</h3>
            <p className="text-gray-600 text-sm">Backup codes, email recovery, emergency disable</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Enhanced UX</h3>
            <p className="text-gray-600 text-sm">Smooth user flows with clear recovery paths</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Enterprise Security</h3>
            <p className="text-gray-600 text-sm">Audit trails, notifications, time limits</p>
          </div>
        </div>
      </section>


    </div>
  )
}
