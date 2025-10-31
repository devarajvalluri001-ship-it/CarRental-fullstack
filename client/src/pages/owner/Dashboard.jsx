import React, { useEffect, useState } from 'react'
import { assets, dummyDashboardData } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const {axios, isOwner, currency} = useAppContext()
  const [loading, setLoading] = useState(true)

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const dashboardCards = [
    {title: "Total Cars", value: data.totalCars, icon: assets.carIconColored},
    {title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored},
    {title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored},
    {title: "Confirmed", value: data.completedBookings, icon: assets.listIconColored},
  ]

  // Add a function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/owner/dashboard')
      if (response.data.success) {
        setData(response.data.dashboardData)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(isOwner) {
      fetchDashboardData()
    }
  }, [isOwner])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title title="Admin Dashboard" subTitle="Monitor overall platform performance including total cars, bookings, revenue, and recent activities"/>

      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl'>
        {dashboardCards.map((card, index) => (
          <div key={index} className='flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor'>
            <div>
              <h1 className='text-xs text-gray-500'>{card.title}</h1>
              <p className='text-lg font-semibold'>{card.value}</p>
            </div>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
              <img src={card.icon} alt="" className='h-4 w-4'/>
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>
        {/* recent booking */}
        <div className='p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full'>
          <h1 className='text-lg font-medium'>Recent Bookings</h1>
          <p className='text-gray-500'>Latest customer bookings</p>
          {data.recentBookings.map((booking, index) => (
            <div key={index} className='mt-4 p-4 border border-borderColor rounded-md'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
                    <img src={booking.car.image || assets.carIconColored} alt="" className='h-8 w-8 object-cover rounded-full'/>
                  </div>
                  <div>
                    <p className='font-medium'>{booking.car.brand} {booking.car.model}</p>
                    <p className='text-sm text-gray-500'>{formatDate(booking.createdAt)}</p>
                  </div>
                </div>

                <div className='flex flex-col items-end gap-1'>
                  <p className='font-medium text-primary'>{currency}{booking.price}</p>
                  <p className={`px-3 py-0.5 border rounded-full text-sm ${
                    booking.status === 'confirmed' ? 'text-green-600 border-green-600' : 
                    booking.status === 'pending' ? 'text-yellow-600 border-yellow-600' : 
                    'text-red-600 border-red-600'
                  }`}>{booking.status}</p>
                </div>
              </div>

              {/* Additional booking details */}
              <div className='mt-3 pt-3 border-t border-borderColor'>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <p className='text-gray-500'>Pickup: <span className='text-gray-700'>{formatDate(booking.pickupDate)}</span></p>
                  <p className='text-gray-500'>Return: <span className='text-gray-700'>{formatDate(booking.returnDate)}</span></p>
                </div>
                {booking.driverNeeded && (
                  <p className='mt-2 text-sm text-blue-600 flex items-center gap-2'>
                    <img src={assets.users_icon} alt="driver" className='h-4 w-4'/>
                    Driver Requested
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* monthly revenue */}
        <div className='p-4 md:p-6 mb-6 border border-borderColor rounded-md w-full md:max-w-xs'>
          <h1 className='text-lg font-medium'>Monthly Revenue</h1>
          <p className='text-gray-500'>Revenue for current month</p>
          <p className='text-3xl mt-6 font-semibold text-primary'>{currency}{data.monthlyRevenue}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
