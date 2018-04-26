import React, { Component } from 'react'
import Loading from 'Shared/components/Loading'

class App extends Component {
  state = {
    Game: null
  }
  mounted = false

  componentWillMount() {
    this.mounted = true
    this.loadGame()
  }

  componentWillUnmount() { this.mounted = false }

  loadGame = async () => {
    const Game = await (
      await import('Shared/components/Game')
    ).default
    setTimeout(() => {
      if (this.mounted) this.setState({ Game })
    }, 0)
  }

  render() {
    const { Game } = this.state
    if ( !Game ) return <Loading />
    return <Game />
  }
}

export default App
