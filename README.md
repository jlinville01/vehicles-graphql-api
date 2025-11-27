# Planes Trains and Automobiles API

![Project logo](https://media1.tenor.com/m/aRvgI9VbrXAAAAAd/freezing-cold.gif)

## Setup

### Prerequisites
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/jlinville01/fender-api.git
   cd fender-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   Node: npm run start
   nodemon: npm run dev
   ```
   - The app will be available at `http://localhost:8080`
   
4. **Change directories**
   ```bash
   cd qa
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Run automation**
   ```bash
   npx wdio run ./wdio.conf.js
   ```

### Refresh Data
1. **Start the server again**

OR

2. **Use the /admin/refresh endpoint (no restart)**
   ```bash
   curl -X POST http://localhost:3000/admin/refresh
   ```

## This project is built with

- Node
- Express
