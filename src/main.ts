import L from 'leaflet';
import Papa from 'papaparse';

interface HealthFacility {
  Facility_N: string;
  Latitude: number;
  Longitude: number;
  Type: string;
  County: string;
  Location: string;
}

let map: L.Map;
let markers: L.LayerGroup;
let facilities: HealthFacility[] = [];
let legend: L.Control;
let nearestFacilityMarker: L.Marker | null = null;
let userLocationMarker: L.Marker | null = null;
let searchTimeout: NodeJS.Timeout | null = null;
let selectedFacilityMarker: L.Marker | null = null;

// Color mapping for facility types
const facilityColors: { [key: string]: string } = {
  'National Referral Hospital': '#e74c3c',    // Red
  'Provincial General Hospital': '#d35400',    // Dark Orange
  'District Hospital': '#e67e22',             // Orange
  'Sub-District Hospital': '#f39c12',         // Light Orange
  'Health Centre': '#27ae60',                 // Green
  'Dispensary': '#3498db',                    // Blue
  'Medical Clinic': '#9b59b6',                // Purple
  'Medical Centre': '#8e44ad',                // Dark Purple
  'Nursing Home': '#f1c40f',                  // Yellow
  'Maternity Home': '#ff7979',                // Pink
  'VCT Centre (Stand-Alone)': '#2ecc71',      // Light Green
  'Laboratory (Stand-alone)': '#16a085',      // Teal
  'Other': '#95a5a6'                          // Gray
};

function getFacilityColor(type: string): string {
  return facilityColors[type] || facilityColors['Other'];
}

// Initialize the map
function initMap() {
  map = L.map('map').setView([-1.2921, 36.8219], 11); // Center on Nairobi

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  markers = L.layerGroup().addTo(map);

  // Create and add the legend
  legend = new L.Control({ position: 'bottomright' });
  legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
      <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2); max-height: 300px; overflow-y: auto;">
        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">Facility Types</h4>
        ${Object.entries(facilityColors)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([type, color]) => 
            `<div style="margin: 4px 0;">
              <span style="
                display: inline-block;
                width: 12px;
                height: 12px;
                background: ${color};
                border-radius: 50%;
                margin-right: 5px;
              "></span>
              <span style="color: #666; font-size: 12px;">${type}</span>
            </div>`
          ).join('')}
      </div>
    `;
    return div;
  };
  legend.addTo(map);
}

// Load and parse the CSV data
async function loadData() {
  try {
    console.log('Fetching CSV data...');
    const response = await fetch('/data/kenya_healthcare_facilities.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvData = await response.text();
    console.log('CSV data fetched, parsing...');

    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true, // Automatically convert numbers
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Parse complete:', results);
        if (results.errors.length > 0) {
          console.error('Parse errors:', results.errors);
        }
        facilities = results.data as HealthFacility[];
        console.log(`Loaded ${facilities.length} facilities`);
        console.log('Sample facility:', facilities[0]);
        updateFilters();
        displayFacilities();
      },
      error: (error: Error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
  }
}

// Update filter dropdowns
function updateFilters() {
  const types = new Set(facilities.map(f => f.Type));
  const locations = new Set(facilities.map(f => f.County));

  const typeSelect = document.getElementById('facilityType') as HTMLSelectElement;
  const locationSelect = document.getElementById('location') as HTMLSelectElement;

  // Sort types and locations alphabetically
  const sortedTypes = Array.from(types).sort();
  const sortedLocations = Array.from(locations).sort();

  // Clear existing options
  typeSelect.innerHTML = '<option value="">All Facility Types</option>';
  locationSelect.innerHTML = '<option value="">All Counties</option>';

  sortedTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeSelect.appendChild(option);
  });

  sortedLocations.forEach(location => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    locationSelect.appendChild(option);
  });

  // Set Nairobi as default county
  const nairobiOption = Array.from(locationSelect.options).find(
    option => option.value.toLowerCase() === 'nairobi'
  );
  if (nairobiOption) {
    locationSelect.value = nairobiOption.value;
  }
}

// Display facilities on the map
function displayFacilities() {
  const typeFilter = (document.getElementById('facilityType') as HTMLSelectElement).value;
  const locationFilter = (document.getElementById('location') as HTMLSelectElement).value;

  markers.clearLayers();

  const filteredFacilities = facilities.filter(f => (
    (!typeFilter || f.Type === typeFilter) &&
    (!locationFilter || f.County === locationFilter)
  ));

  // Update facility counter
  const countElement = document.getElementById('facilityCount');
  if (countElement) {
    countElement.textContent = filteredFacilities.length.toLocaleString();
  }

  filteredFacilities.forEach(facility => {
      const color = getFacilityColor(facility.Type);
      const marker = L.circleMarker([facility.Latitude, facility.Longitude], {
        radius: 6,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      })
        .bindTooltip(facility.Facility_N, {
          permanent: false,
          direction: 'top',
          offset: [0, -10]
        })
        .bindPopup(`
          <strong>${facility.Facility_N}</strong><br>
          Type: ${facility.Type}<br>
          County: ${facility.County}<br>
          Location: ${facility.Location || 'N/A'}
        `);
      markers.addLayer(marker);
    });
}

// Initialize the application
function init() {
  initMap();
  loadData();

  // Add event listeners for filters
  document.getElementById('facilityType')?.addEventListener('change', displayFacilities);
  document.getElementById('location')?.addEventListener('change', () => {
    const locationSelect = document.getElementById('location') as HTMLSelectElement;
    const selectedCounty = locationSelect.value;

    // Update map view when county changes
    if (selectedCounty) {
      const countyFacilities = facilities.filter(f => f.County === selectedCounty);
      if (countyFacilities.length > 0) {
        const lats = countyFacilities.map(f => f.Latitude);
        const lngs = countyFacilities.map(f => f.Longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        map.fitBounds([
          [minLat, minLng],
          [maxLat, maxLng]
        ]);
      }
    }

    displayFacilities();
  });
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

function findNearestFacility(latitude: number, longitude: number): HealthFacility | null {
  if (facilities.length === 0) return null;

  let nearestFacility = facilities[0];
  let shortestDistance = calculateDistance(
    latitude,
    longitude,
    facilities[0].Latitude,
    facilities[0].Longitude
  );

  for (const facility of facilities) {
    const distance = calculateDistance(
      latitude,
      longitude,
      facility.Latitude,
      facility.Longitude
    );
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestFacility = facility;
    }
  }

  return nearestFacility;
}

function handleFindNearestFacility() {
  const btn = document.getElementById('nearestFacilityBtn') as HTMLButtonElement;
  btn.disabled = true;
  btn.innerHTML = '<span class="icon" aria-hidden="true">⌛</span> Finding your location...';
  
  // Update screen reader announcement
  const announcements = document.getElementById('accessibility-announcements');
  if (announcements) {
    announcements.textContent = 'Searching for your location...';
  }

  // Clear previous markers
  if (nearestFacilityMarker) {
    markers.removeLayer(nearestFacilityMarker);
  }
  if (userLocationMarker) {
    markers.removeLayer(userLocationMarker);
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      
      // Add user location marker
      userLocationMarker = L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '📍',
          iconSize: [25, 25],
          iconAnchor: [12, 24]
        })
      }).addTo(markers);
      
      const nearest = findNearestFacility(latitude, longitude);
      
      if (nearest) {
        // Add nearest facility marker
        nearestFacilityMarker = L.marker([nearest.Latitude, nearest.Longitude], {
          icon: L.divIcon({
            className: 'nearest-facility-marker',
            html: '🏥',
            iconSize: [25, 25],
            iconAnchor: [12, 24]
          })
        }).addTo(markers);

        // Calculate distance
        const distance = calculateDistance(latitude, longitude, nearest.Latitude, nearest.Longitude);
        
        // Create a line between user and facility
        L.polyline([
          [latitude, longitude],
          [nearest.Latitude, nearest.Longitude]
        ], {
          color: '#1a237e',
          weight: 2,
          opacity: 0.7,
          dashArray: '5, 10'
        }).addTo(markers);

        // Fit bounds to show both markers
        map.fitBounds(L.latLngBounds(
          [latitude, longitude],
          [nearest.Latitude, nearest.Longitude]
        ).pad(0.2));

        nearestFacilityMarker.bindPopup(
          `<strong>${nearest.Facility_N}</strong><br>
          Type: ${nearest.Type}<br>
          Distance: ${distance.toFixed(2)} km<br>
          County: ${nearest.County}`
        ).openPopup();

        // Update screen reader announcement
        const announcements = document.getElementById('accessibility-announcements');
        if (announcements) {
          announcements.textContent = `Found nearest facility: ${nearest.Facility_N}, ${distance.toFixed(2)} kilometers away`;
        }
      }

      btn.disabled = false;
      btn.innerHTML = '<span class="icon" aria-hidden="true">📍</span> Find Nearest Facility';
    },
    (error) => {
      console.error('Error getting location:', error);
      btn.disabled = false;
      btn.innerHTML = '<span class="icon" aria-hidden="true">📍</span> Find Nearest Facility';
      
      // Update screen reader alert
      const alerts = document.getElementById('accessibility-alerts');
      if (alerts) {
        alerts.textContent = 'Error: Unable to get your location. Please make sure location services are enabled.';
      }
      
      alert('Unable to get your location. Please make sure location services are enabled.');
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
}

// Initialize event listeners
function searchFacilities(query: string): HealthFacility[] {
  const searchTerm = query.toLowerCase();
  return facilities.filter(facility => 
    facility.Facility_N.toLowerCase().includes(searchTerm) ||
    facility.Type.toLowerCase().includes(searchTerm) ||
    facility.County.toLowerCase().includes(searchTerm)
  );
}

function showSearchResults(results: HealthFacility[]) {
  const searchResults = document.getElementById('searchResults');
  const searchInput = document.getElementById('searchFacility') as HTMLInputElement;
  if (!searchResults || !searchInput) return;

  searchResults.innerHTML = '';
  
  // Update ARIA attributes
  searchInput.setAttribute('aria-expanded', 'true');
  
  if (results.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'search-result-item';
    noResults.setAttribute('role', 'option');
    noResults.setAttribute('aria-selected', 'false');
    noResults.textContent = 'No facilities found';
    searchResults.appendChild(noResults);
    searchResults.classList.add('active');
    return;
  }

  let currentFocus = -1;

  results.slice(0, 5).forEach((facility, index) => {
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.setAttribute('role', 'option');
    resultItem.setAttribute('aria-selected', 'false');
    resultItem.setAttribute('id', `search-result-${index}`);
    resultItem.setAttribute('tabindex', '0');
    resultItem.innerHTML = `
      <strong>${facility.Facility_N}</strong><br>
      ${facility.Type}<br>
      ${facility.County}
    `;
    
    // Click handler
    const selectResult = () => {
      highlightFacility(facility);
      searchResults.classList.remove('active');
      searchInput.value = facility.Facility_N;
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.setAttribute('aria-activedescendant', '');
      
      // Update screen reader announcement
      const announcements = document.getElementById('accessibility-announcements');
      if (announcements) {
        announcements.textContent = `Selected facility: ${facility.Facility_N} in ${facility.County}`;
      }
    };

    resultItem.addEventListener('click', selectResult);
    resultItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectResult();
      }
    });
    
    searchResults.appendChild(resultItem);
  });

  searchResults.classList.add('active');

  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = searchResults.getElementsByClassName('search-result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      
      // Update focus
      currentFocus = e.key === 'ArrowDown' 
        ? (currentFocus + 1) % items.length
        : (currentFocus - 1 + items.length) % items.length;

      // Update visual focus and ARIA attributes
      Array.from(items).forEach((item, index) => {
        item.classList.toggle('focused', index === currentFocus);
        item.setAttribute('aria-selected', (index === currentFocus).toString());
      });

      // Update input's aria-activedescendant
      searchInput.setAttribute('aria-activedescendant', `search-result-${currentFocus}`);
      
      // Ensure focused item is visible
      (items[currentFocus] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }

    if (e.key === 'Enter' && currentFocus >= 0) {
      e.preventDefault();
      (items[currentFocus] as HTMLElement).click();
    }

    if (e.key === 'Escape') {
      searchResults.classList.remove('active');
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.setAttribute('aria-activedescendant', '');
    }
  });
}

function highlightFacility(facility: HealthFacility) {
  // Clear previous marker if it exists
  if (selectedFacilityMarker) {
    markers.removeLayer(selectedFacilityMarker);
  }

  // Create new marker
  selectedFacilityMarker = L.marker([facility.Latitude, facility.Longitude], {
    icon: L.divIcon({
      className: 'selected-facility-marker',
      html: '🏥',
      iconSize: [25, 25],
      iconAnchor: [12, 24]
    })
  }).addTo(markers);

  // Add popup
  selectedFacilityMarker.bindPopup(
    `<strong>${facility.Facility_N}</strong><br>
    Type: ${facility.Type}<br>
    County: ${facility.County}`
  ).openPopup();

  // Center map on facility
  map.setView([facility.Latitude, facility.Longitude], 14);
}

function handleSearch(event: Event) {
  const searchInput = event.target as HTMLInputElement;
  const searchResults = document.getElementById('searchResults');
  
  if (!searchResults) return;

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (!searchInput.value.trim()) {
    searchResults.classList.remove('active');
    return;
  }

  searchTimeout = setTimeout(() => {
    const results = searchFacilities(searchInput.value);
    showSearchResults(results);
  }, 300);
}

function initEventListeners() {
  const nearestFacilityBtn = document.getElementById('nearestFacilityBtn');
  if (nearestFacilityBtn) {
    nearestFacilityBtn.addEventListener('click', handleFindNearestFacility);
  }

  const searchInput = document.getElementById('searchFacility');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // Close search results when clicking outside
  document.addEventListener('click', (event) => {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchFacility');
    
    if (!searchResults || !searchInput) return;
    
    if (!searchResults.contains(event.target as Node) && 
        event.target !== searchInput) {
      searchResults.classList.remove('active');
    }
  });
}

// Start the application when the page loads
init();

// Add event listeners after the page loads
document.addEventListener('DOMContentLoaded', initEventListeners);