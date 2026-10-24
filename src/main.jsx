import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App_V1 from './V1_14.1/App.jsx'
//import App_V2 from './V2_14.2/App.jsx'
//import App_V3 from './V3_EX3/App.jsx'
//import App_V4 from './V4_14.15/App.jsx'
//import Template from './Template/App.jsx'
import Template_Practice from './Template_Practice/App.jsx'
//import {myVar} from "./components/name.jsx";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Template_Practice/>
  </StrictMode>,
)
