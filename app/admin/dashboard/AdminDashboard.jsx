"use client"
import Reacts from 'react'
import JobAppliedChart from './JobAppliedChart'
import AdminActivityLogs from './AdminActivityLogs'

function AdminDashboard() {

  return (
    <div className='grid grid-cols-1 gap-4'>
      <JobAppliedChart />
      <AdminActivityLogs />
    </div>
  )
}

export default AdminDashboard
