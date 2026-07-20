const express = require('express');
const router = express.Router();

// Centralized Branch Configuration Database / Store
const BRANCHES_DATA = [
  {
    id: 'branch-1',
    name: 'Branch 1 - Petbasheerabad',
    code: 'B1',
    area: 'Petbasheerabad',
    address: 'Survey No. 25/1, Opp. Cine Planet, Beside PSR Convention, Petbasheerabad, Hyderabad - 500067',
    phone: '+91 99494 79765',
    email: 'accounts@auto4m.in',
    coordinates: {
      latitude: 17.5278,
      longitude: 78.4852
    },
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=17.5278,78.4852'
  },
  {
    id: 'branch-2',
    name: 'Branch 2 - Gundlapochampally',
    code: 'B2',
    area: 'Gundlapochampally',
    address: 'Survey No. 48/5, Near Anthem Villas, Gundlapochampally Village & Municipality, NH-44, Medchal-Malkajgiri - 500014',
    phone: '+91 99494 79765',
    email: 'accounts@auto4m.in',
    coordinates: {
      latitude: 17.5764,
      longitude: 78.4812
    },
    googleMapsUrl: 'https://maps.app.goo.gl/67ighFJZMzyM2yi19?g_st=iw'
  }
];

function getBranchDirectionsUrl(branch) {
  if (branch && branch.googleMapsUrl) {
    return branch.googleMapsUrl;
  }
  if (branch && branch.coordinates && branch.coordinates.latitude && branch.coordinates.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates.latitude},${branch.coordinates.longitude}`;
  }
  return 'https://www.google.com/maps';
}

// GET /api/branches - Public list of workshop branch locations and navigation URLs
router.get('/', (req, res) => {
  try {
    const formattedBranches = BRANCHES_DATA.map(branch => ({
      ...branch,
      directionsUrl: getBranchDirectionsUrl(branch)
    }));
    res.json(formattedBranches);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ error: 'Failed to retrieve branch locations' });
  }
});

// GET /api/branches/:id - Get single branch details by ID
router.get('/:id', (req, res) => {
  try {
    const branch = BRANCHES_DATA.find(b => b.id === req.params.id || b.code.toLowerCase() === req.params.id.toLowerCase());
    if (!branch) {
      return res.status(404).json({ error: 'Branch location not found' });
    }
    res.json({
      ...branch,
      directionsUrl: getBranchDirectionsUrl(branch)
    });
  } catch (err) {
    console.error('Error fetching branch details:', err);
    res.status(500).json({ error: 'Failed to retrieve branch details' });
  }
});

module.exports = router;
