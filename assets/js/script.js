// Retrieve search history from local storage or initialize an empty array if not found
let history = JSON.parse(localStorage.getItem('search-history')) || [];

// Define variables for various DOM elements
let searchItem = $('#searchBar');
let searchButton = $('#searchButton');
let movieImageContainer = $('#movie-image');
let bookImageContainer = $('#book-image');
let bookMainContainer = $('.mainBookContainer');
let movieMainContainer = $('.mainMovieContainer');
var modal = document.getElementById("myModal");
var modalButton = document.getElementById("modalButton");
var span = document.getElementsByClassName("close")[0];
let previousMovieData = [];
let previousBookData = [];

// Function to simplify a title by removing non-alphanumeric characters and limiting to first 3 words
function simplifyTitle(title) {
    return title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0, 3).join(' ');
}

// Function to fetch matching book data from Google Books API
function fetchMatchingBook(bookTitle = '', bookId = '', showModalOnError = true) {
    console.log(`Fetching books for: ${bookTitle || searchItem.val()}`);
    const bookInfoUrl = bookId ? `https://www.googleapis.com/books/v1/volumes/${bookId}` : 'https://www.googleapis.com/books/v1/volumes';
    const params = new URLSearchParams({
        'q': (bookTitle || searchItem.val()),
        'maxResults': 5
    }).toString();

    return fetch(bookId ? bookInfoUrl : `${bookInfoUrl}?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let items = bookId ? [data] : data.items;
            let bookDetails = [];

            items.forEach(item => {
                let volume_info = item.volumeInfo;
                let title = volume_info.title;
                let authors = volume_info.authors || ['Unknown'];
                let description = volume_info.description || 'Unknown';
                let publishYear = volume_info.publishedDate || 'Unknown';
                let imageLink = volume_info.imageLinks ? volume_info.imageLinks.medium || volume_info.imageLinks.thumbnail : './assets/images/BookPlaceHolder.jpg';

                let book = {
                    id: item.id,
                    title: title,
                    authors: authors.join(', '),
                    description: description,
                    publishYear: publishYear,
                    imageLink: imageLink
                };

                bookDetails.push(book);
            });

            return bookDetails;
        })
        .catch(error => {
            console.error(error.message);
            if (showModalOnError) showModal("Oops, your search hit a snag. Try searching again!");
            return [];
        });
}

function fetchMatchingMovie(movieTitle = '', movieId = '', showModalOnError = true) {
    console.log(`Fetching movies for: ${movieTitle || searchItem.val()}`);
    const movieInfoUrl = movieId ? `https://api.themoviedb.org/3/movie/${movieId}` : 'https://api.themoviedb.org/3/search/movie';
    const apiKey = 'd73ec7c437dcf808b407070026a9ad14'; // Replace with your actual API key
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNzNlYzdjNDM3ZGNmODA4YjQwNzA3MDAyNmE5YWQxNCIsIm5iZiI6MTcxOTMwNjkzOS4wNDYzNTksInN1YiI6IjY2N2E4NTQ3ZGFiNzBmNTMzMDhiZTE2NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.L3veWGSb3v06RYZhaMDWL0yx9rZI_Geq21zeAKe5R5Y';

    const params = new URLSearchParams({
        'api_key': apiKey,
        'query': (movieTitle || searchItem.val()),
        'page': 1
    }).toString();

    return fetch(movieId ? movieInfoUrl : `${movieInfoUrl}?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let items = movieId ? [data] : data.results;
            let movieDetails = items.map(item => {
                let title = item.title;
                let release_date = item.release_date || 'Unknown';
                let description = item.overview || 'Unknown';
                let imageLink = item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : './assets/images/MoviePlaceHolder.jpg';

                return {
                    id: item.id,
                    title: title,
                    release_date: release_date,
                    description: description,
                    imageLink: imageLink
                };
            });

            return movieDetails;
        })
        .catch(error => {
            console.error(error.message);
            if (showModalOnError) showModal("Oops, your search hit a snag. Try searching again!");
            return [];
        });
}


// Function to create a sub-container with a specified class name
function createSubContainer(className) {
    return $('<div>').addClass(`subContainer ${className}`);
}

// Function to add a card for additional items (books/movies)
function addMoreItemCard(heading, year, image, description, container) {
    let moreItemCard = $('<div>')
        .attr('id', 'moreItemCard')
        .addClass('flex flex-row md:flex-column md:h-40 items-center md:items-start p-1 border border-gray-300 rounded-lg shadow-md mb-2');

    let imageDiv = $('<div>').attr('id', 'moreItemImageContainer')
        .addClass('w-1/4 md:w-max-1/4 h-auto overflow-hidden')
        .append(image.addClass('w-full h-full object-cover rounded-lg'));

    let contentDiv = $('<div>').addClass('md:w-3/4 w-full flex flex-col md:items-start items-center text-center md:text-left');

    let headingDiv = $('<div>').addClass('font-semibold text-lg mb-2').append(heading);
    let yearDiv = $('<div>').addClass('text-gray-600 mb-2').append(year);
    let descriptionDiv = $('<div>').addClass('text-gray-700').append(description);

    contentDiv.append(headingDiv, yearDiv, descriptionDiv);
    moreItemCard.append(imageDiv, contentDiv);
    container.append(moreItemCard);
}

// Function to append movie data to the main container
function appendMovieData(movieData) {
    movieMainContainer.empty();
    previousMovieData = movieData; // Store the previous movie data
    if (movieData && movieData.length > 0) {
        appendMainMovieData(movieData[0]);
        // Append secondary items later
        setTimeout(() => appendSecondaryMovieData(movieData, movieData[0].id), 0);
    } else {
        movieMainContainer.append('<p>OPPS, POPCORN AWAITS BUT THIS SEARCH RETURNED NOTHING, PLEASE TRY AGAIN.</p>');
    }
}




// Function to append main movie data to the main container
function appendMainMovieData(movie) {
    movieMainContainer.empty(); // Clear main container before adding new data
    let movieDescription = movie.description;

    if (typeof movieDescription !== 'string') {
        movieDescription = 'Unknown';
    }

    if (movieDescription.length > 250) {
        movieDescription = movieDescription.substring(0, 250) + "...";
    }

    let movieHeading = $('<h2 class="font-serif text-xl">').text(movie.title);
    let movieYear = $('<h3>').text(`Released: ${movie.release_date}`);
    let movieImage = $('<img>').addClass("lg:h-80 text-centre item-centre").attr({'src': movie.imageLink,'alt': `${movie.title} Image`});
    let movieDescriptionElement = $('<p class="mb-4 itemDescription">').text(movieDescription);

    movieMainContainer.append(movieHeading, movieYear, movieImage, movieDescriptionElement);
}

// Function to append secondary movie data to the main container
function appendSecondaryMovieData(movieData, excludeId) {
    console.log(`Appending Secondary Movie Data`);
    let subMovieContainer = createSubContainer('movieSubContainer').addClass("mt-4"); // Create sub-container here

    let appendedCount = 0;
    for (let i = 0; i < movieData.length && appendedCount < 4; i++) {
        if (movieData[i].id !== excludeId) {
            let moreMoviesHeading = $('<h3 class="font-serif text-lg">').text(movieData[i].title.substring(0, 25) + (movieData[i].title.length > 25 ? '...' : '')).data('fullTitle', movieData[i].title);
            let moreMoviesYear = $('<h4>').text(`Released: ${movieData[i].release_date}`);
            let moreMoviesImage = $('<img>').attr({
                'src': movieData[i].imageLink ? movieData[i].imageLink : './assets/images/BookPlaceHolder.jpg',
                'alt': `${movieData[i].title} Image`
            }).addClass('w-full md:w-max-1/4').data('id', movieData[i].id);
            let moreMovieDescription = $('<p>').text((typeof movieData[i].description === 'string' ? movieData[i].description : '').substring(0, 100) + "...");

            addMoreItemCard(moreMoviesHeading, moreMoviesYear, moreMoviesImage, moreMovieDescription, subMovieContainer);
            appendedCount++;
        }
    }

    movieMainContainer.append(subMovieContainer); // Ensure sub-container is appended here as well

    subMovieContainer.off('click').on('click', '#moreItemCard', function() {
        let movieId = $(this).find('img').data('id');
        console.log(`Clicked on movie ID: ${movieId}`);
        handleMovieCardClick(movieId);
    });
}

// Function to append book data to the main container
function appendBookData(bookData) {
    bookMainContainer.empty();
    previousBookData = bookData; // Store the previous book data
    if (bookData && bookData.length > 0) {
        appendMainBookData(bookData[0]);
        // Append secondary items later
        setTimeout(() => appendSecondaryBookData(bookData, bookData[0].id), 0);
    } else {
        bookMainContainer.append('<p>OOPS, NO BOOKS HAVE BEEN FOUND, BUT TRY AGAIN AND YOU WILL LIKELY FIND A GOOD READ!</p>');
    }
}

// Function to append main book data to the main container
function appendMainBookData(book) {
    bookMainContainer.empty(); // Clear main container before adding new data
    let bookDescription = book.description;

    if (typeof bookDescription !== 'string') {
        bookDescription = 'Unknown';
    }

    if (bookDescription.length > 250) {
        bookDescription = bookDescription.substring(0, 250) + "...";
    }

    let bookHeading = $('<h2 class="font-serif text-xl">').text(book.title);
    let bookYear = $('<h3>').text(`Published: ${book.publishYear}`);
    let bookImage = $('<img>').attr({'src': book.imageLink, 'alt': `${book.title} Image`});
    let bookDescriptionElement = $('<p class="mb-4 itemDescription">').text(bookDescription);

    bookMainContainer.append(bookHeading, bookYear, bookImage, bookDescriptionElement);
}

// Function to append secondary book data to the main container
function appendSecondaryBookData(bookData, excludeId) {
    console.log(`Appending Secondary Book Data`);
    let subBooksContainer = createSubContainer('bookSubContainer').addClass("mt-4"); // Create sub-container here

    let appendedCount = 0;
    for (let i = 0; i < bookData.length && appendedCount < 4; i++) {
        if (bookData[i].id !== excludeId) {
            let moreBooksHeading = $('<h3 class="font-serif text-lg">').text(bookData[i].title.substring(0, 25) + (bookData[i].title.length > 25 ? '...' : '')).data('fullTitle', bookData[i].title);
            let moreBooksYear = $('<h4>').text(`Published: ${bookData[i].publishYear}`);
            let moreBooksImage = $('<img>').attr({
                'src': bookData[i].imageLink ? bookData[i].imageLink : './assets/images/BookPlaceHolder.jpg',
                'alt': `${bookData[i].title} Image`
            }).addClass('w-full md:w-max-1/4').data('id', bookData[i].id);
            let moreBookDescription = $('<p>').text((typeof bookData[i].description === 'string' ? bookData[i].description : '').substring(0, 100) + "...");

            addMoreItemCard(moreBooksHeading, moreBooksYear, moreBooksImage, moreBookDescription, subBooksContainer);
            appendedCount++;
        }
    }

    bookMainContainer.append(subBooksContainer); // Ensure sub-container is appended here as well

    subBooksContainer.off('click').on('click', '#moreItemCard', function() {
        let bookId = $(this).find('img').data('id');
        console.log(`Clicked on book ID: ${bookId}`);
        handleBookCardClick(bookId);
    });
}

// Function to handle the click event on a book card
function handleBookCardClick(bookId) {
    fetchMatchingBook('', bookId).then(bookData => {
        bookMainContainer.empty(); // Clear the main container before appending new main item
        appendMainBookData(bookData[0]);
        let bookTitle = bookData[0].title;
        saveSearchTerm(bookTitle);
        fetchMatchingMovie(bookTitle).then(movieData => {
            appendMovieData(movieData);
        });
        fetchMatchingBook(bookTitle).then(subBookData => {
            if (subBookData.length <= 1) {
                appendSecondaryBookData(previousBookData.filter(book => book.id !== bookId), bookId);
            } else {
                appendSecondaryBookData(subBookData.filter(book => book.id !== bookId), bookId);
            }
        });
    }).catch(() => {
        fetchMatchingMovie(searchItem.val().trim()).then(movieData => {
            appendMovieData(movieData);
        });
    });
}

// Function to handle the click event on a movie card
function handleMovieCardClick(movieId) {
    fetchMatchingMovie('', movieId).then(movieData => {
        movieMainContainer.empty(); // Clear the main container before appending new main item
        appendMainMovieData(movieData[0]);
        let movieTitle = movieData[0].title;
        saveSearchTerm(movieTitle);
        fetchMatchingBook(movieTitle).then(bookData => {
            appendBookData(bookData);
        });
        fetchMatchingMovie(movieTitle).then(subMovieData => {
            if (subMovieData.length <= 1) {
                appendSecondaryMovieData(previousMovieData.filter(movie => movie.id !== movieId), movieId);
            } else {
                appendSecondaryMovieData(subMovieData.filter(movie => movie.id !== movieId), movieId);
            }
        });
    }).catch(() => {
        fetchMatchingBook(searchItem.val().trim()).then(bookData => {
            appendBookData(bookData);
        });
    });
}


// Add event listener for Enter key press
searchItem.on('keyup', function(event) {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

// Add event listener for search button click
searchButton.on('click', async () => {
    console.clear();
    let searchTerm = searchItem.val().trim();
    if (!searchTerm) return;

    saveSearchTerm(searchTerm);

    let source = searchButton.data('source') || 'movie';
    console.log(`Search initiated from source: ${source}`);

    let movieData = [];
    let bookData = [];

    if (source === 'movie') {
        movieData = await fetchMatchingMovie();
        if (movieData.length > 0) {
            // Start fetching books based on the first movie result
            fetchMatchingBook(movieData[0].title).then(bookResults => {
                bookData = bookResults;
                appendBookData(bookData);
            });
        } else {
            bookData = await fetchMatchingBook(searchTerm);
        }
        appendMovieData(movieData);
    } else if (source === 'book') {
        bookData = await fetchMatchingBook();
        if (bookData.length > 0) {
            // Start fetching movies based on the first book result
            fetchMatchingMovie(bookData[0].title).then(movieResults => {
                movieData = movieResults;
                appendMovieData(movieData);
            });
        } else {
            movieData = await fetchMatchingMovie(searchTerm);
        }
        appendBookData(bookData);
    }

    if (movieData.length === 0 && bookData.length === 0) {
        console.log('No movie and book data found');
        showModal("Oops, your search hit a snag. Try searching again!");
    }

    searchButton.removeData('source');
});

// Function to load search history on window load
window.onload = function() {
    modal.style.display = "flex";
    loadSearchHistory();
}

// Function to load search history on window load
window.onload = function() {
    modal.style.display = "flex";
    loadSearchHistory();
}

// Function to close the modal when the span (close button) is clicked
span.onclick = function() {
    modal.style.display = "none";
}

// Function to close the modal when the modal button is clicked
modalButton.onclick = function() {
    modal.style.display = "none";
}

// Function to close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Function to show a modal with a custom message
function showModal(message) {
    const defaultModalContent = $('#defaultModalContent');
    const modalMessageContainer = $('#modalMessageContainer');
    const modalButton = $('#modalButton');

    defaultModalContent.hide(); // Hide the default content
    modalMessageContainer.empty(); // Clear any existing messages
    modalMessageContainer.append(`<p>${message}</p>`); // Add the new message
    modalMessageContainer.removeClass('hidden'); // Ensure the message container is visible

    modalButton.text('Continue'); // Change the button text

    $('#myModal').css('display', 'flex');
}

// Function to save a search term to local storage and update the search history
function saveSearchTerm(term) {
    if (!history.includes(term)) {
        if(history.length > 10) {
            history.pop();
        }
        history.unshift(term); // Add new term to the beginning of the history array
        localStorage.setItem('search-history', JSON.stringify(history));
    }
    loadSearchHistory();
}

// Function to load search history from local storage and display it
function loadSearchHistory() {
    let history = JSON.parse(localStorage.getItem('search-history')) || [];
    let searchHistoryList = $('#search-history');
    searchHistoryList.empty();
    history.forEach(item => {
        let button = $('<button>')
        .text(item)
        .addClass('history-button bg-transparent hover:bg-[#232323] text-[#232323] font-semibold hover:text-white py-2 px-4 border border-[#C2405C] hover:border-transparent rounded lg:h-20 lg:text-sm lg:overflow-y-auto')
        .on('click', function() {
            searchItem.val(item);
            searchButton.click();
        });
        let searchedItem =$('<div>').addClass('mr-1 ml-1 items-center').append(button);
        searchHistoryList.append(searchedItem);
    })
}