import React, { Fragment} from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch , Redirect } from "react-router-dom";
import './index.css';
import App from './components/App';
import Navbar from './components/Navbar';
import Signin from './components/Auth/Signin';
import Signup from './components/Auth/Signup';
import Search from './components/Recipe/Search';
import withSession from './components/withSession';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import AddRecipe from './components/Recipe/AddRecipe';
import Profile from './components/Profile/Profile';
import RecipePage from './components/Recipe/RecipePage';


const client = new ApolloClient({

    uri: "https://aor-recipe.herokuapp.com/graphql",
    //uri: 'http://localhost:4000/graphql',
    fetchOptions:{
        credentials: 'include'
    },
    request: operation =>{
        const token =localStorage.getItem('token');
        operation.setContext({
            headers:{
                authorization: token
            }
        })
    },
    onError: ({ networkError }) =>{
        if(networkError) {
            console.log('Network Error',networkError);
            // if(networkError.statusCode === 401){
            //     localStorage.removeItem('token');
            // }
        }
    }
});

const Root = ({refetch, session}) => (
    <Router>
        <Fragment>
        <Navbar session={session}/>
        <Switch>
            <Route path="/" exact component={App} />
            <Route path="/search" render ={()=> <Search refetch={refetch} />}/>
            <Route path="/signin" render ={()=> <Signin refetch={refetch} />}/>
            <Route path="/signup" render ={()=> <Signup refetch={refetch} />} />
            <Route path="/profile"  render ={()=> <Profile session={session}/>}/>
            <Route path="/recipe/add" render ={()=> <AddRecipe session={session}/>} />
            <Route path="/recipe/:_id" component={ RecipePage } />

            <Redirect to="/"  />
        </Switch>
        </Fragment>
    </Router>
)


const RootWithSession =withSession(Root);
ReactDOM.render(
    <ApolloProvider client={client}>

        <RootWithSession />
    </ApolloProvider>, 
    document.getElementById('root')
);


