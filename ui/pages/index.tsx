import React, { useEffect } from 'react'
import Router from 'next/router'

function redirectHomeToDashboard() {
    const { pathname } = Router

    if (pathname == '/') {
        Router.push('/dashboard')
    }
}

const Home = () => {
    useEffect(redirectHomeToDashboard)
    
    // this won't be rendered, so just return an empty page
    return <></>
}

export default Home
