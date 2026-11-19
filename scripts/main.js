// ---------- 1. Мобильное меню ----------

const header = document.querySelector('.header');
const burger = document.querySelector('.header__burger');
const menuLinks = document.querySelectorAll('.header__panel a');

burger.addEventListener('click', function () {
  header.classList.toggle('header--open');
});

menuLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    header.classList.remove('header--open');
  });
});


// ---------- 2. Карусели ----------

function slideCarousel(list, direction) {
  const firstCard = list.firstElementChild;
  const secondCard = firstCard.nextElementSibling;

  const step = secondCard.offsetLeft - firstCard.offsetLeft;

  if (direction === 'next') {
    list.append(firstCard);
  } else {
    list.prepend(list.lastElementChild);
  }

  if (step > 0) {
    const shift = direction === 'next' ? step : -step;

    list.animate(
      [
        { transform: 'translateX(' + shift + 'px)' },
        { transform: 'translateX(0)' }
      ],
      { duration: 400, easing: 'ease' }
    );
  } else {
    list.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 400 }
    );
  }
}

const carouselControls = document.querySelectorAll('[data-carousel-controls]');

carouselControls.forEach(function (controls) {
  const name = controls.dataset.carouselControls;
  const list = document.querySelector('[data-carousel="' + name + '"]');

  controls.querySelector('.arrows__button--next').addEventListener('click', function () {
    slideCarousel(list, 'next');
  });

  controls.querySelector('.arrows__button--prev').addEventListener('click', function () {
    slideCarousel(list, 'prev');
  });
});


// ---------- 3. Слайдер фона ----------

const hero = document.querySelector('.hero');
const dots = document.querySelectorAll('.hero__dot');
let currentSlide = 1;

function showSlide(number) {
  if (number > dots.length) {
    number = 1;
  }

  if (number < 1) {
    number = dots.length;
  }

  hero.classList.remove('hero--slide-' + currentSlide);
  hero.classList.add('hero--slide-' + number);

  dots[currentSlide - 1].classList.remove('hero__dot--active');
  dots[number - 1].classList.add('hero__dot--active');

  currentSlide = number;
}

dots.forEach(function (dot, index) {
  dot.addEventListener('click', function () {
    showSlide(index + 1);
  });
});

document.querySelector('.hero__arrow--prev').addEventListener('click', function () {
  showSlide(currentSlide - 1);
});

document.querySelector('.hero__arrow--next').addEventListener('click', function () {
  showSlide(currentSlide + 1);
});


// ---------- 4. Карточки туров ----------

const tripCards = document.querySelectorAll('.trip-card');

tripCards.forEach(function (card) {
  card.querySelector('.trip-card__picture').addEventListener('click', function () {
    tripCards.forEach(function (item) {
      item.classList.remove('trip-card--active');
    });

    card.classList.add('trip-card--active');
  });
});


// ---------- 5. Форма поездки ----------

const bookingForm = document.querySelector('.booking');
const bookingMessage = document.querySelector('.booking__message');
const dateInputs = document.querySelectorAll('.booking__date-input');

dateInputs.forEach(function (input) {
  input.addEventListener('click', function () {
    input.showPicker();
  });

  input.addEventListener('change', function () {
    if (!input.value) {
      return;
    }

    const text = input.previousElementSibling;
    const date = new Date(input.value);

    text.textContent = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  });
});

bookingForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const destination = bookingForm.elements.destination.value.trim();
  const checkIn = bookingForm.elements['check-in'].value;
  const checkOut = bookingForm.elements['check-out'].value;

  let error = '';

  if (destination === '') {
    error = 'Укажи направление';
  } else if (checkIn === '' || checkOut === '') {
    error = 'Выбери даты';
  } else if (checkOut <= checkIn) {
    error = 'Неправильные даты';
  }

  if (error) {
    bookingMessage.textContent = error;
    bookingMessage.classList.add('booking__message--error');
  } else {
    bookingMessage.textContent = 'Не работает, это демо сайта';
    bookingMessage.classList.remove('booking__message--error');
  }

  bookingMessage.hidden = false;
});


// ---------- 6. Форма подписки ----------

const newsletterForm = document.querySelector('.newsletter__form');
const newsletterMessage = document.querySelector('.newsletter__message');

newsletterForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const email = newsletterForm.elements.email.value.trim();

  if (email.includes('@') && email.includes('.')) {
    newsletterMessage.textContent = 'Не работает, это демо сайта';
    newsletterMessage.classList.remove('newsletter__message--error');
  } else {
    newsletterMessage.textContent = 'Неправильная почта';
    newsletterMessage.classList.add('newsletter__message--error');
  }

  newsletterMessage.hidden = false;
});