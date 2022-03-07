////const User = require('./usermodel')
////const addUser = (User) => ({ email, billingID, username, password, admin, plan, endDate }) => {
////    if (!email || !billingID || !plan) { throw new Error('Missing Data. Please provide values for email, billingID, plan') }
////    console.log(email);
////    const user = new User({ email, billingID, username, password, admin, plan, endDate })
    
////    return user.save()
////}

const getUsers = (User) => () => {
    return User.find({})
}

const getUserByEmail = (User) => async (email) => {
    return await User.findOne({ email })
}
const getUserByBillingID = (User) => async (billingID) => {
    return await User.findOne({ billingID })
}

const updatePlan = (User) => (email, plan) => {
    return User.findOneAndUpdate({ email, plan })
}

module.exports = (User) => {
    return {
        
        getUsers: getUsers(User),
        getUserByEmail: getUserByEmail(User),
        updatePlan: updatePlan(User),
        getUserByBillingID: getUserByBillingID(User)
        
    }
}