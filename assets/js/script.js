let searchItem = $('#searchBar');
let searchButton = $('#searchButton');
let movieImageContainer = $('#movie-image');
let bookImageContainer = $('#book-image');
let bookMainContainer = $('.mainBookContainer');
let movieMainContainer = $('.mainMovieContainer');
var modal = document.getElementById("myModal");
var btn = document.getElementById("beginButton");
var span = document.getElementsByClassName("close")[0];

function fetchMatchingBook(movieTitle = '') {
    const bookInfoUrl = 'https://www.googleapis.com/books/v1/volumes';
    const params = new URLSearchParams({
        'q': movieTitle || searchItem.val(),
        'maxResults': 5
    }).toString();

    return fetch(`${bookInfoUrl}?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let bookDetails = [];

            data.items.forEach(item => {
                let volume_info = item.volumeInfo;
                let title = volume_info.title;
                let authors = volume_info.authors || ['Unknown'];
                let description = volume_info.description || ['Unknown'];
                let publishYear = volume_info.publishedDate || 'Unknown';
                let imageLink = volume_info.imageLinks ? volume_info.imageLinks.large || volume_info.imageLinks.extraLarge || volume_info.imageLinks.thumbnail : 'No Image Available';

                let book = {
                    title: title,
                    authors: authors.join(', '),
                    description: description,
                    publishYear: publishYear,
                    imageLink: imageLink
                };

                bookDetails.push(book);
                console.log(`Book Data is : ${bookDetails}`);
            });

            return bookDetails;
        })
        .catch(error => {
            console.error(error.message);
        });
}

function fetchMatchingMovie(bookTitle = '') {
    const movieInfoUrl = 'https://api.themoviedb.org/3/search/movie';
    const apiKey = 'd73ec7c437dcf808b407070026a9ad14'; // Replace with your actual API key
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNzNlYzdjNDM3ZGNmODA4YjQwNzA3MDAyNmE5YWQxNCIsIm5iZiI6MTcxOTMwNjkzOS4wNDYzNTksInN1YiI6IjY2N2E4NTQ3ZGFiNzBmNTMzMDhiZTE2NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.L3veWGSb3v06RYZhaMDWL0yx9rZI_Geq21zeAKe5R5Y';

    const params = new URLSearchParams({
        'api_key': apiKey,
        'query': bookTitle || searchItem.val(),
        'page': 1
    }).toString();

    return fetch(`${movieInfoUrl}?${params}`, {
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
            let movieDetails = data.results.map(item => {
                let title = item.title;
                let release_date = item.release_date || 'Unknown';
                let description = item.overview || 'Unknown';
                let imageLink = item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : 'No Image Available';

                console.log(data);
                return {
                    title: title,
                    release_date: release_date,
                    description: description,
                    imageLink: imageLink
                };
            });
            console.log(`Movie Data is : ${movieDetails.items}`);
            return movieDetails;
        })
        .catch(error => {
            console.error(error.message);
        });
}

function addMoreItemCard(heading, year, image, description, container) {
    let moreItemCard = $('<div>').attr('id', 'moreItemCard').css({
        'height': '100%',
        'width': 'auto',
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        'text-align': 'center'
    });

    let headingDiv = $('<div>').css({
        'height': '10%',
        'width': '100%',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
    }).append(heading);

    let yearDiv = $('<div>').css({
        'height': '10%',
        'width': '100%',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
    }).append(year);

    let imageDiv = $('<div>').css({
        'height': '50%',
        'width': '100%',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
    }).append(image);

    let descriptionDiv = $('<div>').css({
        'height': '30%',
        'width': '100%',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
    }).append(description);

    moreItemCard.append(headingDiv, yearDiv, imageDiv, descriptionDiv);
    container.append(moreItemCard);
}

function appendMovieData(movieData) {
    movieMainContainer.empty();
    if (movieData && movieData.length > 0) {
        let movie = movieData[0];
        let movieDescription = movie.description;
        if (movieDescription.length > 250) {
            movieDescription = movieDescription.substring(0, 250) + "...";
        }
        let movieHeading = $('<h2>').text(movie.title);
        let movieYear = $('<h3>').text(`Released: ${movie.release_date}`);
        let movieImage = $('<img>').attr({'src': movie.imageLink, 'alt': `${movie.title} Image`});
        let movieDescriptionElement = $('<p>').text(movieDescription);

        movieMainContainer.append(movieHeading);
        movieMainContainer.append(movieYear);
        movieMainContainer.append(movieImage);
        movieMainContainer.append(movieDescriptionElement);

        let subMovieContainer = $('<div>').css({
            'display': 'flex',
            'flex-direction': 'row',
            'flex-wrap': 'nowrap',
            'height': '30%',
            'padding-top': '5vh'
        });

        for (let i = 1; i < movieData.length && i < 5; i++) {
            let moreMoviesHeading = $('<h3>').text(movieData[i].title.substring(0, 30) + (movieData[i].title.length > 30 ? '...' : '')).data('fullTitle', movieData[i].title);
            let moreMoviesYear = $('<h4>').text(`Released: ${movieData[i].release_date}`);
            let moreMoviesImage = $('<img>').attr({'src': movieData[i].imageLink, 'alt': `${movieData[i].title} Image`}).css({
                'height': '100%',
                'width': 'auto'
            });
            let moreMovieDescription = $('<p>').text(movieData[i].description.substring(0, 100) + "...");

            addMoreItemCard(moreMoviesHeading, moreMoviesYear, moreMoviesImage, moreMovieDescription, subMovieContainer);
        }

        movieMainContainer.append(subMovieContainer);

        subMovieContainer.on('click', '#moreItemCard', function() {
            let movie = $(this).find('h3').data('fullTitle');
            searchItem.val(movie);
            searchButton.data('source', 'movie').click();
        });
    }
}

function appendBookData(bookData) {
    bookMainContainer.empty();
    if (bookData && bookData.length > 0) {
        let book = bookData[0];
        let bookDescription = book.description;

        if (bookDescription.length > 250) {
            bookDescription = bookDescription.substring(0, 250) + "...";
        }
        let bookHeading = $('<h2>').text(book.title);
        let bookYear = $('<h3>').text(`Published: ${book.publishYear}`);
        let bookImage = $('<img>').attr({'src': book.imageLink, 'alt': `${book.title} Image`});
        let bookDescriptionElement = $('<p>').text(bookDescription);

        bookMainContainer.append(bookHeading);
        bookMainContainer.append(bookYear);
        bookMainContainer.append(bookImage);
        bookMainContainer.append(bookDescriptionElement);

        let subBooksContainer = $('<div>').css({
            'display': 'flex',
            'flex-direction': 'row',
            'flex-wrap': 'nowrap',
            'height': '30%',
            'padding-top': '5vh'
        });

        for (let i = 1; i < bookData.length && i < 5; i++) {
            let moreBooksHeading = $('<h3>').text(bookData[i].title.substring(0, 30) + (bookData[i].title.length > 30 ? '...' : '')).data('fullTitle', bookData[i].title);
            let moreBooksYear = $('<h4>').text(`Published: ${bookData[i].publishYear}`);
            let moreBooksImage = $('<img>').attr({'src': bookData[i].imageLink, 'alt': `${bookData[i].title} Image`}).css({
                'height': '100%',
                'width': 'auto'
            });
            let moreBookDescription = $('<p>').text(bookData[i].description.substring(0, 100) + "...");

            addMoreItemCard(moreBooksHeading, moreBooksYear, moreBooksImage, moreBookDescription, subBooksContainer);
        }

        bookMainContainer.append(subBooksContainer);

        subBooksContainer.on('click', '#moreItemCard', function() {
            let book = $(this).find('h3').data('fullTitle');
            searchItem.val(book);
            searchButton.data('source', 'book').click();
        });
    }
}

searchButton.on('click', async () => {
    console.clear();
    let source = searchButton.data('source') || 'movie';

    if (source === 'movie') {
        let movieData = await fetchMatchingMovie();
        let bookData = await fetchMatchingBook(movieData[0].title);

        appendMovieData(movieData);
        appendBookData(bookData);
    } else if (source === 'book') {
        let bookData = await fetchMatchingBook();
        let movieData = await fetchMatchingMovie(bookData[0].title);

        appendBookData(bookData);
        appendMovieData(movieData);
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

window.onclick = function() {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}