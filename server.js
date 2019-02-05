const express = require('express');
const mongoose =require('mongoose');
const jwt =require('jsonwebtoken');
const bodyParser =require('body-parser');
const path =require('path');
const cors = require('cors');
require('dotenv').config({ path: 'variables.env'});
const Recipe =require('./models/Recipe');
const User = require('./models/User');

// bring in grapql express middle ware
const { graphiqlExpress, graphqlExpress} = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');



const { typeDefs } =require('./schema');
const { resolvers } =require('./resolvers');
//create schema
const schema =makeExecutableSchema({
    typeDefs,
    resolvers
});


//connect to database
mongoose
    .connect(process.env.MONGO_URI)
    .then(() =>console.log('DB connected'))
    .catch(err => console.error(err));



//Innitialize app
const app = express();

const corsOptions={
    origin: 'http://localhost:3000',
    credentials: true
}
app.use(cors(corsOptions));

//set up JWT authentication middle ware

app.use( async (req, res, next)=>{
    const token =req.headers['authorization'];
    if (token !=='null'){
        try{
            const currentUser =await jwt.verify(token, process.env.SECRET);
            req.currentUser=currentUser;
        }catch(err){
            console.error(err);
        }
    }
    //console.log(token);
    next();

});

// //create graphiql  application
// app.use('/graphiql', graphiqlExpress({ 
//    endpointURL: '/graphql'}))

//connect schema with graphQL
app.use('/graphql', 
    bodyParser.json(),
    graphqlExpress(({ currentUser })=> ({ 
        schema,
        context: {
            Recipe,
            User,
            currentUser
        }
    }))
);

if (process.env.NODE_ENV ==='production'){
    app.use(express.static('client/build'));
    
    app.get('*',(req, res)=>{
        res.sentFile(path.resolve(__dirname, 'client', 'build','index.html'));
    })
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log('Listening');
});