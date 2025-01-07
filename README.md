# HealthMap: Find Nearby Health Facilities

HealthMap is a web application that helps users locate health facilities near their current location using their latitude and longitude. The app uses geospatial data and the Haversine formula to calculate distances between coordinates and provides a list of nearby facilities within a specified radius.

---

## Features
- **Find Nearby Facilities**: Enter your coordinates and get a list of health facilities within your specified radius.
- **CSV Data Integration**: Uses a CSV file containing the latitude and longitude of health facilities in Kenya.
- **Geospatial Calculations**: Implements the Haversine formula to determine distances between points.
- **REST API**: Provides an API endpoint for querying nearby facilities.
- **Scalable and Extendable**: Can be integrated with a frontend application and expanded with more features.

---

## Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Geospatial Calculations**: Haversine formula (using the `haversine` package)
- **CSV Parsing**: `csv-parse` library
- **Deployment**: Easily deployable to platforms like Vercel, Render, or Fly.io

---

## Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- npm (version 8 or higher)
- A CSV file named `facilities.csv` with the following structure:
  ```csv
  name,latitude,longitude
  Health Facility 1,-1.2921,36.8219
  Health Facility 2,-1.2867,36.8269
  ```

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/healthmap.git
   cd healthmap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm run start
   ```

4. The server will be running at `http://localhost:3000`.

---

## API Usage

### Endpoint: `/nearby`
Retrieve nearby health facilities based on latitude, longitude, and radius.

#### Request Parameters
- `lat` (required): Latitude of the user.
- `lon` (required): Longitude of the user.
- `radius` (optional): Radius in kilometers (default: 5 km).

#### Example Request
```http
GET /nearby?lat=-1.2921&lon=36.8219&radius=10
```

#### Example Response
```json
[
  {
    "name": "Health Facility 1",
    "latitude": -1.2921,
    "longitude": 36.8219
  },
  {
    "name": "Health Facility 2",
    "latitude": -1.2867,
    "longitude": 36.8269
  }
]
```

---

## Future Enhancements
- **Interactive Map Integration**: Display facilities on a map using Leaflet or Google Maps.
- **Database Support**: Store facility data in a PostgreSQL database with PostGIS for more efficient queries.
- **User Authentication**: Allow users to save and manage favorite facilities.
- **Advanced Filtering**: Add filters for facility type, services, or ratings.

---

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add feature-name'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.

---

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

---

## Contact
For any questions or feedback, feel free to reach out:
- **Email**: your-email@example.com
- **GitHub**: [your-username](https://github.com/your-username)

