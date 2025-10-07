import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';

const ImpactDashboard = () => {
  const [impactStats, setImpactStats] = useState({
    total_lbs_saved: 0,
    total_co2e_avoided: 0,
    total_revenue_recovered: 0,
    total_items_rescued: 0
  });
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImpactData();
  }, []);

  const fetchImpactData = async () => {
    setLoading(true);
    try {
      const [impactRes, batchesRes] = await Promise.all([
        axios.get('http://localhost:8000/impact'),
        axios.get('http://localhost:8000/batches')
      ]);
      setImpactStats(impactRes.data);
      setBatches(batchesRes.data);
    } catch (error) {
      console.error('Error fetching impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchImpactData();
  };

  const getTimeUntilExpiry = (expiryTs) => {
    const now = new Date();
    const expiry = new Date(expiryTs);
    const hours = Math.floor((expiry - now) / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h` : 'Expired';
  };

  const getProductName = (productId) => {
    // This would normally come from a products API call
    const products = {
      1: 'Greek Yogurt',
      2: 'Sourdough Bread',
      3: 'Organic Lettuce',
      4: 'Oat Milk',
      5: 'Bananas',
      6: 'Cheddar Cheese',
      7: 'Apples',
      8: 'Deli Ham',
      9: 'Free Range Eggs',
      10: 'Cherry Tomatoes'
    };
    return products[productId] || 'Unknown Product';
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>📊 Impact Dashboard</h2>
              <p className="text-muted">Track your environmental and social impact in real-time</p>
            </div>
            <Button onClick={refreshData} variant="outline-primary" disabled={loading}>
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center impact-metric">
            <Card.Body>
              <div className="impact-number">{impactStats.total_lbs_saved.toFixed(1)}</div>
              <div className="impact-label">Pounds of Food Saved</div>
              <small className="text-muted">Equivalent to {Math.round(impactStats.total_lbs_saved / 2.2)} kg</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center impact-metric">
            <Card.Body>
              <div className="impact-number">{impactStats.total_co2e_avoided.toFixed(1)}</div>
              <div className="impact-label">kg CO₂e Avoided</div>
              <small className="text-muted">Carbon footprint reduction</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center impact-metric">
            <Card.Body>
              <div className="impact-number">${impactStats.total_revenue_recovered.toFixed(2)}</div>
              <div className="impact-label">Revenue Recovered</div>
              <small className="text-muted">From rescued food sales</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center impact-metric">
            <Card.Body>
              <div className="impact-number">{impactStats.total_items_rescued}</div>
              <div className="impact-label">Items Rescued</div>
              <small className="text-muted">Individual food items</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>🌍 Environmental Impact</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Carbon Footprint Reduction</h6>
                <div className="progress mb-2">
                  <div 
                    className="progress-bar bg-success" 
                    style={{width: `${Math.min((impactStats.total_co2e_avoided / 10) * 100, 100)}%`}}
                  ></div>
                </div>
                <small className="text-muted">
                  {impactStats.total_co2e_avoided.toFixed(1)} kg CO₂e avoided
                </small>
              </div>
              
              <div className="mb-3">
                <h6>Food Waste Prevention</h6>
                <div className="progress mb-2">
                  <div 
                    className="progress-bar bg-warning" 
                    style={{width: `${Math.min((impactStats.total_lbs_saved / 50) * 100, 100)}%`}}
                  ></div>
                </div>
                <small className="text-muted">
                  {impactStats.total_lbs_saved.toFixed(1)} lbs of food saved from landfill
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>💰 Economic Impact</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Revenue Recovery</h6>
                <p className="h4 text-success">${impactStats.total_revenue_recovered.toFixed(2)}</p>
                <small className="text-muted">Recovered from food that would have been wasted</small>
              </div>
              
              <div className="mb-3">
                <h6>Cost Savings</h6>
                <p className="h5 text-primary">
                  ${(impactStats.total_revenue_recovered * 0.3).toFixed(2)}
                </p>
                <small className="text-muted">Estimated waste disposal cost savings</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>📈 Active Batches & Impact Potential</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Available</th>
                      <th>Expires In</th>
                      <th>Potential Impact</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map(batch => (
                      <tr key={batch.id}>
                        <td>{getProductName(batch.product_id)}</td>
                        <td>{batch.qty_available} units</td>
                        <td className={getTimeUntilExpiry(batch.expiry_ts) === 'Expired' ? 'text-danger' : ''}>
                          {getTimeUntilExpiry(batch.expiry_ts)}
                        </td>
                        <td>
                          <small>
                            ~{Math.round(batch.qty_available * 0.15 * 2.2)} lbs saved potential
                          </small>
                        </td>
                        <td>
                          {batch.qty_available > 0 ? (
                            <span className="badge bg-success">Available</span>
                          ) : (
                            <span className="badge bg-secondary">Rescued</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>🎯 Impact Goals & Achievements</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center">
                    <h4 className="text-success">🌱 Zero Waste</h4>
                    <p className="small">Every item rescued is one less in the landfill</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <h4 className="text-primary">🤝 Community</h4>
                    <p className="small">Supporting nonprofits and affordable food access</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <h4 className="text-warning">💰 Value</h4>
                    <p className="small">Turning waste into revenue and savings</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ImpactDashboard;
