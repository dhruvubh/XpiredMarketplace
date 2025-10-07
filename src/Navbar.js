import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Navbar = () => {
  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand href="/">
          🌱 ZeroWaste Exchange
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin">
              <Nav.Link>Admin</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/nonprofit">
              <Nav.Link>Nonprofit</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/customer">
              <Nav.Link>Customer</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/store">
              <Nav.Link>Store</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/impact">
              <Nav.Link>Impact</Nav.Link>
            </LinkContainer>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
