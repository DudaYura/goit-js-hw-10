import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';
import { fetchCountries } from './fetchCountries';

const DEBOUNCE_DELAY = 300;

const refs = {
  searchInput: document.getElementById('search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

refs.searchInput.addEventListener(
  'input',
  debounce(onSearchInput, DEBOUNCE_DELAY)
);

function onSearchInput(evt) {
  const searchText = evt.target.value.trim();

  if (searchText === '') {
    clearCountriesList();
    clearCountryInfo();
    return;
  }

  fetchCountries(searchText)
    .then(result => {
      if (result.length > 10) {
        clearCountriesList();
        clearCountryInfo();
        Notify.info(
          'Too many matches found. Please enter a more specific name'
        );
      } else if (result.length === 1) {
        clearCountriesList();
        renderCountryInfo(result);
      } else if (result.length <= 10) {
        clearCountryInfo();
        renderCountriesList(result);
      }
    })
    .catch(() => {
      clearCountriesList();
      clearCountryInfo();
      Notify.failure('Oops, there is no country with that name');
    });
}

function createCountryListMarcup(countries) {
  return countries.reduce((acc, country) => {
    const {
      name: { common: name },
      flags: { svg: flag },
    } = country;
    return `${acc} <li class="country-item"><img class="country-flag" src="${flag}" alt="flag of ${name}"><span class="county-name">${name}</span></li>`;
  }, '');
}

function createCountryInfoMarcup(countries) {
  const country = countries[0];
  const {
    name: { common: name },
    capital,
    population,
    flags: { svg: flag },
    languages,
  } = country;
  const capitalsList = capital.join(', ');
  const languagesList = Object.values(languages).join(', ');

  return `
    <p class="country-name"><img src="${flag}" alt="flag of ${name}" class="country-flag" /><span">${name}</span></p>
    <p class="capital"><span class="info-type">Capital: </span>${capitalsList}</p>
    <p class="population"><span class="info-type">Population: </span>${population}</p>
    <p class="languages"><span class="info-type">Languages: </span>${languagesList}</p>
    `;
}

function renderCountryInfo(countries) {
  refs.countryInfo.innerHTML = createCountryInfoMarcup(countries);
}

function renderCountriesList(countries) {
  refs.countryList.innerHTML = createCountryListMarcup(countries);
}

function clearCountriesList() {
  refs.countryList.innerHTML = '';
}

function clearCountryInfo() {
  refs.countryInfo.innerHTML = '';
}
