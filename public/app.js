const productGrid = document.getElementById('productGrid');
const farmerGrid = document.getElementById('farmerGrid');
const registrationMessage = document.getElementById('registrationMessage');
const verificationResult = document.getElementById('verificationResult');

async function loadDashboardStats() {
  try {
    const response = await fetch('/api/dashboard');
    const data = await response.json();

    document.getElementById('dashboardTotalFarmers').textContent = data.totalFarmers;
    document.getElementById('dashboardVerifiedFarmers').textContent = data.verifiedFarmers;
    document.getElementById('dashboardProductsListed').textContent = data.productsListed;
    document.getElementById('dashboardOrdersToday').textContent = data.ordersToday;
    document.getElementById('dashboardDistrictsCovered').textContent = data.districtsCovered;

    document.getElementById('statFarmers').textContent = data.totalFarmers;
    document.getElementById('statVerified').textContent = data.verifiedFarmers;
    document.getElementById('statProducts').textContent = data.productsListed;
    document.getElementById('statOrders').textContent = data.ordersToday;
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
  }
}

function renderProducts(items) {
  productGrid.innerHTML = items
    .map(
      (item) => `
        <article class="product-card">
          <img src="${item.image}" alt="${item.name}" />
          <div class="product-body">
            <div class="product-top">
              <h3>${item.name}</h3>
              <span class="badge">${item.verified ? 'Verified' : 'New'}</span>
            </div>
            <div class="meta">
              <span>${item.category}</span>
              <span>${item.district}</span>
            </div>
            <div class="meta-row">
              <span>Farmer: ${item.farmer}</span>
              <span>Qty: ${item.quantity}</span>
            </div>
            <div class="price-row">
              <div class="price">${item.price} <small>RWF / ${item.unit}</small></div>
              <button class="secondary-btn">Buy</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function renderFarmers(items) {
  farmerGrid.innerHTML = items
    .map(
      (farmer) => `
        <article class="farmer-card">
          <div class="farmer-body">
            <div class="farmer-top">
              <h3>${farmer.name}</h3>
              <span class="badge">${farmer.status}</span>
            </div>
            <div class="meta-row">
              <span>${farmer.district}</span>
              <span>⭐ ${farmer.rating}</span>
            </div>
            <div class="meta-row">
              <span>RDB: ${farmer.certNumber}</span>
              <span>${farmer.products} products</span>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

async function loadMarketData() {
  try {
    const [productsRes, farmersRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/farmers')
    ]);

    const products = await productsRes.json();
    const farmers = await farmersRes.json();

    renderProducts(products);
    renderFarmers(farmers);
  } catch (error) {
    console.error('Failed to load market data:', error);
  }
}

document.getElementById('farmerSignupForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = {
    farmerName: document.getElementById('farmerName').value,
    district: document.getElementById('district').value,
    certificateNumber: document.getElementById('certificateNumber').value,
    cropType: document.getElementById('cropType').value
  };

  try {
    const response = await fetch('/api/register-farmer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    registrationMessage.textContent = result.message || 'Registration succeeded.';
    registrationMessage.classList.remove('error');

    if (!response.ok) {
      registrationMessage.classList.add('error');
    }

    event.target.reset();
  } catch (error) {
    registrationMessage.textContent = 'Unable to submit registration right now.';
    registrationMessage.classList.add('error');
  }
});

document.getElementById('certificateForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const certNumber = document.getElementById('certLookup').value.trim();

  if (!certNumber) {
    verificationResult.textContent = 'Please enter a certificate number.';
    verificationResult.classList.add('error');
    return;
  }

  try {
    const response = await fetch('/api/verify-certificate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ certNumber })
    });

    const result = await response.json();

    if (result.verified) {
      verificationResult.textContent = `${result.farmer} is verified in ${result.district} with status: ${result.status}.`;
      verificationResult.classList.remove('error');
    } else {
      verificationResult.textContent = result.message || 'Certificate is not approved.';
      verificationResult.classList.add('error');
    }
  } catch (error) {
    verificationResult.textContent = 'Certificate verification failed.';
    verificationResult.classList.add('error');
  }
});

loadDashboardStats();
loadMarketData();
