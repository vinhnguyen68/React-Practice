import './App.css'
import logo from '../assets/logo-tuhoc.png'
import pic1 from '../assets/pic1.png'
import pic2 from '../assets/pic2.png'
import pic3 from '../assets/pic3.png'
import pic4 from '../assets/pic4.png'
import PropTypes from 'prop-types'


function Header(){
  return(
    <>
      <header>
        <img src = {logo}/>
        <h1>Ract Tuhoc.cc</h1>
        <p>Học React - Khám phá cách xây dựng ứng dụng</p>
      </header>
    </>
  )
}

function MainContent(props){
  return (
    <>
    <li>
      <img src = {props.image}/> 
      <h2>{props.title}</h2>
      <p>{props.desc}</p>
    </li>
    </>
  )
}

MainContent.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string,
}

function App() {
  return (
    <>
    <Header/>
    <main>
      <section id = "core-concepts">
        <h2>Khái niệm chính trong React</h2>
        <ul>
          <MainContent
            image = {pic1}
            title = "Components"
            desc = "Khối xây dựng giao diện cơ bản - kết hợp nhiều thành phần để tạo nên ứng dụng"
          />

          <MainContent
            image = {pic2}
            title = "JSX"
            desc = "Kết hợp HTML và JS để tạo giao diện"
          />

          <MainContent
            image = {pic3}
            title = "Props"
            desc = "Truyền dữ liệu vào thành phần để làm nó linh hoạt"
          />

          <MainContent
            image = {pic4}
            title = "State"
            desc = "Dữ liệu đươc React quản lý"
          />
        </ul>
      </section>
    </main>
    </>
  )
}

export default App
