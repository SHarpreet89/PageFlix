let searchItem = $('#searchBar');
let searchButton = $('#searchButton');
let movieImageContainer = $('#movie-image');
let bookImageContainer = $('#book-image');
let bookMainContainer = $('.mainBookContainer');
let movieMainContainer = $('.mainMovieContainer');
var modal = document.getElementById("myModal");
var btn = document.getElementById("beginButton");
var span = document.getElementsByClassName("close")[0];
let previousMovieData = [];
let previousBookData = [];

function simplifyTitle(title) {
    return title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0, 3).join(' ');
}

function fetchMatchingBook(bookTitle = '', bookId = '') {
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
        });
}

function fetchMatchingMovie(movieTitle = '', movieId = '') {
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
        });
}

function createSubContainer(className) {
    return $('<div>').addClass(`subContainer ${className}`);
}

function addMoreItemCard(heading, year, image, description, container) {
    let moreItemCard = $('<div>').attr('id', 'moreItemCard');

    let headingDiv = $('<div>').addClass('moreItemHeading').append(heading);
    let yearDiv = $('<div>').addClass('moreItemYear').append(year);
    let imageDiv = $('<div>').addClass('moreItemImage').append(image);
    let descriptionDiv = $('<div>').addClass('moreItemDescription').append(description);

    moreItemCard.append(headingDiv, yearDiv, imageDiv, descriptionDiv);
    container.append(moreItemCard);
}

function appendMainMovieData(movie) {
    movieMainContainer.empty(); // Clear main container before adding new data
    let movieDescription = movie.description;
    if (movieDescription.length > 250) {
        movieDescription = movieDescription.substring(0, 250) + "...";
    }
    let movieHeading = $('<h2>').text(movie.title);
    let movieYear = $('<h3>').text(`Released: ${movie.release_date}`);
    let movieImage = $('<img>').attr({'src': movie.imageLink, 'alt': `${movie.title} Image`});
    let movieDescriptionElement = $('<p>').text(movieDescription);

    movieMainContainer.append(movieHeading, movieYear, movieImage, movieDescriptionElement);
}

function appendMainBookData(book) {
    bookMainContainer.empty(); // Clear main container before adding new data
    let bookDescription = book.description;

    if (typeof bookDescription !== 'string') {
        bookDescription = 'Unknown';
    }

    if (bookDescription.length > 250) {
        bookDescription = bookDescription.substring(0, 250) + "...";
    }
    let bookHeading = $('<h2>').text(book.title);
    let bookYear = $('<h3>').text(`Published: ${book.publishYear}`);
    let bookImage = $('<img>').attr({'src': book.imageLink, 'alt': `${book.title} Image`});
    let bookDescriptionElement = $('<p>').text(bookDescription);

    bookMainContainer.append(bookHeading, bookYear, bookImage, bookDescriptionElement);
}

function appendMovieData(movieData) {
    movieMainContainer.empty();
    previousMovieData = movieData; // Store the previous movie data
    if (movieData && movieData.length > 0) {
        appendMainMovieData(movieData[0]);

        let subMovieContainer = createSubContainer('movieSubContainer'); // Create sub-container here

        for (let i = 1; i < movieData.length && i < 5; i++) {
            let moreMoviesHeading = $('<h3>').text(movieData[i].title.substring(0, 25) + (movieData[i].title.length > 25 ? '...' : '')).data('fullTitle', movieData[i].title);
            let moreMoviesYear = $('<h4>').text(`Released: ${movieData[i].release_date}`);
            let moreMoviesImage = $('<img>').attr({
                'src': movieData[i].imageLink ? movieData[i].imageLink : './assets/images/MoviePlaceHolder.jpg',
                'alt': `${movieData[i].title} Image`
            }).data('id', movieData[i].id);
            let moreMovieDescription = $('<p>').text((typeof movieData[i].description === 'string' ? movieData[i].description : '').substring(0, 100) + "...");

            addMoreItemCard(moreMoviesHeading, moreMoviesYear, moreMoviesImage, moreMovieDescription, subMovieContainer);
        }

        movieMainContainer.append(subMovieContainer); // Append the sub-container here

        subMovieContainer.off('click').on('click', '#moreItemCard', function() {
            let movieId = $(this).find('img').data('id');
            console.log(`Clicked on movie ID: ${movieId}`);
            fetchMatchingMovie('', movieId).then(movieData => {
                movieMainContainer.empty(); // Clear the main container before appending new main item
                appendMainMovieData(movieData[0]);
                let movieTitle = movieData[0].title;
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
            });
        });
    } else {
        movieMainContainer.append('<p>OPPS, POPCORN AWAITS BUT THIS SEARCH RETURNED NOTHING, PLEASE TRY AGAIN.</p>');
    }
}

function appendSecondaryMovieData(movieData, excludeId) {
    console.log(`Appending Secondary Movie Data`);
    let subMovieContainer = createSubContainer('movieSubContainer'); // Create sub-container here

    for (let i = 0; i < movieData.length && i < 5; i++) {
        console.log(`Movie being appended is ${movieData[i].title}`);
        if (movieData[i].id !== excludeId) {
            let moreMoviesHeading = $('<h3>').text(movieData[i].title.substring(0, 25) + (movieData[i].title.length > 25 ? '...' : '')).data('fullTitle', movieData[i].title);
            let moreMoviesYear = $('<h4>').text(`Released: ${movieData[i].release_date}`);
            let moreMoviesImage = $('<img>').attr({
                'src': movieData[i].imageLink ? movieData[i].imageLink : './assets/images/MoviePlaceHolder.jpg',
                'alt': `${movieData[i].title} Image`
            }).data('id', movieData[i].id);
            let moreMovieDescription = $('<p>').text((typeof movieData[i].description === 'string' ? movieData[i].description : '').substring(0, 100) + "...");

            addMoreItemCard(moreMoviesHeading, moreMoviesYear, moreMoviesImage, moreMovieDescription, subMovieContainer);
        }
    }

    movieMainContainer.append(subMovieContainer); // Ensure sub-container is appended here as well

    subMovieContainer.off('click').on('click', '#moreItemCard', function() {
        let movieId = $(this).find('img').data('id');
        console.log(`Clicked on movie ID: ${movieId}`);
        fetchMatchingMovie('', movieId).then(movieData => {
            movieMainContainer.empty(); // Clear the main container before appending new main item
            appendMainMovieData(movieData[0]);
            let movieTitle = movieData[0].title;
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
        });
    });
}

function appendBookData(bookData) {
    bookMainContainer.empty();
    previousBookData = bookData; // Store the previous book data
    if (bookData && bookData.length > 0) {
        appendMainBookData(bookData[0]);

        let subBooksContainer = createSubContainer('bookSubContainer'); // Create sub-container here

        for (let i = 1; i < bookData.length && i < 5; i++) {
            let moreBooksHeading = $('<h3>').text(bookData[i].title.substring(0, 25) + (bookData[i].title.length > 25 ? '...' : '')).data('fullTitle', bookData[i].title);
            let moreBooksYear = $('<h4>').text(`Published: ${bookData[i].publishYear}`);
            let moreBooksImage = $('<img>').attr({
                'src': bookData[i].imageLink ? bookData[i].imageLink : './assets/images/BookPlaceHolder.jpg',
                'alt': `${bookData[i].title} Image`
            }).data('id', bookData[i].id);
            let moreBookDescription = $('<p>').text((typeof bookData[i].description === 'string' ? bookData[i].description : '').substring(0, 100) + "...");

            addMoreItemCard(moreBooksHeading, moreBooksYear, moreBooksImage, moreBookDescription, subBooksContainer);
        }

        bookMainContainer.append(subBooksContainer); // Append the sub-container here

        subBooksContainer.off('click').on('click', '#moreItemCard', function() {
            let bookId = $(this).find('img').data('id');
            console.log(`Clicked on book ID: ${bookId}`);
            fetchMatchingBook('', bookId).then(bookData => {
                bookMainContainer.empty(); // Clear the main container before appending new main item
                appendMainBookData(bookData[0]);
                let bookTitle = bookData[0].title;
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
            });
        });
    } else {
        bookMainContainer.append('<p>OOPS, NO BOOKS HAVE BEEN FOUND, BUT TRY AGAIN AND YOU WILL LIKELY FIND A GOOD READ!</p>');
    }
}

function appendSecondaryBookData(bookData, excludeId) {
    console.log(`Appending Secondary Book Data`);
    let subBooksContainer = createSubContainer('bookSubContainer'); // Create sub-container here

    for (let i = 0; i < bookData.length && i < 5; i++) {
        if (bookData[i].id !== excludeId) {
            let moreBooksHeading = $('<h3>').text(bookData[i].title.substring(0, 25) + (bookData[i].title.length > 25 ? '...' : '')).data('fullTitle', bookData[i].title);
            let moreBooksYear = $('<h4>').text(`Published: ${bookData[i].publishYear}`);
            let moreBooksImage = $('<img>').attr({
                'src': bookData[i].imageLink ? bookData[i].imageLink : './assets/images/BookPlaceHolder.jpg',
                'alt': `${bookData[i].title} Image`
            }).data('id', bookData[i].id);
            let moreBookDescription = $('<p>').text((typeof bookData[i].description === 'string' ? bookData[i].description : '').substring(0, 100) + "...");

            addMoreItemCard(moreBooksHeading, moreBooksYear, moreBooksImage, moreBookDescription, subBooksContainer);
        }
    }

    bookMainContainer.append(subBooksContainer); // Ensure sub-container is appended here as well

    subBooksContainer.off('click').on('click', '#moreItemCard', function() {
        let bookId = $(this).find('img').data('id');
        console.log(`Clicked on book ID: ${bookId}`);
        fetchMatchingBook('', bookId).then(bookData => {
            bookMainContainer.empty(); // Clear the main container before appending new main item
            appendMainBookData(bookData[0]);
            let bookTitle = bookData[0].title;
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
        });
    });
}

searchButton.on('click', async () => {
    console.clear();
    let source = searchButton.data('source') || 'movie';
    console.log(`Search initiated from source: ${source}`);

    if (source === 'movie') {
        let movieData = await fetchMatchingMovie();
        if (movieData && movieData.length > 0) {
            let bookData = await fetchMatchingBook(movieData[0].title);
            appendMovieData(movieData);
            appendBookData(bookData);
        } else {
            console.log('No movie data found');
            movieMainContainer.empty();
            movieMainContainer.append('<p>OPPS, POPCORN AWAITS BUT THIS SEARCH RETURNED NOTHING, PLEASE TRY AGAIN.</p>');
        }
    } else if (source === 'book') {
        let bookData = await fetchMatchingBook();
        if (bookData && bookData.length > 0) {
            let movieData = await fetchMatchingMovie(bookData[0].title);
            appendBookData(bookData);
            appendMovieData(movieData);
        } else {
            console.log('No book data found');
            bookMainContainer.empty();
            bookMainContainer.append('<p>OOPS, NO BOOKS HAVE BEEN FOUND, BUT TRY AGAIN AND YOU WILL LIKELY FIND A GOOD READ!</p>');
        }
    }

    searchButton.removeData('source');
});

window.onload = function() {
    modal.style.display = "flex";
}

span.onclick = function() {
    modal.style.display = "none";
}

beginButton.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
