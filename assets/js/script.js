let searchItem = $('#searchBar');
let searchButton = $('#searchButton');
let movieImageContainer = $('#movie-image');
let bookImageContainer = $('#book-image');
let bookMainContainer = $('.mainBookContainer');
let movieMainContainer = $('.mainMovieContainer'); 

function fetchMatchingBook() {
    const bookInfoUrl = 'https://www.googleapis.com/books/v1/volumes';
    const params = new URLSearchParams({
        'q': searchItem.val(),
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
                let publishYear = volume_info.publishedDate || ['Unknown'];
                let imageLink = volume_info.imageLinks ? volume_info.imageLinks.large || volume_info.imageLinks.extraLarge || volume_info.imageLinks.thumbnail : 'No Image Available';
                
                let book = {
                    imageLink: imageLink,
                    title: title,
                    authors: authors.join(', '),
                    publishYear: publishYear,
                    description: description
                };

                bookDetails.push(book);
            });

            return bookDetails;
        })
        .catch(error => {
            console.error(error.message);
        });
}

function fetchMatchingMovie() {
    const movieInfoUrl = 'https://api.themoviedb.org/3/search/movie';
    const apiKey = 'd73ec7c437dcf808b407070026a9ad14'; // Replace with your actual API key
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNzNlYzdjNDM3ZGNmODA4YjQwNzA3MDAyNmE5YWQxNCIsIm5iZiI6MTcxOTMwNjkzOS4wNDYzNTksInN1YiI6IjY2N2E4NTQ3ZGFiNzBmNTMzMDhiZTE2NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.L3veWGSb3v06RYZhaMDWL0yx9rZI_Geq21zeAKe5R5Y'; 
    
    // Replace with your actual access token
    const params = new URLSearchParams({
        'api_key': apiKey,
        'query': searchItem.val(),
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
                let imageLink = item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : 'No Image Available'; // Use /original for the highest resolution

                return {
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

searchButton.on('click', async () => {
    console.clear();
    let bookData = await fetchMatchingBook();
    let movieData = await fetchMatchingMovie();

    bookMainContainer.empty();
    movieMainContainer.empty();

    if (bookData && bookData.length > 0) {
        let book = bookData[0];
        let bookDescription = book.description;

        if (bookDescription.length > 250) {
            bookDescription = bookDescription.substring(0, 350) + "...";
        }

        let bookHeading = $('<h2>').text(book.title);
        let bookImage = $('<img>').attr('src', book.imageLink);
        let bookDescriptionElement = $('<p>').text(bookDescription);

        // Append the elements to the bookMainContainer
        bookMainContainer.append(bookHeading);
        bookMainContainer.append(bookImage);
        bookMainContainer.append(bookDescriptionElement);
    }

    if (movieData && movieData.length > 0) {
        let movie = movieData[0];
        let movieDescription = movie.description;

        if (movieDescription.length > 250) {
            movieDescription = movieDescription.substring(0, 350) + "...";
        }

        let movieHeading = $('<h2>').text(movie.title);
        let movieImage = $('<img>').attr('src', movie.imageLink);
        let movieDescriptionElement = $('<p>').text(movieDescription);

        // Append the elements to the movieMainContainer
        movieMainContainer.append(movieHeading);
        movieMainContainer.append(movieImage);
        movieMainContainer.append(movieDescriptionElement);
    }
});
