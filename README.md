# Proggenius-test-task

ProgGenius - Test - Full Stack Developer

## Required

The following must be installed on your system:

- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (which includes Docker Compose v2)

---

## To start backend

### 1. Run the Database with Docker

The project uses a PostgreSQL database running inside a Docker container.

1.  Make sure Docker Desktop is running on your machine.
2.  In the **root directory** of this project (where the `docker-compose.yml` file is located), run the following command in your terminal:

    ```bash
    docker compose up -d
    ```

### 2. How to Start the Backend Server

All commands for the backend must be run from the `app/server` directory.

1.  Navigate to the server's directory:

    ```bash
    cd app/server
    ```

2.  Install the necessary dependencies:

    ```bash
    npm install
    ```

3.  Start the server:
    ```bash
    npm run start:dev
    ```

The backend server will now be running and listening for connections on **`http://localhost:3000`**.

---

## How to Connect from the Frontend

The backend exposes both a WebSocket API for real-time communication and a REST API for initial data fetching.

### WebSocket API

- **Connection URL:** `http://localhost:3000`

#### Emitting Events (Client → Server)

To inform the server about a key press, emit the following event:

- **Event Name:** `keyPress`
- **Payload:** An object containing the key that was pressed.
- **Example (`socket.io-client`):**
  ```javascript
  socket.emit("keyPress", { key: "a" });
  ```

#### Listening for Events (Server → Client)

This event is sent once upon initial connection and then again after every key press that changes the statistics.

- **Event Name:** `statsUpdate`
- **Payload:** An array of objects, sorted by count in descending order. Each object represents a key and its total press count.
- **Example (`socket.io-client`):**
  ```javascript
  socket.on("statsUpdate", (data) => {
    // data will be: [{ key: 'a', count: 150 }, { key: 'x', count: 95 }, ...]
  });
  ```

### REST API

This API is available for SEO crawlers or to fetch data for statically generated pages.

- **`GET /analytics/stats`**

  - **Description:** Returns the same array of key statistics as the `statsUpdate` WebSocket event. Useful for fetching the initial state on the server-side for SEO.

- **`GET /analytics/key/:key`**
  - **Description:** Returns detailed information for a single key, including its total count and navigation links to the next/previous keys in the ranked list.
  - **Example Response for `GET /analytics/key/y`:**
    ```json
    {
      "key": "y",
      "count": 29,
      "navigation": {
        "prev": "/key/w",
        "next": "/key/x"
      }
    }
    ```

---

## Database Write Optimization Logic

- To handle a high frequency of key presses without overloading the database, server writes them to the PostgreSQL database once in 10 seconds.
- Simultaneously, an in-memory map (`keyCounts`) is instantly updated. This map is sent for  the `statsUpdate` events and REST API requests.
