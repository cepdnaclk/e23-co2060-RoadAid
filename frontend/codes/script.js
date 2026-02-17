const vehicles = ["Car", "Van", "Motorbike", "Truck", "Bus", "Three Wheeler", "Hybrid", "Electric"];
const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');

searchInput.addEventListener('input', function() {
  const query = this.value.toLowerCase();
  resultsList.innerHTML = ''; // Clear previous results
  
  // If input is empty, hide the list and stop
  if (query === '') {
    resultsList.style.display = 'none';
    return;
  }

  // Filter the list based on typing
  const matches = vehicles.filter(vehicle => 
    vehicle.toLowerCase().includes(query)
  );

  // Display results
  if (matches.length > 0) {
    matches.forEach(match => {
      const li = document.createElement('li');
      li.textContent = match;
      
      // When a user clicks an item
      li.onclick = () => {
        searchInput.value = match;       // Fill the input
        resultsList.style.display = 'none'; // Hide the list
      };
      
      resultsList.appendChild(li);
    });
    resultsList.style.display = 'block'; // Show the list
  } else {
    resultsList.style.display = 'none'; // Hide if no matches found
  }
});

// Hide list if user clicks somewhere else on the screen
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !resultsList.contains(e.target)) {
    resultsList.style.display = 'none';
  }
});


const locateBtn = document.querySelector('.locate-btn');

locateBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        // Change icon to show it's loading
        locateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                // Here you would normally send this to your backend or fill a form
                alert(`Location Found! \nLat: ${lat} \nLng: ${lng}`);
                locateBtn.innerHTML = '<i class="fa-solid fa-check"></i>'; // Success icon
            },
            (error) => {
                alert("Unable to retrieve your location.");
                locateBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>'; // Reset icon
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});