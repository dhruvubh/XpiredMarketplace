import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const CustomerApp = () => {
  const [offers, setOffers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
    fetchReservations();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/offers?user_type=public');
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/reservations?user_id=3'); // Customer user
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const reserveOffer = async (offerId, qty) => {
    setLoading(true);
    try {
      const now = new Date();
      const pickupStart = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now
      const pickupEnd = new Date(pickupStart.getTime() + 3 * 60 * 60 * 1000); // 3 hour window
      
      const reservationData = {
        offer_id: offerId,
        user_id: 3, // Customer user
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
          <h2>🛒 Customer App</h2>
          <p className="text-muted">Discover amazing deals on quality food while saving the planet!</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Alert variant="warning">
            <strong>⚡ Flash Deals!</strong> These items are about to expire but still perfectly good. 
            Get them at amazing discounts while helping reduce food waste!
          </Alert>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>🔥 Flash Deals</h5>
            </Card.Header>
            <Card.Body>
              {offers.length === 0 ? (
                <Alert variant="info">
                  No flash deals available at the moment. Check back soon!
                </Alert>
              ) : (
                <Row>
                  {offers.map(offer => (
                    <Col md={6} key={offer.id} className="mb-3">
                      <Card className="offer-card">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6>Fresh Product</h6>
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
                              className="btn-rescue"
                            >
                              🛒 Reserve 1 Unit
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => reserveOffer(offer.id, 2)}
                              disabled={loading}
                            >
                              🛒 Reserve 2 Units
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
              <h5>📱 My Orders</h5>
            </Card.Header>
            <Card.Body>
              {reservations.length === 0 ? (
                <p className="text-muted">No active orders</p>
              ) : (
                <div>
                  {reservations.map(reservation => (
                    <div key={reservation.id} className="mb-3 p-2 border rounded">
                      <div className="d-flex justify-content-between">
                        <strong>Order #{reservation.id}</strong>
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
              <h5>🌱 Why This Matters</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <h6>💰 Save Money</h6>
                  <p className="small">Get quality food at amazing discounts - up to 60% off!</p>
                </Col>
                <Col md={4}>
                  <h6>🌍 Save the Planet</h6>
                  <p className="small">Help reduce food waste and CO₂ emissions with every purchase.</p>
                </Col>
                <Col md={4}>
                  <h6>🤝 Help Community</h6>
                  <p className="small">Support local nonprofits by reducing food waste in your area.</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerApp;
