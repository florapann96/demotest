$("#btnOK").click(() => {

    const quantity = Number($("#quantity").val());

    const productData = {
        id: "123456",
        quantity,
        price: quantity * 20
    }

    $.post("/product", productData, result => {
        console.log("Response from Node : ", result)
    })
})
