import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyCarData } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const dummyDrivers = [
  {
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    address: "123 MG Road, Bangalore",
    experience: "8 years",
    rating: "4.8/5"
  },
  {
    name: "Amit Singh",
    phone: "+91 87654 32109",
    address: "45 Brigade Road, Bangalore",
    experience: "5 years",
    rating: "4.7/5"
  },
  {
    name: "Mohammad Farhan",
    phone: "+91 76543 21098",
    address: "789 Church Street, Bangalore",
    experience: "10 years",
    rating: "4.9/5"
  },
  {
    name: "Suresh Patel",
    phone: "+91 65432 10987",
    address: "234 Commercial Street, Bangalore",
    experience: "6 years",
    rating: "4.6/5"
  }
];

const upiDetails = {
  upiId: "carrental@ybl",
  qrCodeUrl: "https://ik.imagekit.io/ho4j7jqp5/qr-code.png" // Add your QR code image URL here
};

const CarDetails = () => {

  const { id } = useParams()

  const { cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate } = useAppContext()

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [step, setStep] = useState(1) // 1 for booking details, 2 for payment

  // Form fields
  const [phone, setPhone] = useState('')
  const [userName, setUserName] = useState('')
  const [address, setAddress] = useState('')
  const [aadharNumber, setAadharNumber] = useState('')
  const [drivingLicense, setDrivingLicense] = useState('')
  const [driverNeeded, setDriverNeeded] = useState(false)
  const [driverPhone, setDriverPhone] = useState('')
  const [driverAddress, setDriverAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Payment details for different methods
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV, setCardCVV] = useState('')
  const [cardName, setCardName] = useState('')
  const [selectedBank, setSelectedBank] = useState('')

  const currency = import.meta.env.VITE_CURRENCY

  // Calculate number of rental days
  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 1;
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const days = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }

  // Calculate total amount
  const calculateTotal = () => {
    const days = calculateDays();
    const rentalCost = car ? car.pricePerDay * days : 0;
    const driverCost = driverNeeded ? 500 * days : 0;
    return rentalCost + driverCost;
  }

  const handleBookNow = (e) => {
    e.preventDefault();

    // Validate dates
    if (new Date(returnDate) <= new Date(pickupDate)) {
      toast.error('Return date must be after pickup date');
      return;
    }

    // Slide to payment section
    setStep(2);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate payment details based on method
    if (paymentMethod === 'card') {
      if (!cardName || !cardNumber || !cardExpiry || !cardCVV) {
        toast.error('Please fill all card details');
        return;
      }
    }

    if (paymentMethod === 'netbanking' && !selectedBank) {
      toast.error('Please select a bank');
      return;
    }

    try {
      const bookingData = {
        car: id,
        pickupDate,
        returnDate,
        phone,
        userName,
        address,
        aadharNumber,
        drivingLicense,
        driverNeeded,
        paymentMethod
      }

      if (driverNeeded) {
        bookingData.driverPhone = driverPhone
        bookingData.driverAddress = driverAddress
      }

      // Add payment details based on payment method
      if (paymentMethod === 'upi') {
        bookingData.upiId = upiDetails.upiId;
      }

      if (paymentMethod === 'card') {
        bookingData.cardNumber = cardNumber;
        bookingData.cardName = cardName;
        bookingData.cardExpiry = cardExpiry;
        // Note: CVV is not stored for security reasons
      }

      if (paymentMethod === 'netbanking') {
        bookingData.selectedBank = selectedBank;
      }

      const { data } = await axios.post('/api/bookings/create', bookingData)

      if (data.success) {
        toast.success(data.message)
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    if (driverNeeded) {
      const randomIndex = Math.floor(Math.random() * dummyDrivers.length);
      setSelectedDriver(dummyDrivers[randomIndex]);
    } else {
      setSelectedDriver(null);
    }
  }, [driverNeeded]);

  useEffect(() => {
    setCar(cars.find(car => car._id === id))
  }, [cars, id])

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* Left: Car Image & Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}

          className='lg:col-span-2'>
          <motion.img
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}

            src={car.image} alt="" className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md' />
          <motion.div className='space-y-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div>
              <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
              <p className='text-gray-500 text-lg'>{car.category} • {car.year}</p>
            </div>
            <hr className='border-borderColor my-6' />

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location },
              ].map(({ icon, text }) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}

                  key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  {text}
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            {/* Features */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {
                  ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item) => (
                    <li key={item} className='flex items-center text-gray-500'>
                      <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                      {item}
                    </li>
                  ))
                }
              </ul>
            </div>

          </motion.div>
        </motion.div>

        {/* Right: Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className='shadow-lg h-max sticky top-18 rounded-xl overflow-hidden'>

          <div className='relative'>
            {/* Step 1: Booking Details */}
            <motion.form
              animate={{ x: step === 1 ? 0 : '-100%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              onSubmit={handleBookNow}
              className='p-6 space-y-4 text-gray-500'
              style={{ display: step === 1 ? 'block' : 'none' }}>

              <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay}<span className='text-base text-gray-400 font-normal'>per day</span></p>

              <hr className='border-borderColor my-4' />

              <div className='flex flex-col gap-2'>
                <label htmlFor="pickup-date">Pickup Date</label>
                <input value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
                  type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='pickup-date' min={new Date().toISOString().split('T')[0]} />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor="return-date">Return Date</label>
                <input value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                  type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='return-date' min={pickupDate || new Date().toISOString().split('T')[0]} />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor="userName">Full Name</label>
                <input value={userName} onChange={(e) => setUserName(e.target.value)}
                  type="text" className='border border-borderColor px-3 py-2 rounded-lg' required id='userName' placeholder='Enter your full name' />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor="phone">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  type="tel" className='border border-borderColor px-3 py-2 rounded-lg' required id='phone' placeholder='Enter your phone number' />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor="address">Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)}
                  className='border border-borderColor px-3 py-2 rounded-lg' required id='address' placeholder='Enter your address' rows='2' />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor="aadharNumber">Aadhar Number</label>
                <input value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)}
                  type="text" className='border border-borderColor px-3 py-2 rounded-lg' required id='aadharNumber' placeholder='Enter your Aadhar number' maxLength="12" pattern="[0-9]{12}" />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor="drivingLicense">Driving License Number</label>
                <input value={drivingLicense} onChange={(e) => setDrivingLicense(e.target.value)}
                  type="text" className='border border-borderColor px-3 py-2 rounded-lg' required id='drivingLicense' placeholder='Enter your driving license number' />
              </div>

              {/* Driver Needed Option */}
              <div className='flex items-center gap-3 p-3 bg-light rounded-lg'>
                <input
                  type="checkbox"
                  id="driverNeeded"
                  checked={driverNeeded}
                  onChange={(e) => setDriverNeeded(e.target.checked)}
                  className='w-4 h-4 cursor-pointer'
                />
                <label htmlFor="driverNeeded" className='cursor-pointer'>I need a driver</label>
              </div>

              {/* Driver Details - Show only if driver is needed */}
              {driverNeeded && selectedDriver && (
                <div className="driver-details mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-semibold mb-4">Your Assigned Driver</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{selectedDriver.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedDriver.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Address:</span>
                      <span>{selectedDriver.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Experience:</span>
                      <span>{selectedDriver.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Rating:</span>
                      <span>{selectedDriver.rating}</span>
                    </div>
                  </div>
                </div>
              )}

              <button type='submit' className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'>Continue to Payment</button>

            </motion.form>

            {/* Step 2: Payment Options */}
            <motion.form
              animate={{ x: step === 2 ? 0 : '100%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              onSubmit={handleSubmit}
              className='p-6 space-y-4 text-gray-500'
              style={{ display: step === 2 ? 'block' : 'none' }}>

              <div className='flex items-center gap-2 mb-4'>
                <button type='button' onClick={() => setStep(1)} className='text-gray-500 hover:text-gray-700'>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
                <h2 className='text-xl font-semibold text-gray-800'>Payment Method</h2>
              </div>

              <hr className='border-borderColor my-4' />

              {/* Payment Options */}
              <div className='space-y-3'>
                <div className='flex items-center gap-3 p-4 border-2 border-borderColor rounded-lg cursor-pointer hover:border-primary transition-all'
                  onClick={() => setPaymentMethod('cash')}>
                  <input
                    type="radio"
                    id="cash"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className='w-4 h-4 cursor-pointer'
                  />
                  <label htmlFor="cash" className='flex-1 cursor-pointer'>
                    <p className='font-medium'>Cash on Pickup</p>
                    <p className='text-xs text-gray-400'>Pay when you collect the car</p>
                  </label>
                </div>

                <div className='flex items-center gap-3 p-4 border-2 border-borderColor rounded-lg cursor-pointer hover:border-primary transition-all'
                  onClick={() => setPaymentMethod('upi')}>
                  <input
                    type="radio"
                    id="upi"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className='w-4 h-4 cursor-pointer'
                  />
                  <label htmlFor="upi" className='flex-1 cursor-pointer'>
                    <p className='font-medium'>UPI Payment</p>
                    <p className='text-xs text-gray-400'>Pay via Google Pay, PhonePe, etc.</p>
                  </label>
                </div>

                <div className='flex items-center gap-3 p-4 border-2 border-borderColor rounded-lg cursor-pointer hover:border-primary transition-all'
                  onClick={() => setPaymentMethod('card')}>
                  <input
                    type="radio"
                    id="card"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className='w-4 h-4 cursor-pointer'
                  />
                  <label htmlFor="card" className='flex-1 cursor-pointer'>
                    <p className='font-medium'>Credit/Debit Card</p>
                    <p className='text-xs text-gray-400'>Secure card payment</p>
                  </label>
                </div>

                <div className='flex items-center gap-3 p-4 border-2 border-borderColor rounded-lg cursor-pointer hover:border-primary transition-all'
                  onClick={() => setPaymentMethod('netbanking')}>
                  <input
                    type="radio"
                    id="netbanking"
                    name="payment"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className='w-4 h-4 cursor-pointer'
                  />
                  <label htmlFor="netbanking" className='flex-1 cursor-pointer'>
                    <p className='font-medium'>Net Banking</p>
                    <p className='text-xs text-gray-400'>Pay via online banking</p>
                  </label>
                </div>
              </div>

              {/* Payment Method Details */}
              {paymentMethod === 'upi' && (
                <div className="payment-details mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-semibold mb-4">UPI Payment Details</h3>
                  <div className="flex flex-col items-center gap-4">
                    <img 
                      src={upiDetails.qrCodeUrl} 
                      alt="UPI QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">UPI ID:</span>
                      <span className="text-blue-600">{upiDetails.upiId}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(upiDetails.upiId)}
                        className="p-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">Scan QR code or pay using UPI ID</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className='space-y-4 p-4 bg-light rounded-lg'>
                  <h3 className='font-medium text-gray-800'>Card Details</h3>

                  <div className='flex flex-col gap-2'>
                    <label htmlFor="cardName">Cardholder Name</label>
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)}
                      type="text" className='border border-borderColor px-3 py-2 rounded-lg'
                      required={paymentMethod === 'card'} placeholder='Name on card' id='cardName' />
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label htmlFor="cardNumber">Card Number</label>
                    <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                      type="text" className='border border-borderColor px-3 py-2 rounded-lg'
                      required={paymentMethod === 'card'} placeholder='1234 5678 9012 3456'
                      maxLength='16' id='cardNumber' />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-2'>
                      <label htmlFor="cardExpiry">Expiry Date</label>
                      <input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)}
                        type="text" className='border border-borderColor px-3 py-2 rounded-lg'
                        required={paymentMethod === 'card'} placeholder='MM/YY'
                        maxLength='5' id='cardExpiry' />
                    </div>
                    <div className='flex flex-col gap-2'>
                      <label htmlFor="cardCVV">CVV</label>
                      <input value={cardCVV} onChange={(e) => setCardCVV(e.target.value)}
                        type="password" className='border border-borderColor px-3 py-2 rounded-lg'
                        required={paymentMethod === 'card'} placeholder='123'
                        maxLength='3' id='cardCVV' />
                    </div>
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'netbanking' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className='space-y-4 p-4 bg-light rounded-lg'>
                  <h3 className='font-medium text-gray-800'>Select Your Bank</h3>

                  <div className='flex flex-col gap-2'>
                    <label htmlFor="bank">Bank Name</label>
                    <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}
                      className='border border-borderColor px-3 py-2 rounded-lg'
                      required={paymentMethod === 'netbanking'} id='bank'>
                      <option value=''>Select Bank</option>
                      <option value='sbi'>State Bank of India</option>
                      <option value='hdfc'>HDFC Bank</option>
                      <option value='icici'>ICICI Bank</option>
                      <option value='axis'>Axis Bank</option>
                      <option value='pnb'>Punjab National Bank</option>
                      <option value='bob'>Bank of Baroda</option>
                      <option value='kotak'>Kotak Mahindra Bank</option>
                      <option value='yes'>Yes Bank</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>

                  <div className='text-xs text-gray-500 bg-yellow-50 p-3 rounded'>
                    <p className='font-medium mb-1'>⚠️ Note:</p>
                    <p>You will be redirected to your bank's secure payment page</p>
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'cash' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className='p-4 bg-light rounded-lg'>
                  <div className='flex items-start gap-3'>
                    <svg className='w-6 h-6 text-green-600 mt-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    <div>
                      <h3 className='font-medium text-gray-800 mb-2'>Cash Payment on Pickup</h3>
                      <p className='text-sm text-gray-600'>Please pay {currency}{calculateTotal()} in cash when you collect the car at the pickup location.</p>
                      <p className='text-xs text-gray-500 mt-2'>Make sure to bring exact change if possible.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Booking Summary */}
              <div className='bg-light p-4 rounded-lg space-y-2 mt-6'>
                <h3 className='font-medium text-gray-800'>Booking Summary</h3>
                <div className='flex justify-between text-sm'>
                  <span>Car Rental</span>
                  <span>{currency}{car.pricePerDay} x {calculateDays()} days</span>
                </div>
                {driverNeeded && (
                  <div className='flex justify-between text-sm'>
                    <span>Driver Service</span>
                    <span>{currency}500 x {calculateDays()} days</span>
                  </div>
                )}
                <hr className='border-borderColor' />
                <div className='flex justify-between font-semibold text-gray-800'>
                  <span>Total Amount</span>
                  <span>{currency}{calculateTotal()}</span>
                </div>
              </div>

              <button type='submit' className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'>Confirm Booking</button>

              <p className='text-center text-sm'>Secure payment • Money back guarantee</p>

            </motion.form>
          </div>

        </motion.div>
      </div>

    </div>
  ) : <Loader />
}

export default CarDetails
