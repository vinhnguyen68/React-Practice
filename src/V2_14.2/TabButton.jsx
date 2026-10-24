function TabButton({children, onSelect}){
    {/*children is special word */}
    function handleClick(event) {
        event.stopPropagation();
        onSelect();
    }
    return(
        <li>
            <button onClick = {handleClick}>{children}</button>
        </li>
    )
}

export default TabButton