import './App.css'
import Chatbot from './components/ChatWindow/Chatbot'
import Sidebar from './components/sidebar/Sidebar'

function App() {

  return (
    <div className='app'>
      <Sidebar />
      <Chatbot />
    </div>
  )
}

export default App
