
# WebSocket Latency Checker

A web application to monitor WebSocket connection latencies in real time, featuring error reporting and a dark mode toggle.

## Features

- **Real-Time Latency Monitoring**: View latencies in ms.
- **Dark Mode**: Toggle between light and dark themes.
- **Dynamic Refresh**: Updates latency every 10 seconds.
  
## Getting Started

### Prerequisites

- A web browser

### Installation

1. Clone or download the repository.
2. Create an `endpoints.json` file with this structure:

   ```json
   {
     "network1": {
       "relaychains": {"Provider": "wss://example.com/socket"},
       "parachains": {
          "para1": {"Provider": "wss://example.com/socket"},
       }
     }
   }
   ```

3. Open `index.html` in your browser.

### Usage

- Latency is color-coded:
  - Green: < 300 ms
  - Yellow: 300 - 1000 ms
  - Red: > 1000 ms
- Click the sun icon to toggle dark mode.

## Technologies

HTML, CSS, JavaScript, WebSocket API

## Contributing

Fork the repo and submit a pull request for improvements.

## License

MIT License

## Author

Parity Devops
