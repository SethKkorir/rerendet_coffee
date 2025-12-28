// models/Subscriber.js
import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    isSubscribed: {
        type: Boolean,
        default: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber;
