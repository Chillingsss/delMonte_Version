"use client"
import Reacts from 'react'
import JobAppliedChart from './JobAppliedChart'

function AdminDashboard() {

  return (
    <div className='grid grid-cols-1 gap-4'>
      <JobAppliedChart />
    </div>
  )
}

export default AdminDashboard
