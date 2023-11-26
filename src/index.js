import axios from 'axios';

import Notiflix from 'notiflix';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import './css/style.css';

async function servicePictures(query, page, per_page) {
  const params = new URLSearchParams({
    key: '40898074-36fbabaea58c817935301902b',
    q: query,
    page: page,
    per_page: per_page,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  try {
    const response = await axios.get(`https://pixabay.com/api/?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

let page = 1;
let per_page = 40;

const form = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const button = document.querySelector('.load-more');
let query = null;

let lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

function renderImages(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a href = "${largeImageURL}" class="photo-card">
        <img class="photo-image" src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            <span>${likes}</span>
          </p>
          <p class="info-item">
            <b>Views</b>
            <span>${views}</span>
          </p>
          <p class="info-item">
            <b>Comments</b>
            <span>${comments}</span>
          </p>
          <p class="info-item">
            <b>Downloads</b>
            <span>${downloads}</span>
          </p>
        </div>
        </a>
      `;
      }
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);

  lightbox.refresh();
  smoothScroll()
}

const onSearch = async e => {
  e.preventDefault();
  page = 1;
  galleryEl.innerHTML = '';
  const elements = form.elements;
  query = elements.searchQuery.value;
  const images = await servicePictures(query, page, per_page);

  if (images.hits.length === 0) {
    button.style.display = 'none';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return false;
  }

  button.style.display = 'flex';
  Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);

  if (images.totalHits <= per_page) {
    button.style.display = 'none';
  }

  renderImages(images.hits);
  page = page + 1;
};

const onLoadMore = async e => {
  const images = await servicePictures(query, page, per_page);
  renderImages(images.hits);
  button.style.display = 'flex';

  page = page + 1;

  if ((page - 1) * per_page >= images.totalHits) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    button.style.display = 'none';
  }
};

form.addEventListener('submit', onSearch);
button.addEventListener('click', onLoadMore);

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}