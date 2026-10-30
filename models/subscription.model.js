import mongoose from "mongoose";
const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
    price:{
        type: Number,
        required: [true, 'Subscription price is required'],
        min: [0, 'Price must be greater than 0'],

    },
    currency:{
        type: String,
        enum:['USD', 'EUR', 'RUPEES']
    },
    frequency:{
        type: String,
        enum:['daily', 'weekly','monthly','yearly'],
    },
    category:{
        type: String,
        enum : ['sports','news','entertainment','lifestyle','technology','finance','politics','others'],
        required: true
    },
    status:{
        type: String,
        enum:['active','inactive', 'expired'],
        default: 'active',
    },
    startDate:{
        type: Date,
        required:true,
        validate :{
            validator: (value) => value <= new Date(),
            message: 'Start date must be in the past'
        }
    },
    renewalDate:{
        type: Date,
        required:true,
        validate :{
            validator: function (value)
            { return value > this.startDate},
            message: 'Renewal date must be greater than the start date'
        }
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index:true,
    }

}, {timestamps: true});


//this function will auto calculate the renewal date if not calculated
subscriptionSchema.pre('save', function(next) {
    if (!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };
        const renewal = new Date(this.startDate);
        renewal.setDate(renewal.getDate() + renewalPeriods[this.frequency]);
        this.renewalDate = renewal;
    }
    // if the renewal date has passed then we are supposed to return the status and expired and this can be done by current date > renewal date
    if (this.renewalDate < new Date()) {
        this.status = 'expired';
    }
    next();
});
const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
