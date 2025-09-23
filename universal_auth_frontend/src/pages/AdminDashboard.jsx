export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Admin</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white/5 border border-gray-700 rounded-lg">Manage Products</div>
        <div className="p-6 bg-white/5 border border-gray-700 rounded-lg">Manage Orders</div>
        <div className="p-6 bg-white/5 border border-gray-700 rounded-lg">Analytics</div>
      </div>
    </div>
  )
}
