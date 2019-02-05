import React,{ Component } from 'react';

import { Query, Mutation } from 'react-apollo';
import { Link } from 'react-router-dom';
import {GET_USER_RECIPES,DELETE_USER_RECIPE, GET_ALL_RECIPES, GET_CURRENT_USER, UPDATE_USER_RECIPE} from '../../queries';
import Spinner from '../Spinner';



class UserRecipes extends Component {

    state={
        _id:'',
        name:'',
        imageUrl:'',
        instructions:'',
        category: '',
        description: '',
        modal:false
    };
    handleDelete = deleteUserRecipe =>{
        const confirmDelete= window.confirm('Are you sure you want to delete this recipe?');
        if(confirmDelete){
            deleteUserRecipe().then(({ data})=>{
                //console.log(data);
            })
        }
    }
    handleSubmit= (event, updateUserRecipe)=>{
        event.preventDefault();
        updateUserRecipe().then(({data})=>{
            //console.log(data);
            this.closeModal();
        })

    }
    loadRecipe=(recipe)=>{
        this.setState({ ...recipe, modal:true})

    }

    closeModal =()=>{
        this.setState({ modal:false})
    }

    handleChange= event =>{
        const {name, value} =event.target;
        this.setState({
            [name]:value
        });
    }
    
    render(){
        const {username} =this.props;
        const { modal} = this.state;
    return(
    <Query query={GET_USER_RECIPES} variables={{ username }}>
        {({ data, loading, error})=>{
            if(loading) return <Spinner />
            if(error) return <div>Error</div>
            //console.log(data);
            return(
                <ul>
                    {modal && <EditRecipeModal 
                            handleSubmit={this.handleSubmit}
                            recipe={this.state}
                            closeModel={this.closeModal} 
                            handleChange={this.handleChange}/>}
                <h3>Your Recipes</h3>
                {!data.getUserRecipes.length && <p>You have not add any recipes yet</p>}
                {data.getUserRecipes.map(recipe => (
                    <li key={recipe._id}>
                        <Link to= {`/recipe/${recipe._id}`}>
                        <p>{recipe.name}</p></Link>
                        <p style={{ marginBottom: '0'}}>Likes: {recipe.likes}</p>
                        <Mutation 
                            mutation={DELETE_USER_RECIPE} 
                            variables={{ _id: recipe._id}}
                            refetchQueries={()=>[
                                { query: GET_ALL_RECIPES},
                                { query: GET_CURRENT_USER}
                            ]}
                            update={(cache,{data:{ deleteUserRecipe}})=>{
                                const { getUserRecipes }=cache.readQuery({
                                    query: GET_USER_RECIPES,
                                    variables: {username}
                                });

                                cache.writeQuery({
                                    query: GET_USER_RECIPES,
                                    variables: { username},
                                    data:{
                                        getUserRecipes: getUserRecipes.filter(
                                            recipe=>recipe._id !== deleteUserRecipe._id)
                                    }
                                })
                            }}
                        >
                            {(deleteUserRecipe, attrs={})=>{
                                
                                return(
                                    <div>
                                        <button className="button-primary" 
                                        onClick={()=> this.loadRecipe(recipe)}

                                        >Update</button>
                                    <p 
                                        onClick={()=> this.handleDelete(deleteUserRecipe)}
                                        className="delete-button">
                                        {attrs.loading ? "deleting..." : "X"}
                                    </p>
                                    </div>
                                )
                                
                            }}
                        
                        </Mutation>
                    </li>
                ))}
                </ul>
            )
        }}
    </Query>
)

}
}

const EditRecipeModal =({handleSubmit,recipe,handleChange,closeModal})=>(
    <Mutation mutation={UPDATE_USER_RECIPE}
        variables={{_id:recipe._id,
            name:recipe.name,
            imageUrl:recipe.imageUrl,
            category:recipe.category,
            description:recipe.description}}
    
    >
        {updateUserRecipe =>(
        <div className="modal modal-open">
            <div className="modal-inner">
                <div className="modal-content">
                    <form 
                        onSubmit={(event)=>handleSubmit(event,updateUserRecipe)}
                        className="modal-content-inner">
                        <h4>Edit Recipe</h4>
                        <label htmlFor="name">Recipe Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            onChange={handleChange} 
                            value={recipe.name}
                        />
                        <label htmlFor="imageUrl">Recipe Image</label>
                        <input 
                            type="text" 
                            name="imageUrl" 
                            onChange={handleChange} 
                            value={recipe.imageUrl}
                            
                        />
                        <label htmlFor="category">Category of Recipe</label>
                        <select name="category" onChange={handleChange} value={recipe.category}>
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snack">Snack</option>
                        
                        </select>
                        <label htmlFor="description">Recipe Description</label>
                        <input 
                            type="text" 
                            name="description" 
                            onChange={handleChange} 
                            value={recipe.description}
                            
                        />
                    <hr />
                    <div className="modal-buttons">
                        <button type="submit" className="button-primary">
                        Update
                        </button>
                        <button onClick={closeModal}>
                        Cancel
                        </button>
                    </div>
                    </form>

                </div>

            </div>

        </div>
    )}
    </Mutation>
)

export default UserRecipes;