import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    car: {type: ObjectId, ref: "Car", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    pickupDate: {type: Date, required: true},
    returnDate: {type: Date, required: true},
    
    // User Details
    userName: {type: String, required: true},
    phone: {type: String, required: true},
    address: {type: String, required: true},
    aadharNumber: {type: String, required: true},
    drivingLicense: {type: String, required: true},
    
    // Driver Details
    driverNeeded: {type: Boolean, default: false},
    driverPhone: {type: String},
    driverAddress: {type: String},
    
    // Payment
    paymentMethod: {type: String, enum: ["cash", "upi", "card", "netbanking"], default: "cash"},
    
    
    // Payment Details - Card
    cardNumber: {type: String},
    cardName: {type: String},
    cardExpiry: {type: String},
    
    // Payment Details - Net Banking
    selectedBank: {type: String},
    
    status: {type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending"},
    price: {type: Number, required: true}
},{timestamps: true})

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking