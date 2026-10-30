const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: `User ${username} already exists!` });
    }

    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Promise to get all books
const getBooks = () => {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
};

// Task 1 & Task 10: Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getBooks();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list" });
    }
});

// Promise to get book details by ISBN
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });
};

// Task 2 & Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            return res.status(error.status || 404).json({ message: error.message });
        });
});

// Promise to get book details by Author
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        let matchingBooks = [];
        for (let isbn in books) {
            if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({
                    isbn: isbn,
                    author: books[isbn].author,
                    title: books[isbn].title,
                    reviews: books[isbn].reviews
                });
            }
        }
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found for author: ${author}` });
        }
    });
};

// Task 3 & Task 12: Get book details based on author using Promises / async-await
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then((matchingBooks) => {
            return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
        })
        .catch((error) => {
            return res.status(error.status || 404).json({ message: error.message });
        });
});

// Promise to get book details by Title
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        let matchingBooks = [];
        for (let isbn in books) {
            if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push({
                    isbn: isbn,
                    author: books[isbn].author,
                    title: books[isbn].title,
                    reviews: books[isbn].reviews
                });
            }
        }
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found with title: ${title}` });
        }
    });
};

// Task 4 & Task 13: Get all books based on title using Promises / async-await
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title)
        .then((matchingBooks) => {
            return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
        })
        .catch((error) => {
            return res.status(error.status || 404).json({ message: error.message });
        });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

// ==============================================================================
// Tasks 10-13: Code implementation using Axios with Promise callbacks and async/await
// ==============================================================================
const BASE_URL = 'http://localhost:5000';

// Task 10: Retrieve all books using async/await with Axios
async function axiosGetAllBooks() {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return response.data;
    } catch (error) {
        console.error("Error retrieving all books:", error.message);
    }
}

// Task 11: Retrieve book details by ISBN using Promises with Axios
function axiosGetBookByISBN(isbn) {
    return axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("Error retrieving book by ISBN:", error.message);
        });
}

// Task 12: Retrieve books by Author using async/await with Axios
async function axiosGetBooksByAuthor(author) {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        console.error("Error retrieving books by author:", error.message);
    }
}

// Task 13: Retrieve books by Title using Promises with Axios
function axiosGetBooksByTitle(title) {
    return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("Error retrieving books by title:", error.message);
        });
}

module.exports.general = public_users;
module.exports.axiosGetAllBooks = axiosGetAllBooks;
module.exports.axiosGetBookByISBN = axiosGetBookByISBN;
module.exports.axiosGetBooksByAuthor = axiosGetBooksByAuthor;
module.exports.axiosGetBooksByTitle = axiosGetBooksByTitle;
