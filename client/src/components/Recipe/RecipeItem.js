import React from 'react';
import { Link }  from 'react-router-dom';
const RecipeItem  =({ _id, name, category})=>(
    <li >
       <Link to={`/recipe/${_id}`}><h4>{name}</h4>
        <p><strong>{category}</strong></p>
        </Link> 
    </li>

)

export default RecipeItem;