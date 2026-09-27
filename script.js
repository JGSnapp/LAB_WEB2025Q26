const productGrid = document.getElementById('product-grid');
const cartItems = document.getElementById('cart-items');
const orderWindow = document.getElementById('checkout');
const openButton = document.getElementById('open-order');
const orderForm = document.getElementById('order-form');
let products = [];
let cart = [];

function formatPrice(price) {
  return price.toLocaleString('ru-RU') + ' ₽';
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('anicd-cart'));
    if (Array.isArray(saved)) {
      cart = saved.filter(function (item) {
        return item && Number.isInteger(item.quantity) && item.quantity >= 1
          && item.quantity <= 99 && products.some(function (product) {
            return product.id === item.id;
          });
      });
    }
  } catch (error) {
    cart = [];
  }
}

function saveCart() {
  const message = document.getElementById('storage-message');
  try {
    localStorage.setItem('anicd-cart', JSON.stringify(cart));
    message.hidden = true;
  } catch (error) {
    message.textContent = 'Не удалось сохранить корзину. После обновления страницы изменения могут пропасть.';
    message.hidden = false;
  }
}

function createElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

function renderProducts() {
  productGrid.innerHTML = '';
  products.forEach(function (product) {
    const card = createElement('article', '', 'product-card');
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = 'Обложка CD-издания аниме «' + product.name + '»';
    image.loading = 'lazy';
    const genre = createElement('p', product.genre, 'genre');
    const title = createElement('h3', product.name);
    const price = createElement('p', formatPrice(product.price), 'price');
    const button = createElement('button', 'Добавить в корзину');
    button.type = 'button';
    button.addEventListener('click', function () {
      addToCart(product.id);
    });
    card.append(image, genre, title, price, button);
    productGrid.append(card);
  });
  document.getElementById('product-count').textContent = 'Изданий в каталоге: ' + products.length;
}

function addToCart(id) {
  const item = cart.find(function (item) {
    return item.id === id;
  });
  if (item) {
    if (item.quantity >= 99) {
      alert('Можно добавить не больше 99 экземпляров одного товара.');
      return;
    }
    item.quantity++;
  } else {
    cart.push({ id: id, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = '';
  let total = 0;
  let count = 0;
  cart.forEach(function (item) {
    const product = products.find(function (product) {
      return product.id === item.id;
    });
    total += product.price * item.quantity;
    count += item.quantity;
    const row = createElement('article', '', 'cart-item');
    const title = createElement('h3', product.name);
    const price = createElement('p', formatPrice(product.price) + ' за штуку');
    const label = createElement('label', 'Количество (1–99)');
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.max = '99';
    input.step = '1';
    input.value = item.quantity;
    input.addEventListener('change', function () {
      const quantity = Number(input.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        input.value = item.quantity;
        return;
      }
      item.quantity = quantity;
      saveCart();
      renderCart();
    });
    label.append(input);
    const subtotal = createElement('p', 'Сумма: ' + formatPrice(product.price * item.quantity));
    const removeButton = createElement('button', 'Удалить');
    removeButton.type = 'button';
    removeButton.addEventListener('click', function () {
      cart = cart.filter(function (cartItem) {
        return cartItem.id !== item.id;
      });
      saveCart();
      renderCart();
    });
    row.append(title, price, label, subtotal, removeButton);
    cartItems.append(row);
  });
  document.getElementById('cart-total').textContent = formatPrice(total);
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-empty').hidden = cart.length > 0;
  openButton.disabled = cart.length === 0;
}

openButton.addEventListener('click', function () {
  if (cart.length > 0) {
    orderWindow.showModal();
  }
});

document.getElementById('close-order').addEventListener('click', function () {
  orderWindow.close();
});

orderForm.addEventListener('submit', function (event) {
  event.preventDefault();
  if (cart.length === 0 || !orderForm.reportValidity()) {
    return;
  }
  cart = [];
  saveCart();
  renderCart();
  orderWindow.close();
  orderForm.reset();
  alert('Заказ создан!');
});

async function loadProducts() {
  const message = document.getElementById('catalog-message');
  try {
    const response = await fetch('cards/products.json');
    if (!response.ok) {
      throw new Error('Не удалось загрузить каталог');
    }
    products = await response.json();
    renderProducts();
    loadCart();
    renderCart();
    message.hidden = true;
  } catch (error) {
    message.textContent = 'Не удалось загрузить товары.';
  }
}

loadProducts();
