import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Banner from '../components/Banner'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/Newsletter'
import { assets } from '../assets/assets'
import { motion } from 'motion/react'



const Gps = () => {
  return (
    <>
    <motion.img 
        src={assets.gps_map} alt="car" width="85%" height="600" className='mx-auto mt-10 rounded-lg'/>
      <FeaturedSection />
      <Banner />
      <Testimonial />
      <Newsletter />
    </>
  )
}

export default Gps
