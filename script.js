const orderWindow = document.getElementById('checkout');
const openButton = document.getElementById('open-order');
const closeButton = document.getElementById('close-order');
const orderForm = document.getElementById('order-form');

openButton.addEventListener('click', function () {
  orderWindow.showModal();
});

closeButton.addEventListener('click', function () {
  orderWindow.close();
});

orderForm.addEventListener('submit', function (event) {
  event.preventDefault();
  orderWindow.close();
  orderForm.reset();
  alert('Заказ создан!');
});
