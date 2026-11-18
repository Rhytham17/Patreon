"use server"
import Razorpay from "razorpay"
import Payment from "@/models/Payment"
import connectDb from "@/db/connectDb"
import User from "@/models/User"


//order initiation help
export const initiate = async (amount, to_username, paymentform) => {
    await connectDb()

    //fetch the secret of the user who is getting the payment
    let user = await User.findOne({ username: to_username })
    const secret = user.razorpaysecret


    var instance = new Razorpay({ key_id:/* process.env.NEXT_PUBLIC_KEY_ID*/ user.razorpayid,  /*key_secret: process.env.KEY_SECRET */ key_secret: secret })


    let options = {
        amount: Number.parseInt(amount),
        currency: "INR",
    }

    let x = await instance.orders.create(options)

    //create a payment object which shows a pending payment
    await Payment.create({ oid: x.id, amount: amount / 100, to_user: to_username, name: paymentform.name, message: paymentform.message })

    return x
}


export const fetchuser = async (username) => {
    await connectDb()

    const u = await User.findOne({ username })

    if (!u) {
        return null
    }

    return u.toObject({
        flattenObjectIds: true
    })
}


export const fetchuserById = async (userId) => {
    await connectDb()

    const u = await User.findById(userId)

    if (!u) {
        return null
    }

    return u.toObject({
        flattenObjectIds: true
    })
}
export const fetchpayments = async (username) => {
    await connectDb()

    let p = await Payment.find({ to_user: username, done: true })
        .sort({ amount: -1 })
        .limit(5)
        .lean()

    return p.map(payment => ({
        ...payment,
        _id: payment._id.toString(),
    }))
}


export const updateProfile = async (data, oldusername) => {
    await connectDb()
    let ndata = Object.fromEntries(data)

    //If the username is being updated, check if username is available
    if (oldusername !== ndata.username) {
        let u = await User.findOne({ username: ndata.username })
        if (u) {
            return { error: "Username Already exists " }
        }
        await User.updateOne({ email: ndata.email }, ndata)
        // now update all the username in the Payments table
        await Payment.updateMany({ to_user: oldusername }, { to_user: ndata.username })
    }

    else {
        await User.updateOne({ email: ndata.email }, ndata)
    }
}




