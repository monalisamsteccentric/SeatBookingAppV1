import React from 'react'
import SeatPicker from './Components/SeatPicker'

const App = () => {
  return (
    <div style={ { height:'99vh', 
                   width: '99vw',
                   display: 'flex',
                   justifyContent: 'center',
                   alignItems: 'center'} }>
    <SeatPicker/>
    </div>
  )
}

export default App