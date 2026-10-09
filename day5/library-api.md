# Library REST API: Books

This API manages a library's book collection. Paths are shown relative to the base URL `https://api.example.com`. Requests and responses use JSON.

## Endpoints

- **List books**
  - **Method:** `GET`
  - **Path:** `/books`
  - **Description:** Returns a collection of books.
  - **Success:** `200 OK`

- **Get one book**
  - **Method:** `GET`
  - **Path:** `/books/{id}`
  - **Description:** Returns the book with the specified ID.
  - **Success:** `200 OK`

- **Create a book**
  - **Method:** `POST`
  - **Path:** `/books`
  - **Description:** Creates a book and returns the created resource.
  - **Example request body:**
    ```json
    {
      "title": "The Hobbit",
      "author": "J. R. R. Tolkien",
      "publishedYear": 1937
    }
    ```
  - **Success:** `201 Created`

- **Update a book**
  - **Method:** `PUT`
  - **Path:** `/books/{id}`
  - **Description:** Replaces the editable details of an existing book.
  - **Example request body:**
    ```json
    {
      "title": "The Hobbit",
      "author": "J. R. R. Tolkien",
      "publishedYear": 1937
    }
    ```
  - **Success:** `200 OK`

- **Delete a book**
  - **Method:** `DELETE`
  - **Path:** `/books/{id}`
  - **Description:** Deletes the specified book.
  - **Success:** `204 No Content`

- **List books by author**
  - **Method:** `GET`
  - **Path:** `/books?author=Ursula%20K.%20Le%20Guin`
  - **Description:** Returns books whose author matches the `author` query parameter.
  - **Success:** `200 OK`

## Error responses

- **`400 Bad Request`** — The request is invalid, such as a `POST /books` request with a missing required `title` field or an invalid `publishedYear`.
- **`404 Not Found`** — The requested resource does not exist, such as `GET /books/9999` when no book has ID `9999`.
