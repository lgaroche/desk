import React from 'react'
import { render } from 'react-dom'
import { Menu, Icon } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

let COLORS = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue',
  'violet', 'purple', 'pink', 'brown', 'grey', 'black']


class Mainmenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      bg: COLORS[parseInt(13*Math.random())]
    }
  }

  render() {
    return (
      <Menu
        className="mainmenu"
        vertical fixed="left" inverted color={this.state.bg} borderless icon="labeled">
        <Menu.Item as={Link} to="/" name='logo'>
          <p className="logo">Desk</p>
        </Menu.Item>
        <Menu.Item as={Link} to="/find" name='find'>
          <Icon name='search' />
          <span>Find</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/submit" name='submit'>
          <Icon name='send' />
          <span>Submit</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/settings" name='settings'>
          <Icon name='settings' />
          <span>Settings</span>
        </Menu.Item>
        <Menu.Item as={Link} to="/logout" name='logout'>
          <Icon name='power' />
          <span>Logout</span>
        </Menu.Item>
      </Menu>
    )
  }
}

export { Mainmenu }
