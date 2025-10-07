import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const NonprofitPortal = () => {
  const [offers, setOffers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
    fetchReservations();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/offers?user_type=nonprofit');
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/reservations?user_id=2'); // RU Pantry user
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const reserveOffer = async (offerId, qty) => {
    setLoading(true);
    try {
      const now = new Date();
      const pickupStart = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      const pickupEnd = new Date(pickupStart.getTime() + 4 * 60 * 60 * 1000); // 4 hour window
      
      const reservationData = {
        offer_id: offerId,
        user_id: 2, // RU Pantry user
        qty_reserved: qty,
        pickup_start_ts: pickupStart.toISOString(),
        pickup_end_ts: pickupEnd.toISOString()
      };
      
      await axios.post('http://localhost:8000/reserve', reservationData);
      fetchOffers();
      fetchReservations();
    } catch (error) {
      console.error('Error creating reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilExpiry = (expiryTs) => {
    const now = new Date();
    const expiry = new Date(expiryTs);
    const hours = Math.floor((expiry - now) / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h` : 'Expired';
  };

  const getPickupTime = (pickupStart) => {
    const start = new Date(pickupStart);
    return start.toLocaleString();
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>🏢 Nonprofit Portal - RU Pantry</h2>
          <p className="text-muted">Priority access to food donations for your community programs</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Alert variant="success">
            <strong>🎯 Priority Access!</strong> You get first access to all food donations. 
            Reserve items now to help feed those in need.
          </Alert>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>🍎 Available Donations</h5>
            </Card.Header>
            <Card.Body>
              {offers.length === 0 ? (
                <Alert variant="info">
                  No donations available at the moment. Check back soon!
                </Alert>
              ) : (
                <Row>
                  {offers.map(offer => (
                    <Col md={6} key={offer.id} className="mb-3">
                      <Card className="offer-card">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6>Product Name</h6>
                            <Badge bg="danger" className="discount-badge">
                              {offer.discount_pct}% OFF
                            </Badge>
                          </div>
                          <p className="text-muted small">
                            Expires in: <span className="expiry-warning">
                              {getTimeUntilExpiry(offer.end_ts)}
                            </span>
                          </p>
                          <p className="small">
                            Available: {offer.batch?.qty_available || 0} units
                          </p>
                          <div className="d-grid gap-2">
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => reserveOffer(offer.id, 1)}
                              disabled={loading}
                            >
                              Reserve 1 Unit
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => reserveOffer(offer.id, 5)}
                              disabled={loading}
                            >
                              Reserve 5 Units
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>📋 My Reservations</h5>
            </Card.Header>
            <Card.Body>
              {reservations.length === 0 ? (
                <p className="text-muted">No active reservations</p>
              ) : (
                <div>
                  {reservations.map(reservation => (
                    <div key={reservation.id} className="mb-3 p-2 border rounded">
                      <div className="d-flex justify-content-between">
                        <strong>Reservation #{reservation.id}</strong>
                        <Badge bg={reservation.status === 'reserved' ? 'warning' : 'success'}>
                          {reservation.status}
                        </Badge>
                      </div>
                      <p className="small mb-1">
                        Qty: {reservation.qty_reserved} units
                      </p>
                      <p className="small mb-1">
                        Pickup: {getPickupTime(reservation.pickup_start_ts)}
                      </p>
                      <p className="small text-muted">
                        Code: <span className="pickup-code">{reservation.confirmation_code}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>ℹ️ How It Works</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <h6>1. 🎯 Priority Access</h6>
                  <p className="small">You get first access to all food donations before they go public.</p>
                </Col>
                <Col md={4}>
                  <h6>2. 📱 Reserve Items</h6>
                  <p className="small">Reserve the quantity you need and choose your pickup time.</p>
                </Col>
                <Col md={4}>
                  <h6>3. 🚗 Pickup</h6>
                  <p className="small">Show your confirmation code at the store to collect your items.</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NonprofitPortal;
