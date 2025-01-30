const Client = require('../models/client');

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching clients' });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await Client.findById(id);
    if (client.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching client' });
  }
};

// Create a new client
const createClient = async (req, res) => {
  const { name, phone, email, address } = req.body;

  try {
    // Create the client
    await Client.createClient(name, phone, email, address);
    res.status(201).json({ message: 'Client created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating client' });
  }
};

// Update client details
const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address } = req.body;

  try {
    // Check if the client exists
    const client = await Client.findById(id);
    if (client.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update client details
    await Client.updateClient(id, name, phone, email, address);
    res.status(200).json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating client' });
  }
};

// Delete client by ID
const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the client exists
    const client = await Client.findById(id);
    if (client.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete client
    await Client.deleteClient(id);
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting client' });
  }
};

// Associate a unit with a client
const associateUnitWithClient = async (req, res) => {
  const { clientId, unitId } = req.body;

  try {
    await Client.addUnitToClient(clientId, unitId);
    res.status(200).json({ message: 'Unit associated with client successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error associating unit with client' });
  }
};

// Remove a unit from a client
const removeUnitFromClient = async (req, res) => {
  const { clientId, unitId } = req.body;

  try {
    await Client.removeUnitFromClient(clientId, unitId);
    res.status(200).json({ message: 'Unit removed from client successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing unit from client' });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  associateUnitWithClient,
  removeUnitFromClient
};
