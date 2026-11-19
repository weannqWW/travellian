// Travellian: поведение страницы на чистом JavaScript, без библиотек.

// ---------- Мобильное меню ----------

const header = document.querySelector('.header');
const burger = document.querySelector('.header__burger');
const menuPanel = document.querySelector('.header__panel');

// Открывает или закрывает меню (true — открыть, false — закрыть)
function setMenuOpen(isOpen) {
  header.classList.toggle('header--open', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
  burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
}

// Вешает обработчики: бургер, клик по ссылке, клавиша Esc
function initMenu() {
  burger.addEventListener('click', () => {
    setMenuOpen(!header.classList.contains('header--open'));
  });

  // Клик по любой ссылке в панели закрывает меню
  menuPanel.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });
}

// ---------- Карусели ----------

// Переносит первую карточку в конец (вперёд) или последнюю в начало (назад),
// затем проигрывает короткую анимацию, чтобы смена выглядела как прокрутка.
function slideCarousel(list, direction) {
  const firstCard = list.firstElementChild;
  const secondCard = firstCard.nextElementSibling;
  const isRow = secondCard && secondCard.offsetWidth > 0;
  const step = isRow ? secondCard.getBoundingClientRect().left - firstCard.getBoundingClientRect().left : 0;

  if (direction === 'next') {
    list.append(firstCard);
  } else {
    list.prepend(list.lastElementChild);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Карточки в ряд сдвигаются вбок, одна видимая карточка плавно появляется
  const shift = direction === 'next' ? step : -step;
  const frames = step > 0
    ? [{ transform: `translateX(${shift}px)` }, { transform: 'translateX(0)' }]
    : [{ opacity: 0 }, { opacity: 1 }];

  list.animate(frames, { duration: 400, easing: 'ease' });
}

// Находит все карусели на странице и подключает к ним стрелки
function initCarousels() {
  document.querySelectorAll('[data-carousel-controls]').forEach((controls) => {
    const name = controls.dataset.carouselControls;
    const list = document.querySelector(`[data-carousel="${name}"]`);

    controls.querySelector('.arrows__button--prev').addEventListener('click', () => {
      slideCarousel(list, 'prev');
    });

    controls.querySelector('.arrows__button--next').addEventListener('click', () => {
      slideCarousel(list, 'next');
    });
  });
}

// ---------- Слайдер фона на первом экране ----------

const hero = document.querySelector('.hero');
const heroDots = document.querySelectorAll('.hero__dot');
let currentSlide = 1;

// Показывает слайд с нужным номером и подсвечивает его точку
function showHeroSlide(number) {
  // Номер слайда держим в пределах 1..5: после последнего идёт первый
  const total = heroDots.length;
  const nextSlide = ((number - 1 + total) % total) + 1;

  hero.classList.replace(`hero--slide-${currentSlide}`, `hero--slide-${nextSlide}`);
  currentSlide = nextSlide;

  heroDots.forEach((dot, index) => {
    const isActive = index === nextSlide - 1;
    dot.classList.toggle('hero__dot--active', isActive);
    dot.setAttribute('aria-pressed', String(isActive));
  });
}

// Подключает точки и стрелки слайдера
function initHeroSlider() {
  heroDots.forEach((dot, index) => {
    dot.addEventListener('click', () => showHeroSlide(index + 1));
  });

  document.querySelector('.hero__arrow--prev').addEventListener('click', () => {
    showHeroSlide(currentSlide - 1);
  });

  document.querySelector('.hero__arrow--next').addEventListener('click', () => {
    showHeroSlide(currentSlide + 1);
  });
}

// ---------- Карточки туров (Trip Planners) ----------

// Клик по фото показывает описание этого тура и скрывает остальные
function initTripCards() {
  const cards = document.querySelectorAll('.trip-card');

  cards.forEach((card) => {
    const picture = card.querySelector('.trip-card__picture');

    picture.addEventListener('click', () => {
      cards.forEach((item) => {
        const isActive = item === card;
        item.classList.toggle('trip-card--active', isActive);
        item.querySelector('.trip-card__picture').setAttribute('aria-expanded', String(isActive));
      });
    });
  });
}

// ---------- Форма поездки на первом экране ----------

// Названия дней и месяцев для вывода даты
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Окончание числа в дате: 1 -> "st", 2 -> "nd", 3 -> "rd", 11 -> "th"
function getDaySuffix(day) {
  if (day >= 11 && day <= 13) {
    return 'th';
  }

  const lastDigit = day % 10;

  if (lastDigit === 1) {
    return 'st';
  }

  if (lastDigit === 2) {
    return 'nd';
  }

  if (lastDigit === 3) {
    return 'rd';
  }

  return 'th';
}

// Переводит дату в формат макета: "2026-11-16" -> "Mon, 16th Nov 2026"
function formatDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return `${WEEKDAYS[date.getDay()]}, ${day}${getDaySuffix(day)} ${MONTHS[month - 1]} ${year}`;
}

// Возвращает первую ошибку как { field, text } или null, если всё заполнено
function findBookingError(form) {
  const destination = form.elements.destination.value.trim();
  const checkIn = form.elements['check-in'].value;
  const checkOut = form.elements['check-out'].value;

  if (destination.length < 2) {
    return { field: 'destination', text: 'Enter a destination: at least 2 letters.' };
  }

  if (!checkIn) {
    return { field: 'check-in', text: 'Choose a check-in date.' };
  }

  if (!checkOut) {
    return { field: 'check-out', text: 'Choose a check-out date.' };
  }

  // Даты в виде ГГГГ-ММ-ДД можно сравнивать как строки
  if (checkOut <= checkIn) {
    return { field: 'check-out', text: 'Check-out must be later than check-in.' };
  }

  return null;
}

// Проверка формы поездки и вывод выбранных дат
function initBookingForm() {
  const form = document.querySelector('.booking');
  const message = form.querySelector('.booking__message');

  // Поле даты невидимое: клик открывает календарь, а текст рядом показывает выбранную дату
  form.querySelectorAll('.booking__date-input').forEach((input) => {
    input.addEventListener('click', () => {
      if (input.showPicker) {
        input.showPicker();
      }
    });

    input.addEventListener('change', () => {
      const text = input.previousElementSibling;
      text.textContent = input.value ? formatDate(input.value) : 'Choose a date';
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    form.querySelectorAll('.booking__field--invalid').forEach((field) => {
      field.classList.remove('booking__field--invalid');
    });

    const error = findBookingError(form);

    if (error) {
      const input = form.elements[error.field];
      input.closest('.booking__field').classList.add('booking__field--invalid');
      message.textContent = error.text;
    } else {
      const destination = form.elements.destination.value.trim();
      const persons = form.elements.persons.value;
      const checkIn = formatDate(form.elements['check-in'].value);
      const checkOut = formatDate(form.elements['check-out'].value);
      message.textContent = `The form is filled in correctly: ${destination}, persons: ${persons}, ${checkIn} – ${checkOut}. This is a demo, nothing was sent.`;
    }

    message.classList.toggle('booking__message--error', Boolean(error));
    message.hidden = false;
  });

  // Кнопка "Details" в карточке предложения подставляет город в форму
  document.querySelectorAll('[data-destination]').forEach((link) => {
    link.addEventListener('click', () => {
      form.elements.destination.value = link.dataset.destination;
      message.hidden = true;
    });
  });
}

// ---------- Форма подписки ----------

// Простой шаблон email: что-то@что-то.домен
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Возвращает текст ошибки или null, если email правильный
function findEmailError(email) {
  if (email === '') {
    return 'Enter your email.';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'The email looks wrong. Example: name@example.com';
  }

  return null;
}

// Проверка формы подписки
function initNewsletterForm() {
  const form = document.querySelector('.newsletter__form');
  const input = form.elements.email;
  const message = form.querySelector('.newsletter__message');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const error = findEmailError(input.value.trim());

    message.textContent = error || 'The email is correct. This is a demo, the address was not saved.';
    message.classList.toggle('newsletter__message--error', Boolean(error));
    message.hidden = false;
  });

  // "Login" и "Sign up" ведут к этой форме и ставят курсор в поле email.
  // Таймер ждёт, пока браузер закончит переход к #newsletter.
  document.querySelectorAll('a[href="#newsletter"]').forEach((link) => {
    link.addEventListener('click', () => {
      setTimeout(() => input.focus({ preventScroll: true }), 0);
    });
  });
}

// ---------- Запуск ----------

initMenu();
initCarousels();
initHeroSlider();
initTripCards();
initBookingForm();
initNewsletterForm();
