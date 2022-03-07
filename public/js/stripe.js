const stripe = require('stripe')
const STRIPE_SECRET_KEY = 'sk_test_51KSdKRCIYWxab9WxOnKhMjI9TDKC3SR8FKUIXpFifWhJ3OnZvSCkxxLx7vwRTgNoUUWOnsV7XqFLw8AnEavfvGtS00eT8OBuHh'
const STRIPE_WEBHOOK_SECRET = 'whsec_c1e8d451f3013a36e850becfa2d67163b813bf17e02524a66df06768bd070f02'
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

        success_url: 'http://localhost:2000/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:2000/failed'
    })

    return session
}
const createBillingSession = async (customer) => {
    const session = await Stripe.billingPortal.sessions.create({
        customer,
        return_url: 'https://localhost:2000'
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