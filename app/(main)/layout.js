import React from 'react'
import DashboardProvider from './provider'

const DashboardLayout = ({children}) => {
  return (
    <div>
    <DashboardProvider>
    <div className='p-4 md:p-10'>
    {children}
    </div>
    
    </DashboardProvider>
    

    </div>
  )
}

export default DashboardLayout