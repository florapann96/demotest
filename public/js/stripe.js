const stripe = require('stripe')
const STRIPE_SECRET_KEY = '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'
const STRIPE_WEBHOOK_SECRET = 'whsec_PgFXXAIAelXmAQXaZqgOI2ZfdTfHqBsn'
var User = require('../../models/user');
var passport = require('passport');
var bcrypt = require('bcryptjs');
const { findByUsername } = require('../../models/user');


const Stripe = stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27'
})
const createCheckoutSession = async (customerID, price) => {
    const session = await Stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerID,
        line_items: [
            {
                price,
                quantity: 1
            }
        ],

        success_url: 'https://lightkeepers-burma.herokuapp.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://lightkeepers-burma.herokuapp.com/failed'
    })

    return session
}
const createBillingSession = async (customer) => {
    const session = await Stripe.billingPortal.sessions.create({
        customer,
        return_url: 'https://lightkeepers-burma.herokuapp.com/'
    })
    return session
}

const addNewCustomer = async (email) => {
    const customer = await Stripe.customers.create({
        email,
        description: email
    })

    return customer
}

const getCustomerByID = async (id) => {
    const customer = await Stripe.customers.retrieve(id)
    return customer
}
const createWebhook = (rawBody, sig) => {
    const event = Stripe.webhooks.constructEvent(
        rawBody,
        sig,
        STRIPE_WEBHOOK_SECRET
    )
    return event
}

module.exports = {
    addNewCustomer,
    getCustomerByID,
    createCheckoutSession,
    createBillingSession,
    createWebhook
}