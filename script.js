// Clé localStorage
const STORAGE_KEY = 'residencesData';

// Données par défaut
let defaultResidences = [
  {title: "Résidence Abidjan", location: "Abidjan", price: 50000, available: true, image: "images/residence1.jpg", phone: "0700000001"},
  {title: "Villa Cocody", location: "Cocody", price: 120000, available: false, image: "images/residence2.jpg", phone: "0700000002"},
  {title: "Appartement Marcory", location: "Marcory", price: 75000, available: true, image: "images/residence3.jpg", phone: "0700000003"},
];

// Récupérer résidences depuis localStorage
let residences = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultResidences;

// Sauvegarde
function saveResidences(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Variable pour la réservation
let selectedResidence = null;

// Render
function renderResidences(role) {
  const container = document.getElementById('residences-container');
  if (!container) return;
  container.innerHTML = '';

  const city = document.getElementById('cityFilter')?.value || '';
  const priceMax = Number(document.getElementById('priceFilter')?.value || Infinity);

  residences
    .filter(r => (!city || r.location === city) && r.price <= priceMax)
    .forEach(res => {
      const card = document.createElement('div');
      card.className = 'card';

      const img = document.createElement('img');
      img.src = res.image || 'images/default.jpg';
      card.appendChild(img);

      const cardContent = document.createElement('div');
      cardContent.innerHTML = `
        <div class="card-title">${res.title}</div>
        <div class="card-info">${res.location}</div>
        <div class="card-info">Prix: ${res.price} XOF</div>
        <div class="card-info">Statut: <span class="${res.available ? 'available' : 'unavailable'}">${res.available ? 'Disponible' : 'Indisponible'}</span></div>
        ${role === 'client' ? `<div class="card-info">Contact vendeur: ${res.phone || 'Non renseigné'}</div>` : ''}
      `;
      card.appendChild(cardContent);

      const footer = document.createElement('div');
      footer.className = 'card-footer';

      if (role === 'vendeur') {
        // Toggle disponibilité
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = res.available;
        toggle.className = 'switch';
        toggle.addEventListener('change', () => {
          res.available = toggle.checked;
          saveResidences(residences);
          renderResidences(role);
        });
        footer.appendChild(toggle);

        // Bouton supprimer
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.addEventListener('click', () => {
          if(confirm(`Supprimer ${res.title} ?`)){
            residences = residences.filter(r => r !== res);
            saveResidences(residences);
            renderResidences(role);
          }
        });
        footer.appendChild(deleteBtn);

      } else if (role === 'client') {
        const btn = document.createElement('button');
        btn.textContent = 'Réserver';
        btn.disabled = !res.available;
        btn.addEventListener('click', () => openPopup(res));
        footer.appendChild(btn);
      }

      card.appendChild(footer);
      container.appendChild(card);
    });
}

// Filtres
function applyFilters() {
  const role = localStorage.getItem('role') || 'client';
  renderResidences(role);
}

// Popup réservation
function openPopup(res) {
  selectedResidence = res;
  const popup = document.getElementById('reservationPopup');
  if (popup) {
    document.getElementById('popupTitle').textContent = res.title;
    document.getElementById('sellerPhone').textContent = "Contact vendeur: " + (res.phone || "Non renseigné");
    popup.style.display = 'flex';
  }
}

function closePopup() {
  const popup = document.getElementById('reservationPopup');
  if (popup) popup.style.display = 'none';
}

function confirmReservation() {
  const name = document.getElementById('clientName').value;
  const phone = document.getElementById('clientPhone').value;
  if (!name || !phone) return alert('Veuillez remplir vos informations.');
  alert(`Réservation confirmée pour ${selectedResidence.title}\nClient: ${name}, Tel: ${phone}\nContacter le vendeur: ${selectedResidence.phone || "Non renseigné"}`);
  closePopup();
}

// Popup ajout résidence
function openAddPopup() {
  document.getElementById('addResidencePopup').style.display = 'flex';
}
function closeAddPopup() {
  document.getElementById('addResidencePopup').style.display = 'none';
}
function addResidence() {
  const title = document.getElementById('newTitle').value;
  const location = document.getElementById('newLocation').value;
  const price = Number(document.getElementById('newPrice').value);
  const phone = document.getElementById('newPhone').value || 'Non renseigné';

  const fileInput = document.getElementById('newImage'); // input type file
  const file = fileInput.files[0];

  if (!title || !location || !price) return alert('Veuillez remplir tous les champs.');

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const image = e.target.result;
      const newRes = { title, location, price, available: true, image, phone };
      residences.push(newRes);
      saveResidences(residences);
      closeAddPopup();
      renderResidences('vendeur');
    };
    reader.readAsDataURL(file); // convertir l'image en base64
  } else {
    const image = 'images/default.jpg';
    const newRes = { title, location, price, available: true, image, phone };
    residences.push(newRes);
    saveResidences(residences);
    closeAddPopup();
    renderResidences('vendeur');
  }
}

// Switch client <-> vendeur
function setupRoleSwitch() {
  const switchToClient = document.getElementById('switchClient');
  if (switchToClient) {
    switchToClient.addEventListener('click', () => {
      localStorage.setItem('role', 'client');
      window.location.href = 'client.html';
    });
  }

  const switchToVendeur = document.getElementById('switchVendeur');
  if (switchToVendeur) {
    switchToVendeur.addEventListener('click', () => {
      localStorage.setItem('role', 'vendeur');
      window.location.href = 'vendeur.html';
    });
  }
}

// Initialisation
const role = localStorage.getItem('role') || 'client';
renderResidences(role);
setupRoleSwitch();
