import { renderToStringWithData } from '@apollo/react-ssr'
import * as React from 'react'
import DocumentPanel from './document/document-panel'
import styles from './resizepanel.module.css'

class ResizablePanels extends React.Component
{
    eventHnadler = null
    const 

    constructor(props){
       super(props) 

       this.state = {
           isDragging: false,
           panel: [DocumentPanel]
       }
    }
}

componentDidMount = () => {
    window.addEventListener('mousemove', this.resizePanel)
    window.addEventListener('mouseup', this.stopResize)
    window.addEventListener('mouseleave', this.stopResize)
  }

  startResize = (event, index) => {
    this.setState({
      isDragging: true,
      activePanel: index,
      initialPos: event.clientX
    })
  }
  
  stopResize = () => {
    if (this.state.isDragging) {
      console.log(this.state)
      this.setState(({panel, activePanel, delta}) => ({
        isDragging: false,
        panel: {
          ...panel,
          [activePanel]: (panel[activePanel] || 0) - delta,
          [activePanel - 1]: (panel[activePanel - 1] || 0) + delta
        },
        delta: 0,
        activePanel: null
      }))
    }
  }
  
  resizePanel = (event) => {
    if (this.state.isDragging) {
      const delta = event.clientX - this.state.initialPos
      this.setState({
        delta: delta
      })
    }
  }
    
    return (
      <div className={styles.panel-container} onMouseUp={() => this.stopResize()}>
        <div className={styles.panel} style={{width: `calc(100% - ${this.state.panels[1]}px`}}>
          {this.props.children[0]}
        </div>
        {[].concat(...rest.map((child, i) => {
          return [
            <div onMouseDown={(e) => this.startResize(e, i + 1)}
              key={"resizer_" + i}
              style={this.state.activePanel === i+1 ? {left: this.state.delta} : {}}
              className={styles.resizer}></div>,
            <div key={"panel_" + i} className={styles.panel} style={{width: this.state.panel[i + 1]}}>
              {child}
            </div>
          ]
        }))}
      </div>
    )
   
 
  

  export default ResizablePanels