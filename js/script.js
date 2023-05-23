'use strict';

//const main = document.querySelector(".main");
let counter;
let countItem = 0;
let countShownItems = 0;
let countMoreItems = 8;
let products;

const productsContainer = document.querySelector('.products');

// generating main items

const renderProducts = (products) => {
  const shownItems = products.slice(countShownItems, countMoreItems);
  shownItems.forEach((el) => {
    const productsHtml = `<li class="products__list-item" data-id = ${el.id}>
  <article class="products__item">
    <img src="${el.srcImg}" alt="${el.title}" class="products__img">
    <h2 class="products__title title">${el.title}</h2>
    <p class="products__portion">${el.portion} pcs</p>
    <div class="products__details">
      <div class="products__quantity">
        <div class="quantity">
          <button class="quantity__minus btn-reset" aria-label="minus one" data-action="minus">-</button>
          <span class="quantity__value" data-counter>1</span>
          <button class="quantity__add btn-reset" aria-label="add one" data-action="add">+</button>
        </div>
      </div>
      <div class="products__desc">
        <p class="products__weight">${el.weight} g</p>
        <p class="products__price">${el.price} $</p>
      </div>
    </div>
    <button class="products__btn-add btn btn-reset" aria-label="add to cart">+ add to cart</button>
  </article>
</li>`;
    productsContainer.insertAdjacentHTML('beforeend', productsHtml);
  });

  countShownItems = countMoreItems;
  countMoreItems = countMoreItems += 4;
};

//generate itmes for the cart

const cartItemHtml = (data) => {
  return `<li class="cart__content-item" data-id = ${data.id}>
  <article class="cart__content-product cart-product">
    <div class="cart-product__pic">
      <img src="${data.srcImg}" alt="${data.title}" class="cart-product__img">
    </div>
    <div class="cart-product__order">
      <div class="cart-product__descr">
        <h3 class="cart-product__title">${data.title}</h3>
        <p class="cart-product__about">${data.portion}/ ${data.weight}</p>
      </div>
      <div class="cart-product__details">
        <div class="cart-product__quantity">
          <div class="quantity">
            <button class="quantity__minus btn-reset" aria-label="minus one"  data-action="minus" >-</button>
            <span class="quantity__value" data-counter>${data.quantity}</span>
            <button class="quantity__add btn-reset" aria-label="add one"  data-action="add">+</button>
          </div>
        </div>
        <p class="cart-product__price">${data.price}</p>
      </div>
    </div>
  </article>
</li>`;
};

//downloading products

const getProducts = async () => {
  try {
    const response = await fetch('./productItems.json');
    products = await response.json();
    renderProducts(products);
  } catch (err) {
    console.log('er', err);
    alert('failed to load a data');
  }
};

getProducts();

//load more products

const loadMoreBtn = document.querySelector('.products__load-more');

loadMoreBtn.addEventListener('click', (e) => {
  renderProducts(products);
  if (products.length <= countShownItems) {
    loadMoreBtn.style.display = 'none';
  }
});

//display cart content depends on its content

const toggleEmptyCart = () => {
  const emptyCartLabel = document.querySelector('.cart__notification');
  const cartWrapperItems = document.querySelector('.cart__wrapper');
  let quantityItems = document.querySelector('.cart__content-list').children.length;

  if (quantityItems === 0) {
    emptyCartLabel.classList.remove('d-none');
    cartWrapperItems.classList.add('d-none');
  } else {
    emptyCartLabel.classList.add('d-none');
    cartWrapperItems.classList.remove('d-none');
  }
};

//counting total sum in the cart

const CalcTotalPrice = () => {
  const cartItems = Array.from(document.querySelectorAll('.cart-product__details'));

  let totalPrice = cartItems.reduce((prevValue, el) => {
    const count = parseInt(el.querySelector('.quantity__value').innerText);
    const price = parseInt(el.querySelector('.cart-product__price').innerText);
    return count * price + prevValue;
  }, 0);

  printTotalPrice(totalPrice);
  printQuantity(countItem);
  calcDeliveryPrice(totalPrice);
};

//print totalPrice

const printTotalPrice = (price) => {
  const finalPriceTag = document.querySelector('.cart__final-price span');
  finalPriceTag.textContent = price + ' $';
};

//print Quantity
const printQuantity = (count) => {
  let quantityTag = document.querySelector('.cart__quantity');
  quantityTag.textContent = count;
};

//calc price of delivery
const calcDeliveryPrice = (price) => {
  const delivery = document.querySelector('.cart__delivery');

  if (price >= 50) {
    delivery.classList.add('free-delivery');
    delivery.querySelector('span').innerText = 'free';
  } else {
    delivery.classList.remove('free-delivery');
    delivery.querySelector('span').innerText = '20 $';
  }
};

window.addEventListener('click', (e) => {
  //Counter of items

  if (e.target.dataset.action === 'add' || e.target.dataset.action === 'minus') {
    const card = e.target.closest('.quantity');
    counter = card.querySelector('.quantity__value');
  }

  let position = e.target.closest('.cart__content-item');

  if (e.target.dataset.action === 'add' && !!position) {
    //It's a cart
    counter.innerText = ++counter.innerText;
    countItem++;
    CalcTotalPrice();
  } else if (e.target.dataset.action === 'add') {
    //it's a main list
    counter.innerText = ++counter.innerText;
  }

  if (e.target.dataset.action === 'minus') {
    //cart or main list

    if (position) {
      //if it's a cart
      if (parseInt(counter.innerText) === 1) {
        position.remove();
      } else {
        counter.innerText = --counter.innerText;
      }
      countItem--;
      toggleEmptyCart();
      CalcTotalPrice();
    } else {
      //if it's a main list
      if (parseInt(counter.innerText) > 1) {
        counter.innerText = --counter.innerText;
      }
    }
  }

  //adding product to the cart

  if (e.target.classList.contains('products__btn-add')) {
    const card = e.target.closest('.products__list-item');

    //content of the cart
    const cartList = document.querySelector('.cart__content-list');

    //details of chosen product
    const itemInfo = {
      id: card.getAttribute('data-id'),
      srcImg: card.querySelector('.products__img').getAttribute('src'),
      title: card.querySelector('.products__title').innerText,
      portion: card.querySelector('.products__portion').innerText,
      weight: card.querySelector('.products__weight').innerText,
      price: card.querySelector('.products__price').innerText,
      quantity: parseInt(card.querySelector('.quantity__value').innerText),
    };

    const existsInCart = cartList.querySelector(`[data-id = "${itemInfo.id}"]`);

    if (existsInCart) {
      let currentValue = existsInCart.querySelector('.quantity__value');

      currentValue.innerText = parseInt(currentValue.innerText) + itemInfo.quantity;
    } else {
      cartList.insertAdjacentHTML('beforeend', cartItemHtml(itemInfo));
    }
    card.querySelector('.quantity__value').innerText = 1;
    countItem += itemInfo.quantity;
    toggleEmptyCart();
    CalcTotalPrice();
  }

  // toggle burger menu
  const navList = document.querySelector('.nav__list');
  const burgerOverlay = document.querySelector('.burger-overlay');
  if (e.target.closest('.burger')) {
    navList.classList.add('burger-content--active');
    burgerOverlay.classList.add('burger-content--active');
    document.body.classList.add('stop-scroll');
  } else if (
    !e.target.closest('.burger-content') ||
    e.target.closest('.burger-content__btn')
  ) {
    navList.classList.remove('burger-content--active');
    burgerOverlay.classList.remove('burger-content--active');
    document.body.classList.remove('stop-scroll');
  }
});
