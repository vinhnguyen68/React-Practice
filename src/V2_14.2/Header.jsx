import logo from '../assets/logo-tuhoc.png'
import "./Header.css"

function Header(){
    return (
        <>
        <header>
            <img src = {logo}/>
            <h1>React Tuhoc.cc</h1>
            <p>
                Học React - Khám phá cách xây dựng ứng dụng linh hoạt, hiện đại, và
                đầy sáng tạo!
            </p>
        </header>
        </>
    )
}

export default Header