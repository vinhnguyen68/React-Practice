import MainContent from './MainContent.jsx'
import Header from './Header.jsx'
import {myData, EXAMPLES} from './data.js'
import TabButton from './TabButton.jsx'
import {useState} from 'react';


function App(){
    function resetAll() {
        setselectedTopic(null);
        setChao("Chào bạn");
    }



    const [chao, setChao] = useState(null);
    function nutChao(){
        const gio = new Date().getHours();
        if (gio < 12){
            setChao("Chào buổi sáng");
        }
        else{
            setChao("Chào buổi tối");
        }
    }


    const [selectedTopic, setselectedTopic] = useState(null);
    function handleSelect(selectedButton){
        setselectedTopic(selectedButton);
    }


    return (
        <div onClick={resetAll} style={{ minHeight: "100vh" }}>
        <main>
            <Header/>

            <section id="core-concepts">
            <h2>Khái niệm chính trong React</h2>
            <ul>
                <MainContent {...myData[0]} />
                <MainContent {...myData[1]} />
                <MainContent {...myData[2]} />
                <MainContent {...myData[3]} />
            </ul>
            </section>

            <section id = "examples">
                <h2>Examples</h2>
                <menu>
                    <TabButton onSelect = {() => {handleSelect('components')}}>Components</TabButton>
                    <TabButton onSelect = {() => {handleSelect('jsx')}}>JSX</TabButton>
                    <TabButton onSelect = {() => {handleSelect('props')}}>Props</TabButton>
                    <TabButton onSelect = {() => {handleSelect('state')}}>State</TabButton>
                </menu>
                <div id="tab-content">
                {selectedTopic === null ? (
                    <p>Vui lòng click vào nút</p>
                ) : (
                    <>
                    <h3>{EXAMPLES[selectedTopic].title}</h3>
                    <p>{EXAMPLES[selectedTopic].desc}</p>
                    <pre>
                        <code>{EXAMPLES[selectedTopic].code}</code>
                    </pre>
                    </>
                )}
                </div>
                <section>
                    <menu>
                        <TabButton onSelect = { ()=> {nutChao()}}>Cập nhật lời chào</TabButton>
                    </menu>
                    {chao}
                </section>
               
            </section>
        </main>
        </div>
    )
}

export default App