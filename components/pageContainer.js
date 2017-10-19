import React from 'react'
import Head from 'next/head'

export default class PageContainer extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      text: "Hello from state"
    }
  }

  render(){
    return (
      <div style={{width: '100vw', height: '100vh', textAlign: 'center'}}>
        <Head>
          <link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.2/semantic.min.css'/>
        </Head>
        {this.props.children}
      </div>
    )
  }
}
