let searchItem = $('#searchBar');
let searchButton = $('#searchButton');

function fetchMatchingBook() {
    const bookInfoUrl = 'https://www.googleapis.com/books/v1/volumes';
    const params = new URLSearchParams({
        'q': searchItem.val(),
        'maxResults': 5
    }).toString();

    fetch(`${bookInfoUrl}?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('The Book Data is:', data); // Log the entire response

            data.items.forEach(item => {
                let volume_info = item.volumeInfo;
                let title = volume_info.title;
                let authors = volume_info.authors || ['Unknown'];
                let description = volume_info.description || ['Unknown'];
                console.log(`Title: ${title}`);
                console.log(`Authors: ${authors.join(', ')}`);
                console.log(`Description: ${description}`);
                console.log("----");
            });
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

    fetch(`${movieInfoUrl}?${params}`, {
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
            console.log('The Movie Data is:', data); // Log the entire response

            data.results.forEach(item => {
                let title = item.title;
                let release_date = item.release_date || 'Unknown';
                let description = item.overview || 'Unknown';
                console.log(`Title: ${title}`);
                console.log(`Release Date: ${release_date}`);
                console.log(`Description: ${description}`);
                console.log("----");
            });
        })
        .catch(error => {
            console.error(error.message);
        });
}





searchButton.on('click', () => {
    console.clear();
    fetchMatchingBook();
    fetchMatchingMovie();
});