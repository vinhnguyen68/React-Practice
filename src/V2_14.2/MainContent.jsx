import PropTypes from "prop-types"; 

{/*Cach 1 - dung prop*/}
{/*
function MainContent(props){
    return (
        <li>
            <img src = {props.img}/>
            <h1>{props.title}</h1>
            <p>{props.desc}</p>
        </li>
    )
}
*/}

function MainContent({image, title, desc}){
    return(
        <li>
            <img src = {image}/>
            <h1>{title}</h1>
            <p>{desc}</p>
        </li>
    )
}

MainContent.propTypes = {
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string,
}

export default MainContent;