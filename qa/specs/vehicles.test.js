// test/vehicles.test.js
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../server");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Vehicles GraphQL API", () => {

    it("should return a list of vehicles", async () => {
        const query = `
        query {
            vehicles {
            id
            category
            make
            model
            year
            type
            colors
            fuelTypes
            }
        }
        `;

        const res = await graphqlRequest(query);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        const vehicles = res.body.data.vehicles;

        expect(vehicles).to.be.an("array");
        if (vehicles.length > 0) {
        expect(vehicles[0]).to.have.property("id");
        expect(vehicles[0]).to.have.property("make");
        }
    });

    it("should create a new vehicle", async () => {
        const mutation = `
        mutation AddVehicle($input: VehicleInput!) {
            addVehicle(input: $input) {
            id
            category
            make
            model
            year
            type
            colors
            fuelTypes
            }
        }
        `;

        const variables = {
        input: {
            category: "car",
            make: "Subaru",
            model: "Outback",
            year: "2024",
            type: "Wagon",
            colors: ["Blue", "White"],
            fuelTypes: ["Gas"]
        }
        };

        const res = await graphqlRequest(mutation, variables);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("data");
        const newVehicle = res.body.data.addVehicle;

        expect(newVehicle).to.include({
        category: "car",
        make: "Subaru",
        model: "Outback",
        year: "2024",
        type: "Wagon"
        });
        expect(newVehicle.colors).to.include("Blue");
        expect(newVehicle.fuelTypes).to.include("Gas");
    });

    it("should fetch a vehicle by id", async () => {
        const query = `
        query GetVehicle($id: ID!) {
            vehicle(id: $id) {
            id
            make
            model
            category
            }
        }
        `;

        const res = await graphqlRequest(query, { id: 1 });
        expect(res).to.have.status(200);

        const vehicle = res.body.data.vehicle;
        expect(vehicle).to.not.be.null;
        expect(vehicle.id).to.equal('1');
        expect(vehicle.make).to.equal("Toyota");
    });

    it("should update an existing vehicle", async () => {
        const mutation = `
        mutation UpdateVehicle($id: ID!, $input: VehicleInput!) {
            updateVehicle(id: $id, input: $input) {
            id
            make
            model
            colors
            fuelTypes
            }
        }
        `;

        const car = {
        id: 1,
        input: {
            category: "car",
            make: "Subaru",
            model: "Outback XT",
            year: "2024",
            type: "Wagon",
            colors: ["Black", "Red"],
            fuelTypes: ["Hybrid"]
        }
        };

        const res = await graphqlRequest(mutation, car);
        expect(res).to.have.status(200);
        const updatedCar = res.body.data.updateVehicle;

        expect(updatedCar).to.not.be.null;
        expect(updatedCar.id).to.equal('1');
        expect(updatedCar.model).to.equal("Outback XT");
        expect(updatedCar.colors).to.deep.equal(["Black", "Red"]);
        expect(updatedCar.fuelTypes).to.deep.equal(["Hybrid"]);
    });

    it("should delete a vehicle", async () => {
        const mutation = `
        mutation DeleteVehicle($id: ID!) {
            deleteVehicle(id: $id)
        }
        `;

        const res = await graphqlRequest(mutation, { id: 1 });
        expect(res).to.have.status(200);
        expect(res.body.data.deleteVehicle).to.equal(true);

        const query = `
        query GetVehicle($id: ID!) {
            vehicle(id: $id) {
            id
            }
        }
        `;
        const res2 = await graphqlRequest(query, { id: 1 });
        expect(res2).to.have.status(200);
        expect(res2.body.data.vehicle).to.be.null;
    });
});
