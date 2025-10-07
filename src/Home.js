import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';

const Home = () => {
  const [impactStats, setImpactStats] = useState({
    total_lbs_saved: 0,
    total_co2e_avoided: 0,
    total_revenue_recovered: 0,
    total_items_rescued: 0
  });

  useEffect(() => {
    fetchImpactStats();
  }, []);

  const fetchImpactStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/impact');
      setImpactStats(response.data);
    } catch (error) {
      console.error('Error fetching impact stats:', error);
    }
  };

  return (
    <div>
      <div className="hero-section">
        <Container>
          <h1 className="hero-title">🌱 ZeroWaste Exchange</h1>
          <p className="hero-subtitle">
            Rescuing food, saving the planet, one meal at a time
          </p>
        </Container>
      </div>

      <Container>
        <Row className="mb-5">
          <Col md={3}>
            <Card className="stats-card">
              <div className="stat-number">{impactStats.total_lbs_saved.toFixed(1)}</div>
              <div className="stat-label">Lbs Saved</div>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card">
              <div className="stat-number">{impactStats.total_co2e_avoided.toFixed(1)}</div>
              <div className="stat-label">kg CO₂e Avoided</div>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card">
              <div className="stat-number">${impactStats.total_revenue_recovered.toFixed(2)}</div>
              <div className="stat-label">Revenue Recovered</div>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card">
              <div className="stat-number">{impactStats.total_items_rescued}</div>
              <div className="stat-label">Items Rescued</div>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>🛒 For Shoppers</Card.Title>
                <Card.Text>
                  Discover amazing deals on quality food that's about to expire. 
                  Save money while saving the planet!
                </Card.Text>
                <Button variant="success" href="/customer" className="btn-rescue">
                  Browse Deals
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>🏢 For Nonprofits</Card.Title>
                <Card.Text>
                  Get priority access to food donations for your community programs. 
                  Help feed those in need while reducing waste.
                </Card.Text>
                <Button variant="primary" href="/nonprofit">
                  Access Portal
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>🏪 For Stores</Card.Title>
                <Card.Text>
                  Manage pickups and track your impact. Turn waste into revenue 
                  while supporting your community.
                </Card.Text>
                <Button variant="warning" href="/store">
                  Store Console
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>📊 For Admins</Card.Title>
                <Card.Text>
                  Monitor the entire system, create batches, and track 
                  comprehensive impact metrics.
                </Card.Text>
                <Button variant="danger" href="/admin">
                  Admin Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
