import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Badge } from 'react-bootstrap';
import axios from 'axios';

const StoreConsole = () => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [reservation, setReservation] = useState(null);
  const [pickupResult, setPickupResult] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      // Get all reservations for store view
      const response = await axios.get('http://localhost:8000/reservations?user_id=0'); // All reservations
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const lookupReservation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, this would be a proper lookup endpoint
      const response = await axios.get(`http://localhost:8000/reservations?user_id=0`);
      const found = response.data.find(r => r.confirmation_code === confirmationCode);
      
      if (found) {
        setReservation(found);
        setPickupResult(null);
      } else {
        setReservation(null);
        setPickupResult({ success: false, message: 'Reservation not found' });
      }
    } catch (error) {
      setPickupResult({ success: false, message: 'Error looking up reservation' });
    } finally {
      setLoading(false);
    }
  };

  const confirmPickup = async () => {
    if (!reservation) return;
    
    setLoading(true);
    try {
      const pickupData = {
        reservation_id: reservation.id,
        staff_id: 5 // Store staff user
      };
      
      await axios.post('http://localhost:8000/pickup/confirm', pickupData);
      setPickupResult({ 
        success: true, 
        message: `Pickup confirmed for ${reservation.qty_reserved} units` 
      });
      setReservation(null);
      setConfirmationCode('');
      fetchReservations();
    } catch (error) {
      setPickupResult({ 
        success: false, 
        message: 'Error confirming pickup' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNoShows = async () => {
    try {
      await axios.post('http://localhost:8000/pickup/relist');
      fetchReservations();
    } catch (error) {
      console.error('Error handling no-shows:', error);
    }
  };

  const getPickupTime = (pickupStart) => {
    const start = new Date(pickupStart);
    return start.toLocaleString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'reserved':
        return <Badge bg="warning">Reserved</Badge>;
      case 'picked_up':
        return <Badge bg="success">Picked Up</Badge>;
      case 'no_show':
        return <Badge bg="danger">No Show</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>🏪 Store Console</h2>
          <p className="text-muted">Manage pickups and track your impact</p>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>📱 Scan Pickup Code</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={lookupReservation}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmation Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Looking up...' : 'Lookup Reservation'}
                </Button>
              </Form>

              {pickupResult && (
                <Alert variant={pickupResult.success ? 'success' : 'danger'} className="mt-3">
                  {pickupResult.message}
                </Alert>
              )}

              {reservation && (
                <div className="mt-3 p-3 border rounded bg-light">
                  <h6>Reservation Details</h6>
                  <p><strong>Code:</strong> {reservation.confirmation_code}</p>
                  <p><strong>Quantity:</strong> {reservation.qty_reserved} units</p>
                  <p><strong>Pickup Window:</strong> {getPickupTime(reservation.pickup_start_ts)}</p>
                  <p><strong>Status:</strong> {getStatusBadge(reservation.status)}</p>
                  
                  {reservation.status === 'reserved' && (
                    <Button 
                      onClick={confirmPickup} 
                      variant="success" 
                      className="mt-2"
                      disabled={loading}
                    >
                      ✅ Confirm Pickup
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>⚡ Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <p>Handle no-shows and relist items for public sale.</p>
              <Button onClick={handleNoShows} variant="warning" className="mb-3">
                🔄 Handle No-Shows
              </Button>
              
              <Alert variant="info">
                <strong>No-Show Process:</strong><br/>
                • Items get auto-relisted with +10% discount<br/>
                • Available to public customers<br/>
                • Helps maximize food rescue
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>📊 All Reservations</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Quantity</th>
                    <th>Pickup Time</th>
                    <th>Status</th>
                    <th>User Type</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(reservation => (
                    <tr key={reservation.id}>
                      <td>
                        <span className="pickup-code">{reservation.confirmation_code}</span>
                      </td>
                      <td>{reservation.qty_reserved}</td>
                      <td>{getPickupTime(reservation.pickup_start_ts)}</td>
                      <td>{getStatusBadge(reservation.status)}</td>
                      <td>
                        {reservation.user_id === 2 ? (
                          <Badge bg="primary">Nonprofit</Badge>
                        ) : (
                          <Badge bg="success">Customer</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>ℹ️ Store Instructions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <h6>1. 📱 Scan Code</h6>
                  <p className="small">Customer shows 6-digit code, you enter it here to verify.</p>
                </Col>
                <Col md={4}>
                  <h6>2. ✅ Confirm Pickup</h6>
                  <p className="small">Mark items as picked up to update inventory and impact.</p>
                </Col>
                <Col md={4}>
                  <h6>3. 🔄 Handle No-Shows</h6>
                  <p className="small">Auto-relist expired reservations with deeper discounts.</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StoreConsole;
