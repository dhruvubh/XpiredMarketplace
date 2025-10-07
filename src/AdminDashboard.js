import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert } from 'react-bootstrap';
import axios from 'axios';

const AdminDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [impactStats, setImpactStats] = useState({});
  const [newBatch, setNewBatch] = useState({
    product_id: '',
    qty_total: '',
    qty_available: '',
    expiry_hours: '',
    store_id: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, productsRes, impactRes] = await Promise.all([
        axios.get('http://localhost:8000/batches'),
        axios.get('http://localhost:8000/products'),
        axios.get('http://localhost:8000/impact')
      ]);
      setBatches(batchesRes.data);
      setProducts(productsRes.data);
      setImpactStats(impactRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const createBatch = async (e) => {
    e.preventDefault();
    try {
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + parseInt(newBatch.expiry_hours));
      
      const batchData = {
        ...newBatch,
        qty_total: parseInt(newBatch.qty_total),
        qty_available: parseInt(newBatch.qty_available),
        product_id: parseInt(newBatch.product_id),
        expiry_ts: expiryTime.toISOString()
      };
      
      await axios.post('http://localhost:8000/batches', batchData);
      setNewBatch({
        product_id: '',
        qty_total: '',
        qty_available: '',
        expiry_hours: '',
        store_id: 1
      });
      fetchData();
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const triggerMarkdown = async () => {
    try {
      await axios.post('http://localhost:8000/markdown/calculate');
      fetchData();
    } catch (error) {
      console.error('Error triggering markdown:', error);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  };

  const getTimeUntilExpiry = (expiryTs) => {
    const now = new Date();
    const expiry = new Date(expiryTs);
    const hours = Math.floor((expiry - now) / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h` : 'Expired';
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>🛠️ Admin Dashboard</h2>
          <p className="text-muted">Manage batches, monitor impact, and control the system</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="impact-number">{impactStats.total_lbs_saved?.toFixed(1) || 0}</div>
              <div className="impact-label">Lbs Saved Today</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="impact-number">{impactStats.total_co2e_avoided?.toFixed(1) || 0}</div>
              <div className="impact-label">kg CO₂e Avoided</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="impact-number">${impactStats.total_revenue_recovered?.toFixed(2) || 0}</div>
              <div className="impact-label">Revenue Recovered</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="impact-number">{batches.length}</div>
              <div className="impact-label">Active Batches</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>📦 Create New Batch</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={createBatch}>
                <Form.Group className="mb-3">
                  <Form.Label>Product</Form.Label>
                  <Form.Select
                    value={newBatch.product_id}
                    onChange={(e) => setNewBatch({...newBatch, product_id: e.target.value})}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.base_price}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Total Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={newBatch.qty_total}
                    onChange={(e) => setNewBatch({...newBatch, qty_total: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Available Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={newBatch.qty_available}
                    onChange={(e) => setNewBatch({...newBatch, qty_available: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Expires In (Hours)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newBatch.expiry_hours}
                    onChange={(e) => setNewBatch({...newBatch, expiry_hours: e.target.value})}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary">
                  Create Batch
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>⚡ System Controls</h5>
            </Card.Header>
            <Card.Body>
              <p>Trigger the markdown engine to create offers for expiring batches.</p>
              <Button onClick={triggerMarkdown} variant="warning" className="mb-3">
                🔄 Calculate Markdowns
              </Button>
              
              <Alert variant="info">
                <strong>Markdown Rules:</strong><br/>
                • Less than 6h: 60% off<br/>
                • Less than 12h: 40% off<br/>
                • Less than 18h: 30% off<br/>
                • More than 18h: 20% off
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>📊 Active Batches</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Total Qty</th>
                    <th>Available</th>
                    <th>Expires In</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => (
                    <tr key={batch.id}>
                      <td>{getProductName(batch.product_id)}</td>
                      <td>{batch.qty_total}</td>
                      <td>{batch.qty_available}</td>
                      <td className={getTimeUntilExpiry(batch.expiry_ts) === 'Expired' ? 'expiry-warning' : ''}>
                        {getTimeUntilExpiry(batch.expiry_ts)}
                      </td>
                      <td>
                        {batch.qty_available > 0 ? (
                          <span className="badge bg-success">Available</span>
                        ) : (
                          <span className="badge bg-secondary">Sold Out</span>
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
    </Container>
  );
};

export default AdminDashboard;
