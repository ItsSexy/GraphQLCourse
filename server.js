const express = require('express');
const { graphqlHTTP } = require("express-graphql");
const{
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
}=require('graphql')
const app = express();

const drivers = [
    {id: 1, name: 'Fernando Alonso'},
    {id: 2, name: 'Max Verstappen'},
    {id: 3, name: 'Charles Leclerc'},
];

const races = [
    {id: 1, location: 'Brazil', winnerId: 2},
    {id: 2, location: 'Texas', winnerId: 3},
    {id: 3, location: 'Spa-Francorchamps', winnerId: 2},
    {id: 4, location: 'Mexico', winnerId: 2},
    {id: 5, location: 'Bahrain', winnerId: 1},
    {id: 6, location: 'Austria', winnerId: 3},
    {id: 7, location: 'Zandvoort', winnerId: 2},
];

const DriverType = new GraphQLObjectType({
    name: 'Driver',
    description: 'This represents a driver',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        raceWins:{
            type: new GraphQLList(RaceType),
            description: 'This represents a race won by the driver',
            resolve: (driver) => {
                return races.filter(race => race.winnerId === driver.id)
            }
        }
    })
})

const RaceType = new GraphQLObjectType({
    name: 'Race',
    description: 'This represents a race ',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        location: {type: GraphQLNonNull(GraphQLString)},
        winnerId: {type: GraphQLNonNull(GraphQLInt)},
        driver: {
            type: DriverType,
            resolve: (race) => {
                return drivers.find(driver => driver.id === race.winnerId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name:'Query',
    description:'Root Query',
    fields: () => ({
        races:{
            type: new GraphQLList(RaceType),
            description:'List of Races',
            resolve: () => races
        },
        race:{
            type: RaceType,
            description:'A Race',
            args:{
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => races.find(race => race.id === args.id)
        },
        drivers:{
            type: new GraphQLList(DriverType),
            description:'List of Drivers',
            resolve: () => drivers
        },
        driver:{
            type: DriverType,
            description:'A Driver',
            args:{
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => drivers.find(driver => driver.id === args.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addRace: {
            type: RaceType,
            description: 'Add a race',
            args: {
                location: { type: GraphQLNonNull(GraphQLString) },
                winnerId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) => {
                const race = {id: races.length + 1, location: args.location, winnerId: args.winnerId};
                races.push(race);
                return race;
            }
        },
        addDriver: {
            type: DriverType,
            description: 'Add a driver',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const driver = {id: drivers.length + 1, name: args.name};
                drivers.push(driver);
                return driver;
            }
        },
        removeDriver: {
            type: DriverType,
            description: 'Remove a driver',
            args: {
                id: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const driverIndex = drivers.findIndex(driver => driver.id === args.id);
                if (driverIndex === -1) {
                    throw new Error('Driver not found');
                }

                const [removedDriver] = drivers.splice(driverIndex, 1);
                
                return removedDriver;
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});