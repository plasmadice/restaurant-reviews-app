let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 * And labels for accessibility
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  const addressLabel = document.querySelector('#address-label');
  addressLabel.innerText = `Address: ${restaurant.address}`;
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = `${restaurant.name} restaurant marketing photo`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  const cuisineLabel = document.querySelector('#cuisine-label');
  cuisineLabel.innerText = `Restaurant Cuisine: ${restaurant.cuisine_type}`
  cuisine.innerHTML = restaurant.cuisine_type;

  const container = document.querySelector('#restaurant-container');

  const label = document.createElement('label');
  label.id = 'restaurant-container-label';
  label.classList.add('aria-labels');
  label.innerText = `${restaurant.name} restaurant information`;
  container.append(label);

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = () => {

  /* Split Hours table into readable sections for accessibility */
  const hours = document.querySelector('#restaurant-hours');
  const operatingHours = Object.entries(self.restaurant.operating_hours);

  operatingHours.map(day => {
    const row = document.createElement('tr');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-labelledby', `${day[0]}-label`);

    const dayTable = document.createElement('td');
    dayTable.innerHTML = day[0];
    row.appendChild(dayTable);

    const time = document.createElement('td');
    time.innerHTML = day[1];
    row.appendChild(time);

    const readableHours = day[1].split(' - ').join(' to ');
    const hoursLabel = document.createElement('label');
    hoursLabel.innerText = `${day[0]}: ${readableHours}`
    hoursLabel.id = `${day[0]}-label`
    hoursLabel.classList.add('aria-labels');

    hours.appendChild(row);
    hours.appendChild(hoursLabel);
  })
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  title.setAttribute('tabindex', '0');
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute('aria-labelledby', 'no-reviews-label');
    container.appendChild(noReviews);

    /* Label for when there are no reviews */
    const noReviewsLabel = document.createElement('label');
    noReviewsLabel.innerText = 'No reviews yet';
    noReviewsLabel.id = 'no-reviews-label'
    noReviewsLabel.classList.add('aria-labels');
    return;
  }

  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    const li = createReviewHTML(review);
    li.setAttribute('tabindex', '0');
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  console.log(review);
  const li = document.createElement('li');
 
  // Using a combination of name and comments length to prevent duplicates
  li.setAttribute('aria-labelledby', `name-${review.name+review.comments.length}-label`);

  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute('aria-labelledby', `name-${review.name+review.comments.length}-label`);
  name.setAttribute('tabindex', '0');

  const nameLabel = document.createElement('label');
  nameLabel.innerText = `Reviewer: ${review.name}`;
  nameLabel.id = `name-${review.name+review.comments.length}-label`;
  nameLabel.classList.add('aria-labels');

  li.appendChild(nameLabel);
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.setAttribute('tabindex', '0');
  date.setAttribute('aria-labelledby', `date-${review.name+review.comments.length}-label`);
  li.appendChild(date);

  const dateLabel = document.createElement('label');
  dateLabel.innerText = `Date: ${review.date}`;
  dateLabel.id = `date-${review.name+review.comments.length}-label`;
  dateLabel.classList.add('aria-labels');
  li.appendChild(dateLabel);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute('tabindex', '0');
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute('tabindex', '0');
  // comments.setAttribute('aria-labelledby', `comments-${review.name+review.comments.length}-label`);
  li.appendChild(comments);

  // const commentsLabel = document.createElement('label');
  // commentsLabel.innerText = 
  // commentsLabel.id = `comments-${review.name+review.comments.length}-label`;
  // commentsLabel.classList.add('aria-labels');

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement("a");
  a.href = window.location; 
  a.innerHTML = restaurant.name;
  a.setAttribute("aria-current", "page");
  li.appendChild(a);
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
