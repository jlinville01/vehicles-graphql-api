// server.js
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "test-data.json");

// In-memory data store
let vehicles = [];
let nextId = 1;

// Helper to normalize raw JSON into our Vehicle shape
function normalizeVehicle(raw, category) {
  const colors = Array.isArray(raw.color)
    ? raw.color
    : raw.color
    ? [raw.color]
    : [];

  const fuelRaw = raw["fuel type"]; // key has a space in the JSON
  const fuelTypes = Array.isArray(fuelRaw)
    ? fuelRaw
    : fuelRaw
    ? [fuelRaw]
    : [];

  return {
    id: String(nextId++),
    category,          // "car", "plane", "boat", etc.
    make: raw.make,
    model: raw.model,
    year: raw.year,
    type: raw.type,
    colors,
    fuelTypes,
  };
}

// Load data from test-data.json
function loadVehiclesFromFile() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const json = JSON.parse(raw);

  const root = (json.vehicles && json.vehicles[0]) || {};

  nextId = 1;
  const loaded = [];

  if (Array.isArray(root.cars)) {
    loaded.push(...root.cars.map((v) => normalizeVehicle(v, "car")));
  }
  if (Array.isArray(root.planes)) {
    loaded.push(...root.planes.map((v) => normalizeVehicle(v, "plane")));
  }
  if (Array.isArray(root.boats)) {
    loaded.push(...root.boats.map((v) => normalizeVehicle(v, "boat")));
  }

  vehicles = loaded;
}

// Initial load
loadVehiclesFromFile();

// GraphQL schema
const schema = buildSchema(`
  type Vehicle {
    id: ID!
    category: String!
    make: String!
    model: String!
    year: String!
    type: String!
    colors: [String!]!
    fuelTypes: [String!]!
  }

  input VehicleInput {
    category: String!
    make: String!
    model: String!
    year: String!
    type: String!
    colors: [String!]
    fuelTypes: [String!]
  }

  type Query {
    vehicles: [Vehicle!]!
    vehicle(id: ID!): Vehicle
    vehiclesByCategory(category: String!): [Vehicle!]!
  }

  type Mutation {
    addVehicle(input: VehicleInput!): Vehicle!
    updateVehicle(id: ID!, input: VehicleInput!): Vehicle
    deleteVehicle(id: ID!): Boolean!
    reloadVehiclesFromFile: [Vehicle!]!
  }
`);

// Resolvers
const root = {
  // Queries
  vehicles: () => vehicles,

  vehicle: ({ id }) => vehicles.find((v) => v.id === String(id)) || null,

  vehiclesByCategory: ({ category }) =>
    vehicles.filter(
      (v) => v.category.toLowerCase() === String(category).toLowerCase()
    ),

  // Mutations
  addVehicle: ({ input }) => {
    const newVehicle = {
      id: String(nextId++),
      category: input.category,
      make: input.make,
      model: input.model,
      year: input.year,
      type: input.type,
      colors: input.colors || [],
      fuelTypes: input.fuelTypes || [],
    };

    vehicles.push(newVehicle);
    return newVehicle;
  },

  updateVehicle: ({ id, input }) => {
    const idx = vehicles.findIndex((v) => v.id === String(id));
    if (idx === -1) return null;

    const existing = vehicles[idx];
    const updated = {
      ...existing,
      ...input,
      // Ensure we don't accidentally wipe arrays if omitted
      colors: input.colors ?? existing.colors,
      fuelTypes: input.fuelTypes ?? existing.fuelTypes,
    };

    vehicles[idx] = updated;
    return updated;
  },

  deleteVehicle: ({ id }) => {
    const idx = vehicles.findIndex((v) => v.id === String(id));
    if (idx === -1) return false;
    vehicles.splice(idx, 1);
    return true;
  },

  reloadVehiclesFromFile: () => {
    loadVehiclesFromFile();
    return vehicles;
  },
};

// Express + GraphQL
const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true, // GraphiQL UI at /graphql
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚗 Vehicles GraphQL API running at http://localhost:${PORT}/graphql`);
});
