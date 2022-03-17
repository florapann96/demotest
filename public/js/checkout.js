$(document).ready(function () {
    const publishableKey = 'pk_test_51KSdKRCIYWxab9Wxj9l49fT8mxiIO4qLRPY6tQ1roj8JlHQ098a4EPIhK3j33cRICgoePop89dDkFB32Vthyqpus00aGrclZ7S'

    const stripe = Stripe(
        publishableKey)
    const checkoutButton = $('#checkout-button')
    const checkoutButton1 = $('#checkout-button1')
    const checkoutButton2 = $('#checkout-button2')
    const manageBillingButton = $('#manage-billing-button')

    checkoutButton.click(function () {
        /* const product = $("input[name='product']:checked").val()*/
        
        const product = document.getElementById("weekly").title;
        console.log(product)
        fetch('/users/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'email': customer.email
            },
            body: JSON.stringify({
                product,
                customerID: customer.billingID
            })
        })
            .then((result) => result.json())
            .then(({ sessionId }) => stripe.redirectToCheckout({ sessionId }))
    })
    checkoutButton1.click(function () {
        /* const product = $("input[name='product']:checked").val()*/

        const product = document.getElementById("monthly").title;
        console.log(product)
        fetch('/users/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'email': customer.email
            },
            body: JSON.stringify({
                product,
                customerID: customer.billingID
            })
        })
            .then((result) => result.json())
            .then(({ sessionId }) => stripe.redirectToCheckout({ sessionId }))
    })
    checkoutButton2.click(function () {
        /* const product = $("input[name='product']:checked").val()*/

        const product = document.getElementById("yearly").title;
        console.log(product)
        fetch('/users/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'email': customer.email
            },
            body: JSON.stringify({
                product,
                customerID: customer.billingID
            })
        })
            .then((result) => result.json())
            .then(({ sessionId }) => stripe.redirectToCheckout({ sessionId }))
    })

    manageBillingButton.click(function () {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                email: customer.email
            },
            body: JSON.stringify({
                customer: customer.billingID
            })
        }

        fetch('/users/billing', requestOptions)
            .then((response) => response.json())
            .then((result) => window.location.replace(result.url))
            .catch((error) => console.log('error', error))
    })
})